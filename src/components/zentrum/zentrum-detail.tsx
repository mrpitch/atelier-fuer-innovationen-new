import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { StationenListe } from '@/components/rundgang/stationen-liste'
import { Illustration } from '@/components/ui/illustration'
import type { Zentrum } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { bodyImageComponents } from '@/mdx-components'

interface ZentrumDetailProps extends React.ComponentProps<'div'> {
	zentrum: Zentrum
	locale?: string
}

// The Zentrum's own page content (issue #28), shared between its dedicated
// German route and the catch-all route's localized rendering (issue #36).
async function ZentrumDetail({ zentrum, locale, ...props }: ZentrumDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(zentrum.id, locale)

	return (
		<div data-slot="zentrum-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(zentrum.id)}
				previous={graph.getPrevious(zentrum.id)}
				next={graph.getNext(zentrum.id)}
			/>
			<Illustration id={zentrum.id} label={zentrum.title} />
			<h1>{zentrum.title}</h1>
			<Body components={bodyImageComponents(zentrum.id)} />
			<StationenListe stationen={graph.getStationenByOrt(zentrum.id)} />
		</div>
	)
}

export { ZentrumDetail }
