import type * as React from 'react'

import { KapitelEbenenLeiste } from '@/components/navigation/kapitel-ebenen-leiste'
import { KapitelThemenWeg } from '@/components/navigation/kapitel-themen-weg'
import { ReadingLayout } from '@/components/navigation/reading-layout'
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
// and previous/next (issue #23). The reading layout's Themen-Weg sidebar and
// Randspalte slot are issue #99.
async function AbschnittDetail({ abschnitt, locale, ...props }: AbschnittDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(abschnitt.id, locale)
	const kapitel = graph.getKapitel(abschnitt.kapitelId)
	if (!kapitel) throw new Error(`AbschnittDetail: unknown Kapitel ID: ${abschnitt.kapitelId}`)

	return (
		<div data-slot="abschnitt-detail" {...props}>
			<KapitelEbenenLeiste kapitel={kapitel} abschnitt={abschnitt} />
			<ReadingLayout
				themenWeg={<KapitelThemenWeg kapitel={kapitel} abschnitt={abschnitt} />}
				themenWegKapitelCount={graph.kapitel.length}
			>
				<h1>
					{t('abschnitt.numberedTitle', { number: abschnitt.number, title: abschnitt.title })}
				</h1>
				<p>{t('abschnitt.readingTime', { n: abschnitt.readingTimeMinutes })}</p>
				<Body components={bodyImageComponents(abschnitt.id)} />
			</ReadingLayout>
		</div>
	)
}

export { AbschnittDetail }
