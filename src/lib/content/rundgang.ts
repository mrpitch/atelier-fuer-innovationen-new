import type { Rundgang, RundgangDocument, Station } from './loader'
import { sumReadingTime } from './reading-time'

// A Rundgang's Stationen count and duration (issue #32) are always derived
// from its ordered Stationen (station.ts), never written in frontmatter.
export function summarizeRundgang(
	document: RundgangDocument,
	stationen: readonly Station[],
): Rundgang {
	return {
		...document,
		stationenCount: stationen.length,
		durationMinutes: sumReadingTime(stationen),
	}
}
