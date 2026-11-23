import type { Loaded } from './loader'
import { computeReadingTime } from './reading-time'
import { resolveReference } from './references'
import type { Aufsatz, Visibility } from './types'
import { pathUrl } from './urls'

const VIERTEL_ID_FIELD = 'viertelId'

// Resolves every Aufsatz's Viertel reference and computes its reading time
// (issue #29). The reference is checked against every Viertel document,
// Drafts included, for every Aufsatz — a Draft Aufsatz is still fully
// validated — and a published Aufsatz naming a Draft Viertel fails (issue
// #33). The reference check reuses references.ts's one generic resolver.
export function resolveAufsaetze(
	documents: readonly Loaded<'aufsatz'>[],
	viertel: readonly Loaded<'viertel'>[],
	isVisible: Visibility,
): Aufsatz[] {
	return documents
		.map((document) => {
			resolveReference(document, VIERTEL_ID_FIELD, document.viertelId, viertel, isVisible)
			return document
		})
		.filter(isVisible)
		.map(({ file: _file, ...document }) => ({
			...document,
			url: pathUrl(document.id),
			readingTimeMinutes: computeReadingTime(document.body),
		}))
}
