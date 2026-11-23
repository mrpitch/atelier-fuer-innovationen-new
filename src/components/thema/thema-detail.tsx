import Link from 'next/link'
import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { Illustration } from '@/components/ui/illustration'
import type { Thema } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface ThemaDetailProps extends React.ComponentProps<'div'> {
	thema: Thema
	locale?: string
}

// A Thema's own page content (issue #31), shared between its dedicated German
// route and the catch-all route's localized rendering (issue #36).
async function ThemaDetail({ thema, locale, ...props }: ThemaDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(thema.id, locale)
	// A Themen-Ort's own branching Kapitel; undefined for the Leitthema, which
	// lists every Kapitel instead of branching off a single one (issue #31).
	const branchingKapitel =
		thema.kapitelId !== undefined ? graph.getKapitel(thema.kapitelId) : undefined

	return (
		<div data-slot="thema-detail" {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(thema.id)} />
			<Illustration id={thema.id} label={thema.title} />
			<h1>{thema.title}</h1>
			<Body components={bodyImageComponents(thema.id)} />
			<nav aria-label={t('thema.kapitelHeading')}>
				<h2>{t('thema.kapitelHeading')}</h2>
				{branchingKapitel ? (
					<Link href={branchingKapitel.url}>
						{t('kapitel.numberedTitle', {
							n: branchingKapitel.number,
							title: shortTitleOrTitle(branchingKapitel),
						})}
					</Link>
				) : (
					<ol>
						{graph.kapitel.map((kapitel) => (
							<li key={kapitel.id}>
								<Link href={kapitel.url}>
									{t('kapitel.numberedTitle', {
										n: kapitel.number,
										title: shortTitleOrTitle(kapitel),
									})}
								</Link>
							</li>
						))}
					</ol>
				)}
			</nav>
		</div>
	)
}

export { ThemaDetail }
