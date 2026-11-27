import type { ContentGraph, Kapitel, Ort, Station, Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

import type { GangartKarteLink, GangartKarteProps } from './gangart-karte'

// The Viertel or Zentrum name a Station stands at: "Station n · <Viertel>"
// (issue #97's own acceptance criteria) names the place, read from the Ort,
// not the Station's own title: placeholder Stationen carry the Ort's title
// today, but a Station's title is its own and may differ later. A Station
// without an Ort (issue #116) falls back to its own
// title, since there is no place to name — this only shows up here as a
// previous/next neighbour on the one Rundgang with a Schauen Gangart, which
// is never such a Station in the placeholder content.
function ortLabel(graph: ContentGraph, station: Station): string {
	if (station.ortId === undefined) return shortTitleOrTitle(station)
	if (station.ortId === graph.zentrum?.id) return shortTitleOrTitle(graph.zentrum)
	const viertel = graph.getViertel(station.ortId)
	return viertel ? shortTitleOrTitle(viertel) : station.ortId
}

function stationLink(
	graph: ContentGraph,
	station: Station | undefined,
): GangartKarteLink | undefined {
	return (
		station && {
			label: t('stadt.hub.tabelleStation', {
				number: station.number,
				title: ortLabel(graph, station),
			}),
			href: station.url,
		}
	)
}

function kapitelLink(kapitel: Kapitel | undefined): GangartKarteLink | undefined {
	return (
		kapitel && {
			label: t('stadt.hub.tabelleKapitel', {
				number: kapitel.number,
				title: shortTitleOrTitle(kapitel),
			}),
			href: kapitel.url,
		}
	)
}

// The Schauen Gangart-Karte for a Viertel or the Zentrum (issues #97, #98):
// its Station on its own Schauen Rundgang (graph.getSchauenRundgang/
// getSchauenStation, issue #95), with the Rundgang's previous and next
// Station. Undefined when no Rundgang visits this Ort — the card its page
// then leaves out.
function buildSchauenGangart(graph: ContentGraph, ort: Ort): GangartKarteProps | undefined {
	const station = graph.getSchauenStation(ort.id)
	const rundgang = station && graph.getSchauenRundgang(ort.id)
	if (!station || !rundgang) return undefined

	const stationen = graph.getStationenByRundgang(rundgang.id)
	const index = stationen.findIndex((item) => item.id === station.id)
	const erste = stationen[0]

	return {
		badge: t('viertel.wege.schauenBadge', { title: rundgang.title }),
		title: t('stadt.hub.tabelleStation', {
			number: station.number,
			title: shortTitleOrTitle(ort),
		}),
		primary: {
			label: t('viertel.wege.schauenAnsehen', { number: station.number }),
			href: station.url,
		},
		secondary: {
			label: t('viertel.wege.schauenVonVorn', { number: erste.number }),
			href: erste.url,
		},
		previous: stationLink(graph, stationen[index - 1]),
		next: stationLink(graph, stationen[index + 1]),
	}
}

// The Lesen Gangart-Karte for a Viertel (issue #97): its Kapitel in the
// Leitthema (ADR-0003, "Kapitel n = Viertel n"), with the previous and next
// Kapitel in number order. Undefined when the Viertel has no Kapitel, or the
// graph has no Leitthema to link "Alle n Kapitel" to.
function buildLesenGangart(graph: ContentGraph, viertel: Viertel): GangartKarteProps | undefined {
	const kapitel = graph.getKapitelByViertel(viertel.id)
	const { leitthema } = graph
	if (!kapitel || !leitthema) return undefined

	const index = graph.kapitel.findIndex((item) => item.id === kapitel.id)

	return {
		badge: t('viertel.wege.lesenBadge', { title: leitthema.title }),
		title: t('stadt.hub.tabelleKapitel', {
			number: kapitel.number,
			title: shortTitleOrTitle(kapitel),
		}),
		primary: {
			label: t('viertel.heroKapitelAction', { number: kapitel.number }),
			href: kapitel.url,
		},
		secondary: {
			label: t('viertel.wege.lesenAlle', { count: graph.kapitel.length }),
			href: leitthema.url,
		},
		previous: kapitelLink(graph.kapitel[index - 1]),
		next: kapitelLink(graph.kapitel[index + 1]),
	}
}

export { buildLesenGangart, buildSchauenGangart }
