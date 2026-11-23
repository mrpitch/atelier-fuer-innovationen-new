import Link from 'next/link'
import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { Illustration } from '@/components/ui/illustration'
import type { Rundgang } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface RundgangDetailProps extends React.ComponentProps<'div'> {
	rundgang: Rundgang
	locale?: string
}

// A Rundgang's own page content (issue #32), shared between its dedicated
// German route and the catch-all route's localized rendering (issue #36).
async function RundgangDetail({ rundgang, locale, ...props }: RundgangDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(rundgang.id, locale)
	const stationen = graph.getStationenByRundgang(rundgang.id)
	const stationenCount = t('rundgang.stationenCount', { n: rundgang.stationenCount })

	return (
		<div data-slot="rundgang-detail" {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(rundgang.id)} />
			<Illustration id={rundgang.id} label={rundgang.title} />
			<h1>{rundgang.title}</h1>
			<p>{t('rundgang.duration', { n: rundgang.durationMinutes })}</p>
			<Body components={bodyImageComponents(rundgang.id)} />
			<nav aria-label={stationenCount}>
				<h2>{stationenCount}</h2>
				<ol>
					{stationen.map((station) => (
						<li key={station.id}>
							<Link href={station.url}>
								{t('station.numberedTitle', {
									n: station.number,
									title: shortTitleOrTitle(station),
								})}
							</Link>
						</li>
					))}
				</ol>
			</nav>
		</div>
	)
}

export { RundgangDetail }
