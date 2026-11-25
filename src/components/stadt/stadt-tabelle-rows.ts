import type { ContentGraph, Rundgang, Viertel, Zentrum } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface StadtTabelleCell {
	readonly label: string
	readonly href?: string
}

interface StadtTabelleRow {
	readonly key: string
	readonly ort: StadtTabelleCell
	readonly station: StadtTabelleCell
	readonly kapitel: StadtTabelleCell
	readonly themenOrt: StadtTabelleCell
}

interface StadtTabelleHeadings {
	readonly station: string
	readonly kapitel: string
}

interface StadtTabelleData {
	readonly headings: StadtTabelleHeadings
	readonly rows: readonly StadtTabelleRow[]
}

const LEER: StadtTabelleCell = { label: t('stadt.hub.tabelleLeer') }

// The Station cell for an Ort (issue #95): the Station it stands at in the
// Schauen Rundgang the column header names (the Zentrum's, see headings) —
// "–" when it has none there, so every row reads against the same Rundgang.
function stationCell(
	graph: ContentGraph,
	ortId: string,
	schauenRundgang: Rundgang | undefined,
): StadtTabelleCell {
	if (!schauenRundgang) return LEER

	const station = graph
		.getStationenByOrt(ortId)
		.find((candidate) => candidate.rundgangId === schauenRundgang.id)
	if (!station) return LEER

	return {
		label: t('stadt.hub.tabelleStation', {
			number: station.number,
			title: shortTitleOrTitle(station),
		}),
		href: station.url,
	}
}

// The Kapitel and Themen-Ort cells for the Zentrum row: "Einführung" links
// to the Leitthema's own page instead of a Kapitel, since the Zentrum has
// none; there is no Themen-Ort to branch off either.
function zentrumRow(
	graph: ContentGraph,
	zentrum: Zentrum,
	schauenRundgang: Rundgang | undefined,
): StadtTabelleRow {
	const { leitthema } = graph

	return {
		key: zentrum.id,
		ort: { label: shortTitleOrTitle(zentrum), href: zentrum.url },
		station: stationCell(graph, zentrum.id, schauenRundgang),
		kapitel: leitthema ? { label: t('stadt.hub.tabelleEinfuehrung'), href: leitthema.url } : LEER,
		themenOrt: LEER,
	}
}

// A Viertel row: its Kapitel in the Leitthema (ADR-0003, "Kapitel n =
// Viertel n") and that Kapitel's own Themen-Ort, if one branches off it.
function viertelRow(
	graph: ContentGraph,
	viertel: Viertel,
	schauenRundgang: Rundgang | undefined,
): StadtTabelleRow {
	const kapitel = graph.getKapitelByViertel(viertel.id)
	const themenOrt = kapitel && graph.getThemenByKapitel(kapitel.id)[0]

	return {
		key: viertel.id,
		ort: {
			label: t('stadt.hub.tabelleOrt', {
				number: formatTwoDigits(viertel.number),
				title: shortTitleOrTitle(viertel),
			}),
			href: viertel.url,
		},
		station: stationCell(graph, viertel.id, schauenRundgang),
		kapitel: kapitel
			? {
					label: t('stadt.hub.tabelleKapitel', {
						number: kapitel.number,
						title: shortTitleOrTitle(kapitel),
					}),
					href: kapitel.url,
				}
			: LEER,
		themenOrt:
			kapitel && themenOrt
				? {
						label: t('stadt.hub.tabelleZweigtAb', {
							title: shortTitleOrTitle(themenOrt),
							number: kapitel.number,
						}),
						href: themenOrt.url,
					}
				: LEER,
	}
}

// The table headings name the Schauen Rundgang of the Zentrum — the one
// every Rundgang in the city starts from — and the Leitthema, by their own
// titles (issue #95); a generic fallback covers the graph having neither.
function headings(
	graph: ContentGraph,
	schauenRundgang: Rundgang | undefined,
): StadtTabelleHeadings {
	const { leitthema } = graph

	return {
		station: schauenRundgang
			? t('stadt.hub.tabelleStationHeading', { title: schauenRundgang.title })
			: t('stadt.hub.tabelleStationHeadingFallback'),
		kapitel: leitthema
			? t('stadt.hub.tabelleKapitelHeading', { title: leitthema.title })
			: t('stadt.hub.tabelleKapitelHeadingFallback'),
	}
}

// The Stadtplan Übersicht table's rows (issue #95): the Zentrum, then every
// Viertel 01–08, in number order — built from the graph once by the caller
// (StadtplanHub) and handed to StadtTabelle as plain data, so the table
// itself stays presentational.
function buildStadtTabelle(
	graph: ContentGraph,
	viertel: readonly Viertel[],
	zentrum: Zentrum | undefined,
): StadtTabelleData {
	const schauenRundgang = zentrum && graph.getSchauenRundgang(zentrum.id)

	return {
		headings: headings(graph, schauenRundgang),
		rows: [
			...(zentrum ? [zentrumRow(graph, zentrum, schauenRundgang)] : []),
			...viertel.map((item) => viertelRow(graph, item, schauenRundgang)),
		],
	}
}

export {
	buildStadtTabelle,
	type StadtTabelleCell,
	type StadtTabelleData,
	type StadtTabelleHeadings,
	type StadtTabelleRow,
}
