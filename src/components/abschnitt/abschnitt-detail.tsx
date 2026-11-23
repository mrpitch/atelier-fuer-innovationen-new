import type * as React from 'react'

import { EbenenLeiste } from '@/components/navigation/ebenen-leiste'
import { Illustration } from '@/components/ui/illustration'
import type { Abschnitt } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface AbschnittDetailProps extends React.ComponentProps<'div'> {
	abschnitt: Abschnitt
	locale?: string
}

// An Abschnitt's own page content (issue #30), shared between its dedicated
// German route and the catch-all route's localized rendering (issue #36). The
// heading is the full title: the Short title is only for Menus, breadcrumbs
// and previous/next (issue #23).
async function AbschnittDetail({ abschnitt, locale, ...props }: AbschnittDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(abschnitt.id, locale)
	const kapitel = graph.getKapitel(abschnitt.kapitelId)
	if (!kapitel) throw new Error(`AbschnittDetail: unknown Kapitel ID: ${abschnitt.kapitelId}`)
	const ort = graph.getViertel(kapitel.viertelId)
	if (!ort) throw new Error(`AbschnittDetail: unknown Viertel ID: ${kapitel.viertelId}`)
	const abschnitteTotal = graph.getAbschnitteByKapitel(kapitel.id).length

	return (
		<div data-slot="abschnitt-detail" {...props}>
			<EbenenLeiste
				ort={ort}
				illustration={<Illustration id={ort.id} label={ort.title} />}
				breadcrumbs={graph.getBreadcrumbs(abschnitt.id)}
				// The Viertel count, not graph.kapitel.length: see kapitel-detail.tsx.
				kapitel={{ number: kapitel.number, total: graph.viertel.length }}
				abschnitt={{ position: abschnitt.position, total: abschnitteTotal }}
			/>
			<h1>{t('abschnitt.numberedTitle', { number: abschnitt.number, title: abschnitt.title })}</h1>
			<p>{t('abschnitt.readingTime', { n: abschnitt.readingTimeMinutes })}</p>
			<Body components={bodyImageComponents(abschnitt.id)} />
		</div>
	)
}

export { AbschnittDetail }
