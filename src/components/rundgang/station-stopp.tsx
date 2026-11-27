import { RoutenStopp } from '@/components/navigation/routen-stopp'
import { Stopp, type StoppStatus } from '@/components/navigation/stopp'
import type { Rundgang, Station } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'

// The one rule for a Station without an Ort (issue #116: some stand at
// none): wherever a Station shows an illustration it shows its Ort's, and
// without an Ort it shows its Rundgang's. Used by the Rundgang-Übersicht's
// Stationen, the Stationsnavigation and the Stations-Bühne.
function stationIllustrationId(station: Station, rundgang: Pick<Rundgang, 'id'>) {
	return station.ortId ?? rundgang.id
}

// A Station's own Stopp (issues #118, #119, #120): a Stopp with the Station's
// Ort's illustration, or, when it stands at none, a Routen-Stopp, the numbered
// marker that carries no illustration at all (Figma draws the Route that
// way, so it does not fall back to the Rundgang's illustration like
// stationIllustrationId). The accessible label is the Station's own name, not
// the Ort's — the link goes to the Station, not the Ort page. Shared by the
// Weg-Leiste's Rundgang mode, the Rundgang-Eintrag's route row (every Stopp
// "offen": neither tracks a current position) and the Stationsnavigation,
// which passes the Station's actual "gesehen"/"aktuell"/"offen" status.
function stationStopp(station: Station, status: StoppStatus = 'offen') {
	const name = shortTitleOrTitle(station)
	return station.ortId ? (
		<Stopp
			key={station.id}
			href={station.url}
			nummer={station.number}
			illustrationId={station.ortId}
			illustrationLabel={name}
			status={status}
		/>
	) : (
		<RoutenStopp
			key={station.id}
			href={station.url}
			nummer={station.number}
			name={name}
			status={status}
		/>
	)
}

export { stationIllustrationId, stationStopp }
