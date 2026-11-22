import { ContentValidationError } from './errors'
import type { Meta, RundgangDocument, Station, StationDocument } from './loader'
import { shortTitleOrTitle } from './loader'
import type { NavigationLink } from './navigation'
import { computeReadingTime } from './reading-time'
import type { Referenceable } from './references'
import { resolveReference } from './references'

const ORT_ID_FIELD = 'ortId'

// Orders one Rundgang's Stationen by its own meta.json (issue #32): strict
// like orderAbschnitte — every listed ID must match an actual Station
// document, and every actual document must be listed exactly once. A
// Station's number counts from 0 when the first Station in that order
// stands at the Zentrum, from 1 otherwise (ADR-0003, glossary) — decided
// once from the first listed Station's resolved Ort, not per Station.
export function orderStationen(
	rundgang: Pick<RundgangDocument, 'url'>,
	meta: Meta,
	documents: readonly StationDocument[],
	orte: readonly Referenceable[],
	zentrumId: string,
): Station[] {
	const byId = new Map(documents.map((document) => [document.id, document]))
	const seen = new Set<string>()
	const ordered: StationDocument[] = []

	meta.order.forEach((id) => {
		if (seen.has(id)) {
			throw new ContentValidationError(meta.file, id, 'is listed more than once')
		}
		seen.add(id)

		const document = byId.get(id)
		if (!document) {
			throw new ContentValidationError(meta.file, id, 'lists an ID with no matching Station')
		}
		ordered.push(document)
	})

	for (const document of documents) {
		if (!seen.has(document.id)) {
			throw new ContentValidationError(meta.file, document.id, 'is missing from the Station order')
		}
	}

	const resolvedOrtIds = ordered.map(
		(document) => resolveReference(document.file, ORT_ID_FIELD, document.ortId, orte).id,
	)
	const startsAtZentrum = resolvedOrtIds[0] === zentrumId
	const offset = startsAtZentrum ? 0 : 1

	return ordered.map(({ file: _file, ...document }, index) => {
		const number = index + offset
		return {
			...document,
			url: `${rundgang.url}/${number}`,
			number,
			readingTimeMinutes: computeReadingTime(document.body),
		}
	})
}

export interface StationNavigation {
	getPreviousStation(id: string): NavigationLink | undefined
	getNextStation(id: string): NavigationLink | undefined
}

function toLink(station: Station): NavigationLink {
	return { id: station.id, url: station.url, title: shortTitleOrTitle(station) }
}

// Previous/next within one Rundgang (issue #32): unlike Abschnitt, a
// Station's neighbours never cross into another Rundgang.
export function buildStationNavigation(
	stationenByRundgang: ReadonlyMap<string, readonly Station[]>,
): StationNavigation {
	function find(id: string): { sequence: readonly Station[]; index: number } | undefined {
		for (const sequence of stationenByRundgang.values()) {
			const index = sequence.findIndex((station) => station.id === id)
			if (index !== -1) return { sequence, index }
		}
		return undefined
	}

	return {
		getPreviousStation(id) {
			const found = find(id)
			return found && found.index > 0 ? toLink(found.sequence[found.index - 1]) : undefined
		},
		getNextStation(id) {
			const found = find(id)
			return found && found.index < found.sequence.length - 1
				? toLink(found.sequence[found.index + 1])
				: undefined
		},
	}
}
