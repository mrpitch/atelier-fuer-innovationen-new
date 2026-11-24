import Link from 'next/link'
import type * as React from 'react'

import { AufsaetzeListe } from '@/components/aufsatz/aufsaetze-liste'
import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { StationenListe } from '@/components/rundgang/stationen-liste'
import { Illustration } from '@/components/ui/illustration'
import type { Viertel } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

import { Steckbrief } from './steckbrief'

interface ViertelDetailProps extends React.ComponentProps<'div'> {
	viertel: Viertel
	locale?: string
}

// A Viertel's own page content (issue #28), shared between its dedicated
// German route (src/app/stadt/[viertel]/page.tsx) and the catch-all route's
// prefixed, localized rendering (issue #36) — the two routes differ only in
// which Viertel view (German or translated) they resolve, not in how that
// view is rendered. Its Kapitel, Aufsätze and Stationen are the German
// documents' related lists (content-layer.md).
async function ViertelDetail({ viertel, locale, ...props }: ViertelDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(viertel.id, locale)
	const kapitel = graph.getKapitelByViertel(viertel.id)

	return (
		<div data-slot="viertel-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(viertel.id)}
				previous={graph.getPrevious(viertel.id)}
				next={graph.getNext(viertel.id)}
			/>
			<Illustration id={viertel.id} label={viertel.title} />
			<h1>{viertel.title}</h1>
			<Steckbrief leitsatz={viertel.leitsatz} steckbrief={viertel.steckbrief} />
			<Body components={bodyImageComponents(viertel.id)} />
			{kapitel && (
				<nav aria-label={t('viertel.kapitelHeading')}>
					<h2>{t('viertel.kapitelHeading')}</h2>
					<Link href={kapitel.url}>
						{t('kapitel.numberedTitle', { n: kapitel.number, title: shortTitleOrTitle(kapitel) })}
					</Link>
				</nav>
			)}
			<AufsaetzeListe aufsaetze={graph.getAufsaetzeByViertel(viertel.id)} />
			<StationenListe stationen={graph.getStationenByOrt(viertel.id)} />
		</div>
	)
}

export { ViertelDetail }
