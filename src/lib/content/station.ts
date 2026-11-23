import { PARENT_FIELD } from './errors'
import type { Loaded } from './loader'
import type { Meta } from './order'
import { reconcileOrder } from './order'
import { computeReadingTime } from './reading-time'
import { assertNotDraft, resolveReference } from './references'
import type { Rundgang, Station, Visibility } from './types'
import { stationUrl } from './urls'

const ORT_ID_FIELD = 'ortId'

// Orders one Rundgang's Stationen by its own meta.json (issue #32): strict
// like orderAbschnitte, against every Station, Drafts included. Every
// Station's Ort reference is resolved against the Viertel and the Zentrum
// together (`orte`, every document of both) and a published Station naming a
// Draft Ort fails (issue #33). Then Drafts are left out and the rest
// numbered: counting from 0 when the first published Station stands at the
// Zentrum, from 1 otherwise (ADR-0003, glossary) — decided once from the
// first listed published Station, not per Station. `rundgang` is the
// resolved Rundgang, undefined while it is a Draft in a production graph;
// as with Abschnitt, a published Station inside it fails.
export function orderStationen(
	rundgangDocument: Pick<Loaded<'rundgang'>, 'id' | 'draft'>,
	rundgang: Pick<Rundgang, 'id' | 'url'> | undefined,
	meta: Meta,
	documents: readonly Loaded<'station'>[],
	orte: readonly { readonly id: string; readonly draft: boolean }[],
	zentrumId: string | undefined,
	isVisible: Visibility,
): Station[] {
	const ordered = reconcileOrder(meta, documents, 'Station')
	for (const document of ordered) {
		resolveReference(document, ORT_ID_FIELD, document.ortId, orte, isVisible)
		assertNotDraft(document, PARENT_FIELD, rundgangDocument, isVisible)
	}
	if (!rundgang) return []

	const published = ordered.filter(isVisible)
	const offset = published[0]?.ortId === zentrumId ? 0 : 1

	return published.map(({ file: _file, ...document }, index) => {
		const number = index + offset
		return {
			...document,
			rundgangId: rundgang.id,
			url: stationUrl(rundgang.url, number),
			number,
			readingTimeMinutes: computeReadingTime(document.body),
		}
	})
}
