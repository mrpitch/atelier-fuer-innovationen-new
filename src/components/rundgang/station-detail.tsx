import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import type { Station } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface StationDetailProps extends React.ComponentProps<'div'> {
	station: Station
	locale?: string
}

// A Station's own page content (issue #32), shared between its dedicated
// German route and the catch-all route's localized rendering (issue #36). The
// heading is the full title, not the Short title (issue #23).
async function StationDetail({ station, locale, ...props }: StationDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(station.id, locale)

	return (
		<div data-slot="station-detail" {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(station.id)} />
			<h1>{t('station.numberedTitle', { n: station.number, title: station.title })}</h1>
			<p>{t('station.readingTime', { n: station.readingTimeMinutes })}</p>
			<Body components={bodyImageComponents(station.id)} />
			<PreviousNext previous={graph.getPrevious(station.id)} next={graph.getNext(station.id)} />
		</div>
	)
}

export { StationDetail }
