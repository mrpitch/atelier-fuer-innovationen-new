import { ContentValidationError } from './errors'
import type { Kapitel, KapitelDocument, Viertel } from './loader'
import { resolveReference } from './references'

const VIERTEL_ID_FIELD = 'viertelId'

function kapitelUrl(viertelId: string, number: number): string {
	const viertelSlug = viertelId.split('/').at(-1)
	return `/stadt/${viertelSlug}/kapitel-${number}`
}

// Resolves each Kapitel's Viertel reference and derives its number and URL
// from that Viertel (issue #30, ADR-0003): "Kapitel n = Viertel n" by
// construction, never written in frontmatter. A Viertel has at most one
// Kapitel — a second one referencing the same Viertel is an error, the same
// kind of strict reconciliation orderViertel and orderAbschnitte do.
export function resolveKapitel(
	documents: readonly KapitelDocument[],
	viertel: readonly Viertel[],
): Kapitel[] {
	const kapitelIdByViertelId = new Map<string, string>()

	const resolved = documents.map(({ file, ...document }) => {
		const resolvedViertel = resolveReference(file, VIERTEL_ID_FIELD, document.viertelId, viertel)

		const existingKapitelId = kapitelIdByViertelId.get(document.viertelId)
		if (existingKapitelId) {
			throw new ContentValidationError(
				file,
				VIERTEL_ID_FIELD,
				`Viertel "${document.viertelId}" already has a Kapitel: ${existingKapitelId}`,
			)
		}
		kapitelIdByViertelId.set(document.viertelId, document.id)

		return {
			...document,
			number: resolvedViertel.number,
			url: kapitelUrl(document.viertelId, resolvedViertel.number),
		}
	})

	return resolved.sort((a, b) => a.number - b.number)
}
