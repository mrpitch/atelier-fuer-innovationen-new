import Link from 'next/link'
import type * as React from 'react'

import { KapitelHero } from '@/components/kapitel/kapitel-hero'
import { KapitelRandspalte } from '@/components/kapitel/kapitel-randspalte'
import { KapitelEbenenLeiste } from '@/components/navigation/kapitel-ebenen-leiste'
import { ReadingLayout } from '@/components/navigation/reading-layout'
import { buttonVariants } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { MonoLabel } from '@/components/ui/mono-label'
import type { Kapitel } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface KapitelDetailProps extends React.ComponentProps<'div'> {
	kapitel: Kapitel
	locale?: string
}

// An Item's trailing CTA that only restates its own, single destination
// (the whole Item is already the Link): a visual affordance, not a second
// interactive target, so it's a plain `<span>` with `aria-hidden`, not
// another Button or Link.
function decorativeCta(variant: 'default' | 'outline', label: string) {
	return (
		<ItemActions>
			<span aria-hidden="true" className={buttonVariants({ variant, size: 'sm' })}>
				{label}
			</span>
		</ItemActions>
	)
}

// A Kapitel's own page content (Figma T03, issue #100): the Kapitel-Hero,
// "Die n Abschnitte", the next-Kapitel link and the Randspalte — shared
// between its dedicated German route and the catch-all route's localized
// rendering (issue #36). Its Abschnitte, Themen-Orte and Aufsätze are the
// German documents' related lists, as the graph holds them only in German
// (content-layer.md).
async function KapitelDetail({ kapitel, locale, ...props }: KapitelDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(kapitel.id, locale)
	const viertel = graph.getViertel(kapitel.viertelId)
	if (!viertel) throw new Error(`KapitelDetail: unknown Viertel ID: ${kapitel.viertelId}`)

	const abschnitte = graph.getAbschnitteByKapitel(kapitel.id)
	const lastAbschnitt = abschnitte.at(-1)
	const abschnitteHeading = t('kapitel.abschnitteHeading', { n: abschnitte.length })
	const themenOrte = graph.getThemenByKapitel(kapitel.id)

	const next = graph.getNext(kapitel.id)
	const nextKapitel = next && graph.getKapitel(next.id)
	const nextViertel = nextKapitel && graph.getViertel(nextKapitel.viertelId)

	return (
		<div data-slot="kapitel-detail" {...props}>
			<KapitelEbenenLeiste kapitel={kapitel} />
			<ReadingLayout
				graph={graph}
				kapitel={kapitel}
				randspalte={<KapitelRandspalte graph={graph} viertel={viertel} />}
			>
				<KapitelHero
					kapitel={kapitel}
					viertel={viertel}
					leitthema={graph.leitthema}
					viertelCount={graph.viertel.length}
					firstAbschnitt={abschnitte[0]}
					className="mb-10"
				>
					<Body components={bodyImageComponents(kapitel.id)} />
				</KapitelHero>

				<nav aria-label={abschnitteHeading}>
					{/* The heading's text is MonoLabel's own children, not a literal child of
					    this <h2>; jsx-a11y can't see past the render-prop merge. */}
					{/* eslint-disable-next-line jsx-a11y/heading-has-content */}
					<MonoLabel render={<h2 />} tone="muted" className="mb-4">
						{abschnitteHeading}
					</MonoLabel>
					<ol className="flex flex-col gap-3">
						{abschnitte.map((abschnitt, index) => (
							<li key={abschnitt.id}>
								<Item
									render={<Link href={abschnitt.url} />}
									variant={index === 0 ? 'muted' : 'outline'}
									size="xs"
								>
									<ItemContent>
										<ItemTitle>
											{t('abschnitt.numberedTitle', {
												number: abschnitt.number,
												title: abschnitt.title,
											})}
										</ItemTitle>
										{abschnitt.leitsatz && <ItemDescription>{abschnitt.leitsatz}</ItemDescription>}
									</ItemContent>
									{index === 0 && decorativeCta('default', t('kapitel.abschnitteHierBeginnen'))}
								</Item>
							</li>
						))}
					</ol>
				</nav>

				{themenOrte.length > 0 && (
					<nav aria-label={t('kapitel.themenOrtHeading')} className="mt-10">
						{/* eslint-disable-next-line jsx-a11y/heading-has-content -- see above */}
						<MonoLabel render={<h2 />} tone="muted" className="mb-4">
							{t('kapitel.themenOrtHeading')}
						</MonoLabel>
						<ul className="flex flex-col gap-3">
							{themenOrte.map((thema) => (
								<li key={thema.id}>
									<Item render={<Link href={thema.url} />} variant="outline" size="xs">
										<ItemContent>
											<ItemTitle>{shortTitleOrTitle(thema)}</ItemTitle>
										</ItemContent>
									</Item>
								</li>
							))}
						</ul>
					</nav>
				)}

				{nextKapitel && nextViertel && (
					<Item render={<Link href={nextKapitel.url} />} variant="outline" className="mt-10">
						<ItemContent>
							<ItemTitle>
								{t('kapitel.naechstesKapitel', {
									number: nextKapitel.number,
									title: nextKapitel.title,
								})}
							</ItemTitle>
							{lastAbschnitt && (
								<ItemDescription>
									{t('kapitel.naechstesKapitelBeschreibung', {
										number: lastAbschnitt.number,
										title: nextViertel.title,
									})}
								</ItemDescription>
							)}
						</ItemContent>
						{decorativeCta('outline', t('kapitel.naechstesKapitelWeiter'))}
					</Item>
				)}
			</ReadingLayout>
		</div>
	)
}

export { KapitelDetail }
