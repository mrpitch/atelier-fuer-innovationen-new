import Link from 'next/link'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { ThemenOrtDetail } from '@/components/thema/themen-ort-detail'
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
// route and the catch-all route's localized rendering (issue #36). A
// Themen-Ort (`kapitelId` set) gets its full Figma design, ThemenOrtDetail
// (Figma T09b, issue #125); the Leitthema (no `kapitelId`) keeps this bare
// rendering, since T09a isn't this issue's scope.
async function ThemaDetail({ thema, locale, ...props }: ThemaDetailProps) {
	if (thema.kapitelId !== undefined) {
		// Awaited directly, not rendered as `<ThemenOrtDetail />`: React's RSC
		// renderer resolves a nested async component on its own, but the plain
		// react-dom/server renderer the component tests use (renderToStaticMarkup)
		// doesn't, so this stays testable the same way RundgangDetail is.
		return await ThemenOrtDetail({ thema, locale, ...props })
	}

	const graph = contentGraph()
	const Body = await graph.getBody(thema.id, locale)

	return (
		<div data-slot="thema-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(thema.id)}
				previous={graph.getPrevious(thema.id)}
				next={graph.getNext(thema.id)}
			/>
			<Illustration id={thema.id} label={thema.title} />
			<h1>{thema.title}</h1>
			<Body components={bodyImageComponents(thema.id)} />
			<nav aria-label={t('thema.kapitelHeading')}>
				<h2>{t('thema.kapitelHeading')}</h2>
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
			</nav>
		</div>
	)
}

export { ThemaDetail }
