import Link from 'next/link'
import type * as React from 'react'

import { KapitelRandspalte } from '@/components/kapitel/kapitel-randspalte'
import { KapitelEbenenLeiste } from '@/components/navigation/kapitel-ebenen-leiste'
import { ReadingLayout } from '@/components/navigation/reading-layout'
import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { RichText } from '@/components/ui/rich-text'
import type { Abschnitt } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface AbschnittDetailProps extends React.ComponentProps<'div'> {
	abschnitt: Abschnitt
	locale?: string
}

// A previous/next Abschnitt Item (Figma "Vor / Zurück (Item)", T04, issue
// #101): plain outline Items, the arrow baked into the title string like
// Ortsleiste's ("← {label}", "{label} →"), since Figma draws no separate
// Item / Media or Item / Actions for them.
function nachbarItem(
	nachbar: Abschnitt,
	titleKey: 'abschnitt.previousTitle' | 'abschnitt.nextTitle',
	label: string,
) {
	return (
		<Item render={<Link href={nachbar.url} />} variant="outline" size="xs" className="md:flex-1">
			<ItemContent>
				<ItemTitle>
					{t(titleKey, { number: nachbar.number, title: shortTitleOrTitle(nachbar) })}
				</ItemTitle>
				<ItemDescription>{label}</ItemDescription>
			</ItemContent>
		</Item>
	)
}

// An Abschnitt's own page content (Figma T04, issue #101): the Tagline, its
// title and `leitsatz` as the lead, its MDX body in the Kartei rich-text
// style, and the previous/next Abschnitt Items — shared between its
// dedicated German route and the catch-all route's localized rendering
// (issue #36). The Randspalte is the Kapitel page's own (issue #100),
// reused unchanged: both pages share one Viertel's Gangart-Box and "Im
// Viertel außerdem". Figma's "Marker" ("Hier haben Sie zuletzt gelesen") is
// reading state, not decided yet (issue #64) and out of this issue's
// acceptance criteria, so it stays out.
async function AbschnittDetail({ abschnitt, locale, ...props }: AbschnittDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(abschnitt.id, locale)
	const kapitel = graph.getKapitel(abschnitt.kapitelId)
	if (!kapitel) throw new Error(`AbschnittDetail: unknown Kapitel ID: ${abschnitt.kapitelId}`)
	const viertel = graph.getViertel(kapitel.viertelId)
	if (!viertel) throw new Error(`AbschnittDetail: unknown Viertel ID: ${kapitel.viertelId}`)

	const geschwister = graph.getAbschnitteByKapitel(kapitel.id)
	const index = geschwister.findIndex((candidate) => candidate.id === abschnitt.id)
	const previous = index > 0 ? geschwister[index - 1] : undefined
	const next = index >= 0 && index < geschwister.length - 1 ? geschwister[index + 1] : undefined

	const tagline = abschnitt.jahr
		? t('abschnitt.tagline', {
				number: abschnitt.number,
				n: abschnitt.readingTimeMinutes,
				jahr: abschnitt.jahr,
			})
		: t('abschnitt.taglineOhneJahr', { number: abschnitt.number, n: abschnitt.readingTimeMinutes })

	return (
		<div data-slot="abschnitt-detail" {...props}>
			<KapitelEbenenLeiste kapitel={kapitel} abschnitt={abschnitt} />
			<ReadingLayout
				graph={graph}
				kapitel={kapitel}
				abschnitt={abschnitt}
				randspalte={<KapitelRandspalte graph={graph} viertel={viertel} />}
			>
				{/* 608px: the Source Text Rule's column width for the original
				    Xenia text (Figma T04 36626:14599, kartei-design-system.md Typography). */}
				{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
				<div className="flex max-w-[608px] flex-col gap-8">
					<Tagline>{tagline}</Tagline>
					<div className="flex flex-col gap-5">
						<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] text-foreground">
							{abschnitt.title}
						</h1>
						{abschnitt.leitsatz && (
							<p className="font-serif text-xl text-foreground italic">{abschnitt.leitsatz}</p>
						)}
						<RichText>
							<Body components={bodyImageComponents(abschnitt.id)} />
						</RichText>
					</div>
					{(previous || next) && (
						<div className="flex flex-col gap-3 md:flex-row">
							{previous &&
								nachbarItem(previous, 'abschnitt.previousTitle', t('abschnitt.previousLabel'))}
							{next && nachbarItem(next, 'abschnitt.nextTitle', t('abschnitt.nextLabel'))}
						</div>
					)}
				</div>
			</ReadingLayout>
		</div>
	)
}

export { AbschnittDetail }
