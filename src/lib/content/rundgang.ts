import type { Loaded } from './loader'
import type { Meta } from './order'
import { reconcileOrder } from './order'
import { sumReadingTime } from './reading-time'
import { resolveReference } from './references'
import type { Rundgang, Station, Visibility } from './types'
import { pathUrl } from './urls'

const THEMA_ID_FIELD = 'themaId'

// Orders every Rundgang by rundgaenge/meta.json (issue #116): strict like
// orderViertel, against every Rundgang document, Drafts included — a
// Rundgang's own number, previous/next and the Schauen Gangart
// (graph.ts's schauenRundgangFor) all follow this order. A Rundgang's
// optional Thema reference is resolved here too, against every Thema
// document; a published Rundgang naming a missing or Draft Thema fails
// (issue #33), the same split resolveThemen's optional `kapitelId` makes.
export function orderRundgaenge(
	meta: Meta,
	documents: readonly Loaded<'rundgang'>[],
	themen: readonly Loaded<'thema'>[],
	isVisible: Visibility,
): Loaded<'rundgang'>[] {
	const ordered = reconcileOrder(meta, documents, 'Rundgang')
	for (const document of ordered) {
		if (document.themaId !== undefined) {
			resolveReference(document, THEMA_ID_FIELD, document.themaId, themen, isVisible)
		}
	}
	return ordered
}

// A Rundgang's Stationen count and duration (issue #32) are always derived
// from its ordered, published Stationen (station.ts), never written in
// frontmatter. Its URL is its folder path (ADR-0003); `number` is its
// 1-based position among the published Rundgänge (orderRundgaenge above),
// assigned by the caller the same way orderViertel assigns a Viertel's.
export function summarizeRundgang(
	{ file: _file, ...document }: Loaded<'rundgang'>,
	stationen: readonly Station[],
	number: number,
): Rundgang {
	return {
		...document,
		url: pathUrl(document.id),
		number,
		stationenCount: stationen.length,
		durationMinutes: sumReadingTime(stationen),
	}
}
