import { buildLesenGangart } from '@/components/viertel/gangarten'
import { buildZentrumLesenGangart } from '@/components/zentrum/gangarten'
import type { ContentGraph, Ort, Viertel } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

// Whether `ort` is a Viertel, narrowing its type structurally: only a
// Viertel carries a `number` (the Zentrum, issue #116's own `Zentrum` type,
// has none). An id comparison against `graph.zentrum?.id` reads just as
// well (viertel/gangarten.ts's own `ortLabel`) but can't narrow `ort`'s type
// this way — Zentrum's shape is a subset of Viertel's, so TypeScript can't
// tell the two apart from a value comparison alone.
function ortIsViertel(ort: Ort): ort is Viertel {
	return 'number' in ort
}

// A Station's own Ort (Viertel or Zentrum), resolved from its optional
// `ortId` — undefined for a Station with none, same as the reference itself.
function resolveOrt(graph: ContentGraph, ortId: string | undefined): Ort | undefined {
	if (ortId === undefined) return undefined
	if (ortId === graph.zentrum?.id) return graph.zentrum
	return graph.getViertel(ortId)
}

// The Gangart switch on a Station page at an Ort (Figma T06, issue #121):
// "Kapitel n lesen" (or "Einführung lesen" for the Zentrum) into the Ort's
// own Lesen Gangart, through the same helpers the Viertel and Zentrum pages
// use for their own Gangart-Karte (viertel/gangarten.ts, zentrum/gangarten.ts)
// — and "oder Viertel nn frei erkunden" (or "oder das Zentrum frei erkunden")
// back to the Ort's own page. The switch's illustration names the Leitthema,
// not the Ort or the Rundgang, since it's the destination the switch leads
// to. `aktion` is undefined wherever those helpers are (no Leitthema, or — a
// Viertel only — no Kapitel of its own yet, graph.ts: "a Viertel has at most
// one" — zero is a valid state): the caller then leaves just the Kapitel-
// lesen item out. The Ort link stays — it needs only the Ort itself, not its
// Kapitel/Leitthema content — same as the caller leaving the whole switch
// out for a Station with no Ort at all.
interface StationGangartAktion {
	readonly illustrationId: string
	readonly illustrationLabel: string
	readonly title: string
	readonly aktionLabel: string
	readonly aktionHref: string
}

interface StationGangart {
	readonly aktion: StationGangartAktion | undefined
	readonly erkundenLabel: string
	readonly erkundenHref: string
}

function buildStationGangart(graph: ContentGraph, ort: Ort): StationGangart {
	const { leitthema } = graph
	const lesenGangart = leitthema
		? ortIsViertel(ort)
			? buildLesenGangart(graph, ort)
			: buildZentrumLesenGangart(graph)
		: undefined

	const aktion =
		leitthema && lesenGangart
			? {
					illustrationId: leitthema.id,
					illustrationLabel: leitthema.title,
					title: lesenGangart.title,
					aktionLabel: lesenGangart.primary.label,
					aktionHref: lesenGangart.primary.href,
				}
			: undefined

	const erkundenLabel = ortIsViertel(ort)
		? t('rundgang.gangartViertelErkunden', { number: formatTwoDigits(ort.number) })
		: t('rundgang.gangartZentrumErkunden')

	return {
		aktion,
		erkundenLabel,
		erkundenHref: ort.url,
	}
}

export { buildStationGangart, ortIsViertel, resolveOrt, type StationGangart }
