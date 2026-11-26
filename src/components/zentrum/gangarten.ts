import type { GangartKarteProps } from '@/components/viertel/gangart-karte'
import type { ContentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

// The Lesen Gangart-Karte for the Zentrum (issue #98): the Leitthema's own
// "Einführung" (the same label stadt-tabelle-rows.ts's zentrumRow links to
// the Leitthema with), since the Zentrum has no Kapitel of its own to read
// instead. Undefined when the graph has no Leitthema to link to.
function buildZentrumLesenGangart(graph: ContentGraph): GangartKarteProps | undefined {
	const { leitthema } = graph
	if (!leitthema) return undefined

	return {
		badge: t('viertel.wege.lesenBadge', { title: leitthema.title }),
		title: t('stadt.hub.tabelleEinfuehrung'),
		primary: { label: t('zentrum.wege.lesenEinfuehrung'), href: leitthema.url },
		secondary: {
			label: t('viertel.wege.lesenAlle', { count: graph.kapitel.length }),
			href: leitthema.url,
		},
	}
}

export { buildZentrumLesenGangart }
