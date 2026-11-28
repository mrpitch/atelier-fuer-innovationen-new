import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import type { Aufsatz } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface AufsatzDetailProps extends React.ComponentProps<'div'> {
	aufsatz: Aufsatz
	locale?: string
}

// An Aufsatz's own page content (issue #29), shared between its dedicated
// German route (src/app/bibliothek/aufsaetze/[slug]/page.tsx) and the
// catch-all route's prefixed, localized rendering (issue #36). It reads the
// content graph itself: it needs the body and the trail for whichever view
// (German or translated) the route resolved.
async function AufsatzDetail({ aufsatz, locale, ...props }: AufsatzDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(aufsatz.id, locale)

	return (
		<div data-slot="aufsatz-detail" {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(aufsatz.id)} />
			<h1>{aufsatz.title}</h1>
			<p>{t('aufsatz.readingTime', { n: aufsatz.readingTimeMinutes })}</p>
			<Body components={bodyImageComponents(aufsatz.id)} />
		</div>
	)
}

export { AufsatzDetail }
