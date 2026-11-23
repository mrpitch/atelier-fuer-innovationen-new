import { ContentValidationError } from './errors'

// A meta.json file's own content, read once by loader.ts.
export interface Meta {
	// The meta.json path relative to the content directory, for error messages.
	readonly file: string
	readonly order: readonly string[]
}

// The one strict order reconciliation behind every order file (issue #26):
// Seite Navigation, the Viertel order (stadt/meta.json), a Kapitel's
// Abschnitt order and a Rundgang's Station order. Every listed ID must match
// an actual document, and every actual document must be listed exactly once;
// anything else throws naming the meta.json file and the ID. `label` names
// the document type in the error reason. Drafts are still real files, so a
// caller reconciles against the full set and only then hides Drafts.
export function reconcileOrder<T extends { readonly id: string }>(
	meta: Meta,
	documents: readonly T[],
	label: string,
): T[] {
	const byId = new Map(documents.map((document) => [document.id, document]))
	const seen = new Set<string>()
	const ordered: T[] = []

	for (const id of meta.order) {
		if (seen.has(id)) {
			throw new ContentValidationError(meta.file, id, 'is listed more than once')
		}
		seen.add(id)

		const document = byId.get(id)
		if (!document) {
			throw new ContentValidationError(meta.file, id, `lists an ID with no matching ${label}`)
		}
		ordered.push(document)
	}

	for (const document of documents) {
		if (!seen.has(document.id)) {
			throw new ContentValidationError(meta.file, document.id, `is missing from the ${label} order`)
		}
	}

	return ordered
}
