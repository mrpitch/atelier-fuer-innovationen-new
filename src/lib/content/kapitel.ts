import { ContentValidationError } from './errors'
import type { Loaded } from './loader'
import { resolveReference } from './references'
import type { Kapitel, Viertel, Visibility } from './types'
import { kapitelUrl } from './urls'

const VIERTEL_ID_FIELD = 'viertelId'

// Resolves each Kapitel's Viertel reference and derives its number and URL
// from that Viertel (issue #30, ADR-0003): "Kapitel n = Viertel n" by
// construction, never written in frontmatter, and its URL is its Viertel's
// own resolved URL plus `kapitel-{n}`. A Viertel has at most one Kapitel — a
// second one referencing the same Viertel, Draft or not, is an error, the
// same kind of strict reconciliation orderViertel does. The reference is
// checked against every Viertel document (`allViertel`); the number and URL
// come from the published ones (`viertel`), which is where a published
// Kapitel's Viertel is guaranteed to be.
export function resolveKapitel(
	documents: readonly Loaded<'kapitel'>[],
	allViertel: readonly Loaded<'viertel'>[],
	viertel: readonly Viertel[],
	isVisible: Visibility,
): Kapitel[] {
	const kapitelIdByViertelId = new Map<string, string>()
	const viertelById = new Map(viertel.map((item) => [item.id, item]))

	const resolved = documents.flatMap(({ file, ...document }) => {
		resolveReference(
			{ file, draft: document.draft },
			VIERTEL_ID_FIELD,
			document.viertelId,
			allViertel,
			isVisible,
		)

		const existingKapitelId = kapitelIdByViertelId.get(document.viertelId)
		if (existingKapitelId) {
			throw new ContentValidationError(
				file,
				VIERTEL_ID_FIELD,
				`Viertel "${document.viertelId}" already has a Kapitel: ${existingKapitelId}`,
			)
		}
		kapitelIdByViertelId.set(document.viertelId, document.id)

		const resolvedViertel = viertelById.get(document.viertelId)
		if (!isVisible(document) || !resolvedViertel) return []
		return [
			{
				...document,
				number: resolvedViertel.number,
				url: kapitelUrl(resolvedViertel.url, resolvedViertel.number),
			},
		]
	})

	return resolved.sort((a, b) => a.number - b.number)
}
