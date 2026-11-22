import type { Aufsatz, AufsatzDocument, Viertel } from './loader'
import { computeReadingTime } from './reading-time'
import { resolveReference } from './references'

const VIERTEL_ID_FIELD = 'viertelId'

// Resolves every Aufsatz's Viertel reference and computes its reading time
// (issue #29). The reference check reuses references.ts's one generic
// resolver — the same function a later reference field would call against
// its own target collection, with no resolution code of its own.
export function resolveAufsaetze(
	documents: readonly AufsatzDocument[],
	viertel: readonly Viertel[],
): Aufsatz[] {
	return documents.map(({ file, ...document }) => {
		resolveReference(file, VIERTEL_ID_FIELD, document.viertelId, viertel)
		return { ...document, readingTimeMinutes: computeReadingTime(document.body) }
	})
}
