import type { Loaded } from './loader'
import { sumReadingTime } from './reading-time'
import type { Rundgang, Station } from './types'
import { pathUrl } from './urls'

// A Rundgang's Stationen count and duration (issue #32) are always derived
// from its ordered, published Stationen (station.ts), never written in
// frontmatter. Its URL is its folder path (ADR-0003).
export function summarizeRundgang(
	{ file: _file, ...document }: Loaded<'rundgang'>,
	stationen: readonly Station[],
): Rundgang {
	return {
		...document,
		url: pathUrl(document.id),
		stationenCount: stationen.length,
		durationMinutes: sumReadingTime(stationen),
	}
}
