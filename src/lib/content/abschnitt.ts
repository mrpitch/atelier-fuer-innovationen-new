import { ContentValidationError } from './errors'
import type { Abschnitt, AbschnittDocument, Kapitel, Meta } from './loader'
import { shortTitleOrTitle } from './loader'
import type { NavigationLink } from './navigation'
import { computeReadingTime } from './reading-time'

// Orders one Kapitel's Abschnitte by its own meta.json (issue #30): strict
// like orderViertel — every listed ID must match an actual Abschnitt
// document, and every actual document must be listed exactly once. Derives
// each Abschnitt's position, number ("{kapitelNumber}.{position}", e.g.
// "4.3"), URL and reading time; none of these are ever written in
// frontmatter.
export function orderAbschnitte(
	kapitel: Kapitel,
	meta: Meta,
	documents: readonly AbschnittDocument[],
): Abschnitt[] {
	const byId = new Map(documents.map((document) => [document.id, document]))
	const seen = new Set<string>()
	const ordered: Abschnitt[] = []

	meta.order.forEach((id, index) => {
		if (seen.has(id)) {
			throw new ContentValidationError(meta.file, id, 'is listed more than once')
		}
		seen.add(id)

		const document = byId.get(id)
		if (!document) {
			throw new ContentValidationError(meta.file, id, 'lists an ID with no matching Abschnitt')
		}

		const position = index + 1
		ordered.push({
			...document,
			url: `${kapitel.url}/${position}`,
			position,
			number: `${kapitel.number}.${position}`,
			readingTimeMinutes: computeReadingTime(document.body),
		})
	})

	for (const document of documents) {
		if (!seen.has(document.id)) {
			throw new ContentValidationError(
				meta.file,
				document.id,
				'is missing from the Abschnitt order',
			)
		}
	}

	return ordered
}

export interface AbschnittNavigation {
	getPreviousAbschnitt(id: string): NavigationLink | undefined
	getNextAbschnitt(id: string): NavigationLink | undefined
}

function toLink(abschnitt: Abschnitt): NavigationLink {
	return { id: abschnitt.id, url: abschnitt.url, title: shortTitleOrTitle(abschnitt) }
}

// Previous/next across every Abschnitt, in Kapitel number order (issue #30):
// the last Abschnitt of one Kapitel runs on to the first of the next, so
// reading follows the Leitthema's walk through the Viertel instead of
// stopping at a Kapitel's own boundary.
export function buildAbschnittNavigation(
	kapitel: readonly Kapitel[],
	abschnitteByKapitel: ReadonlyMap<string, readonly Abschnitt[]>,
): AbschnittNavigation {
	const sequence = [...kapitel]
		.sort((a, b) => a.number - b.number)
		.flatMap((item) => abschnitteByKapitel.get(item.id) ?? [])

	function indexOf(id: string): number {
		return sequence.findIndex((abschnitt) => abschnitt.id === id)
	}

	return {
		getPreviousAbschnitt(id) {
			const index = indexOf(id)
			return index > 0 ? toLink(sequence[index - 1]) : undefined
		},
		getNextAbschnitt(id) {
			const index = indexOf(id)
			return index !== -1 && index < sequence.length - 1 ? toLink(sequence[index + 1]) : undefined
		},
	}
}
