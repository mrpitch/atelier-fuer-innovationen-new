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

// The Station cell for an Ort: the Station it stands at in its own Schauen
// Rundgang, the same rule as its page's Schauen Gangart-Karte
// (viertel/gangarten.ts) — "–" when no Rundgang visits it. `mitRundgang` adds
// the Rundgang's title when the table spans several Rundgänge, so a cell
// still says which one its Station belongs to.
function stationCell(graph: ContentGraph, ortId: string, mitRundgang: boolean): StadtTabelleCell {
	const station = graph.getSchauenStation(ortId)
	const rundgang = graph.getSchauenRundgang(ortId)
	if (!station || !rundgang) return LEER

	const label = mitRundgang
		? t('stadt.hub.tabelleStationRundgang', {
				number: station.number,
				title: shortTitleOrTitle(station),
				rundgang: shortTitleOrTitle(rundgang),
			})
		: t('stadt.hub.tabelleStation', {
				number: station.number,
				title: shortTitleOrTitle(station),
			})

	return { label, href: station.url }
}

// The Kapitel and Themen-Ort cells for the Zentrum row: "Einführung" links
// to the Leitthema's own page instead of a Kapitel, since the Zentrum has
// none; there is no Themen-Ort to branch off either.
function zentrumRow(graph: ContentGraph, zentrum: Zentrum, mitRundgang: boolean): StadtTabelleRow {
	const { leitthema } = graph

	return {
		key: zentrum.id,
		ort: { label: shortTitleOrTitle(zentrum), href: zentrum.url },
		station: stationCell(graph, zentrum.id, mitRundgang),
		kapitel: leitthema ? { label: t('stadt.hub.tabelleEinfuehrung'), href: leitthema.url } : LEER,
		themenOrt: LEER,
	}
}

// A Viertel row: its Kapitel in the Leitthema (ADR-0003, "Kapitel n =
// Viertel n") and that Kapitel's own Themen-Ort, if one branches off it.
function viertelRow(graph: ContentGraph, viertel: Viertel, mitRundgang: boolean): StadtTabelleRow {
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
		station: stationCell(graph, viertel.id, mitRundgang),
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

// The table headings name the Leitthema by its own title (issue #95), and the
// Schauen Rundgang when one covers every Ort in the table. Each Ort reads its
// own Schauen Rundgang, so with several the Station header stays generic and
// the cells name their Rundgang instead; a generic fallback also covers the
// graph having no Rundgang or Leitthema.
function headings(graph: ContentGraph, rundgaenge: readonly Rundgang[]): StadtTabelleHeadings {
	const { leitthema } = graph
	const [einziger, ...weitere] = rundgaenge

	return {
		station:
			einziger && weitere.length === 0
				? t('stadt.hub.tabelleStationHeading', { title: einziger.title })
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
	const orte = [...(zentrum ? [zentrum] : []), ...viertel]
	const rundgaenge = [
		...new Set(orte.map((ort) => graph.getSchauenRundgang(ort.id)).filter((r) => r !== undefined)),
	]
	const mitRundgang = rundgaenge.length > 1

	return {
		headings: headings(graph, rundgaenge),
		rows: [
			...(zentrum ? [zentrumRow(graph, zentrum, mitRundgang)] : []),
			...viertel.map((item) => viertelRow(graph, item, mitRundgang)),
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
