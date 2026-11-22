import { ContentValidationError } from './errors'
import type { Viertel, ViertelDocument, ViertelOrder } from './loader'

// A Viertel's number is its 1-based position in the Viertel order file, and
// never comes from frontmatter (issue #28). Strict like meta.json's
// orderChildren (navigation.ts): every listed ID must match an actual
// Viertel document, and every actual Viertel document must be listed
// exactly once.
export function orderViertel(
	order: ViertelOrder,
	documents: readonly ViertelDocument[],
): Viertel[] {
	const byId = new Map(documents.map((document) => [document.id, document]))
	const seen = new Set<string>()
	const ordered: Viertel[] = []

	order.order.forEach((id, index) => {
		if (seen.has(id)) {
			throw new ContentValidationError(order.file, id, 'is listed more than once')
		}
		seen.add(id)

		const document = byId.get(id)
		if (!document) {
			throw new ContentValidationError(order.file, id, 'lists an ID with no matching Viertel')
		}
		ordered.push({ ...document, number: index + 1 })
	})

	for (const document of documents) {
		if (!seen.has(document.id)) {
			throw new ContentValidationError(order.file, document.id, 'is missing from the Viertel order')
		}
	}

	return ordered
}
