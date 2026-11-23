import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
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

	return (
		<div data-slot="abschnitt-detail" {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(abschnitt.id)} />
			<h1>{t('abschnitt.numberedTitle', { number: abschnitt.number, title: abschnitt.title })}</h1>
			<p>{t('abschnitt.readingTime', { n: abschnitt.readingTimeMinutes })}</p>
			<Body components={bodyImageComponents(abschnitt.id)} />
			<PreviousNext previous={graph.getPrevious(abschnitt.id)} next={graph.getNext(abschnitt.id)} />
		</div>
	)
}

export { AbschnittDetail }
