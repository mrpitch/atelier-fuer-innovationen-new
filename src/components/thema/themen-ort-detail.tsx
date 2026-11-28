import Link from 'next/link'
import type * as React from 'react'

import { GangartBox } from '@/components/navigation/gangart-box'
import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { Badge } from '@/components/ui/badge'
import { BildHero } from '@/components/ui/bild-hero'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { MonoLabel } from '@/components/ui/mono-label'
import { RichText } from '@/components/ui/rich-text'
import type { Thema } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'
import { bodyImageComponents } from '@/mdx-components'

interface ThemenOrtDetailProps extends React.ComponentProps<'div'> {
	thema: Thema
	locale?: string
}

// A Themen-Ort's own page content (Figma T09b, issue #125): Bild-Hero, then
// the body text beside the Randspalte's Gangart-Box and "Weiterführend" —
// shared between its dedicated German route and the catch-all route's
// localized rendering (issue #36). Called only for a Themen-Ort (`thema`
// with a `kapitelId`); the Leitthema renders through LeitthemaDetail (issue
// #126).
async function ThemenOrtDetail({ thema, locale, ...props }: ThemenOrtDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(thema.id, locale)
	const kapitel = thema.kapitelId !== undefined ? graph.getKapitel(thema.kapitelId) : undefined
	if (!kapitel) throw new Error(`ThemenOrtDetail: unknown Kapitel ID: ${thema.kapitelId}`)
	const viertel = graph.getViertelOfKapitel(kapitel)
	const { leitthema } = graph
	const weiterfuehrend = thema.weiterfuehrend ?? []

	return (
		<div data-slot="themen-ort-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(thema.id)}
				previous={graph.getPrevious(thema.id)}
				next={graph.getNext(thema.id)}
			/>
			<BildHero
				eyebrow={t('thema.heroEyebrow', {
					number: formatTwoDigits(viertel.number),
					viertel: viertel.title.toLocaleUpperCase('de'),
				})}
				badge={
					<Badge variant="secondary">{t('thema.heroBadge', { number: kapitel.number })}</Badge>
				}
				title={thema.title}
				zitat={thema.leitsatz}
				zitatStyle="italic"
				eyebrowTone="primary"
				illustration={
					<Illustration
						id={thema.id}
						label={thema.title}
						// 220px below xl, 420px from xl (Figma T09b 36626:29971, 36603:14391).
						// eslint-disable-next-line restrictions/arbitrary-size-classes
						className="size-[220px] xl:size-[420px]"
					/>
				}
				actions={
					<>
						<Link href={viertel.url} className={buttonVariants({ variant: 'default' })}>
							{t('thema.heroInsViertelAction', { title: viertel.title })}
							<Icon iconName="arrowRight" data-icon="inline-end" />
						</Link>
						<Link href={kapitel.url} className={buttonVariants({ variant: 'ghost' })}>
							{t('viertel.heroKapitelAction', { number: kapitel.number })}
						</Link>
					</>
				}
			/>

			<div
				data-slot="thema-ort-body"
				className="flex flex-col gap-10 px-5 py-14 md:py-16 lg:flex-row lg:items-start lg:gap-x-14 xl:gap-x-24 xl:px-6"
			>
				{/* 720px: the Body text column (Figma Body 36603:14570). */}
				{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
				<div data-slot="thema-ort-text" className="min-w-0 flex-1 xl:max-w-[720px]">
					<RichText>
						<Body components={bodyImageComponents(thema.id)} />
					</RichText>
				</div>
				<aside
					data-slot="thema-ort-randspalte"
					// 260px at lg, 320px at xl: the Randspalte column (Figma Body 36603:14570).
					// eslint-disable-next-line restrictions/arbitrary-size-classes
					className="flex min-w-0 flex-col gap-6 lg:w-[260px] xl:w-[320px]"
				>
					{leitthema && (
						<GangartBox
							label={t('thema.gangartLabel')}
							illustration={
								<Illustration
									id={leitthema.id}
									label={leitthema.title}
									className="size-12 shrink-0"
								/>
							}
							titel={t('thema.gangartTitel', {
								number: kapitel.number,
								title: shortTitleOrTitle(kapitel),
							})}
							text={t('thema.gangartText', { title: viertel.title })}
							action={{
								label: t('viertel.heroKapitelAction', { number: kapitel.number }),
								href: kapitel.url,
							}}
							hinweis={
								<Link
									href={leitthema.url}
									className="text-xs text-muted-foreground hover:underline"
								>
									{t('thema.leitthemaHinweis', { title: leitthema.title })}
								</Link>
							}
						/>
					)}
					{weiterfuehrend.length > 0 && (
						<nav aria-label={t('thema.weiterfuehrendHeading')}>
							{/* The heading's text is MonoLabel's own children, not a literal child of
							    this <h2>; jsx-a11y can't see past the render-prop merge. */}
							{/* eslint-disable-next-line jsx-a11y/heading-has-content */}
							<MonoLabel render={<h2 />} tone="muted" className="mb-4">
								{t('thema.weiterfuehrendHeading')}
							</MonoLabel>
							<ul className="flex flex-col gap-2">
								{weiterfuehrend.map((aufsatz) => (
									<li key={aufsatz.url}>
										<Item render={<Link href={aufsatz.url} />} variant="outline" size="xs">
											<ItemContent>
												<ItemTitle>{aufsatz.label}</ItemTitle>
												<ItemDescription>{aufsatz.description}</ItemDescription>
											</ItemContent>
										</Item>
									</li>
								))}
							</ul>
						</nav>
					)}
				</aside>
			</div>
		</div>
	)
}

export { ThemenOrtDetail }
