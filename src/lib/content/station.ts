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
// like orderAbschnitte, against every Station, Drafts included. A Station's
// Ort reference is optional (issue #116: some Stationen stand at none); when
// set it is resolved against the Viertel and the Zentrum together (`orte`,
// every document of both) and a published Station naming a Draft Ort fails
// (issue #33). Then Drafts are left out and the rest numbered: counting from
// 0 when the first published Station stands at the Zentrum, from 1
// otherwise (ADR-0003, glossary) — decided once from the first listed
// published Station, not per Station. `rundgang` is the resolved Rundgang,
// undefined while it is a Draft in a production graph; as with Abschnitt, a
// published Station inside it fails.
//
// `lastNumber` (issue #116) is the last published Station's own number
// ("Station n von N"), the same for every Station of this Rundgang;
// `remainingMinutes` sums this Station's and every following Station's
// reading time, computed as a reverse running total over the same order.
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
		if (document.ortId !== undefined) {
			resolveReference(document, ORT_ID_FIELD, document.ortId, orte, isVisible)
		}
		assertNotDraft(document, PARENT_FIELD, rundgangDocument, isVisible)
	}
	if (!rundgang) return []

	const published = ordered.filter(isVisible)
	const offset = published[0]?.ortId === zentrumId ? 0 : 1
	const lastNumber = offset + published.length - 1

	const readingTimes = published.map((document) => computeReadingTime(document.body))
	const remainingMinutes: number[] = []
	let runningTotal = 0
	for (let index = readingTimes.length - 1; index >= 0; index -= 1) {
		runningTotal += readingTimes[index]
		remainingMinutes[index] = runningTotal
	}

	return published.map(({ file: _file, ...document }, index) => {
		const number = index + offset
		return {
			...document,
			rundgangId: rundgang.id,
			url: stationUrl(rundgang.url, number),
			number,
			lastNumber,
			readingTimeMinutes: readingTimes[index],
			remainingMinutes: remainingMinutes[index],
		}
	})
}
