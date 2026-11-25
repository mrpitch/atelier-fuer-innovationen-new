import Link from 'next/link'
import type * as React from 'react'

import { KapitelEbenenLeiste } from '@/components/navigation/kapitel-ebenen-leiste'
import { KapitelThemenWeg } from '@/components/navigation/kapitel-themen-weg'
import { ReadingLayout } from '@/components/navigation/reading-layout'
import type { Kapitel } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface KapitelDetailProps extends React.ComponentProps<'div'> {
	kapitel: Kapitel
	locale?: string
}

// A Kapitel's own page content (issue #30), shared between its dedicated
// German route and the catch-all route's localized rendering (issue #36).
// Its Abschnitte and Themen-Orte are the German documents' lists, as the
// graph holds related lists only in German (content-layer.md). The reading
// layout's Themen-Weg sidebar and Randspalte slot are issue #99.
async function KapitelDetail({ kapitel, locale, ...props }: KapitelDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(kapitel.id, locale)
	const abschnitte = graph.getAbschnitteByKapitel(kapitel.id)
	const abschnitteCount = t('kapitel.abschnitteCount', { n: abschnitte.length })
	const themenOrte = graph.getThemenByKapitel(kapitel.id)

	return (
		<div data-slot="kapitel-detail" {...props}>
			<KapitelEbenenLeiste kapitel={kapitel} />
			<ReadingLayout
				themenWeg={<KapitelThemenWeg graph={graph} kapitel={kapitel} />}
				themenWegKapitelCount={graph.kapitel.length}
			>
				<p>{t('kapitel.number', { n: kapitel.number })}</p>
				<h1>{kapitel.title}</h1>
				<Body components={bodyImageComponents(kapitel.id)} />
				<nav aria-label={abschnitteCount}>
					<h2>{abschnitteCount}</h2>
					<ol>
						{abschnitte.map((abschnitt) => (
							<li key={abschnitt.id}>
								<Link href={abschnitt.url}>
									{t('abschnitt.numberedTitle', {
										number: abschnitt.number,
										title: shortTitleOrTitle(abschnitt),
									})}
								</Link>
							</li>
						))}
					</ol>
				</nav>
				{themenOrte.length > 0 && (
					<nav aria-label={t('kapitel.themenOrtHeading')}>
						<h2>{t('kapitel.themenOrtHeading')}</h2>
						<ul>
							{themenOrte.map((thema) => (
								<li key={thema.id}>
									<Link href={thema.url}>{shortTitleOrTitle(thema)}</Link>
								</li>
							))}
						</ul>
					</nav>
				)}
			</ReadingLayout>
		</div>
	)
}

export { KapitelDetail }
