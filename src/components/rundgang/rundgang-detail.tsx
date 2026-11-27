import Link from 'next/link'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { WegLeiste } from '@/components/navigation/weg-leiste'
import { stationIllustrationId } from '@/components/rundgang/station-stopp'
import { PageSection } from '@/components/stadt/page-section'
import { BildHero } from '@/components/ui/bild-hero'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import {
	decorativeCta,
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item'
import type { Rundgang } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'
import { bodyImageComponents } from '@/mdx-components'

interface RundgangDetailProps extends React.ComponentProps<'div'> {
	rundgang: Rundgang
	locale?: string
}

// A Rundgang's own page content (Figma T05, issue #118): Bild-Hero, "Die
// Route" (the Weg-Leiste's own Rundgang mode), "Stationen im Detail" and
// "Nach dem Rundgang" — shared between its dedicated German route and the
// catch-all route's localized rendering (issue #36). Its Stationen are the
// German document's related list (content-layer.md).
async function RundgangDetail({ rundgang, locale, ...props }: RundgangDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(rundgang.id, locale)
	const stationen = graph.getStationenByRundgang(rundgang.id)
	const [firstStation] = stationen
	const next = graph.getNext(rundgang.id)
	const thema = rundgang.themaId ? graph.getThema(rundgang.themaId) : undefined
	// "Nach dem Rundgang" names no Bibliothek item (unlike the Viertel's own
	// "Mehr aus dem Viertel"); when it would also have neither a next Rundgang
	// nor a Thema (the last Rundgang, with none), the section has nothing
	// left to show, so it leaves out the whole section (ViertelDetail's own
	// `hasWege` gate).
	const hasNachDemRundgang = Boolean(next || thema)

	return (
		<div data-slot="rundgang-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(rundgang.id)}
				previous={graph.getPrevious(rundgang.id)}
				next={next}
			/>
			<BildHero
				eyebrow={t('rundgang.heroEyebrow', {
					number: formatTwoDigits(rundgang.number),
					von: firstStation?.number ?? 0,
					bis: firstStation?.lastNumber ?? 0,
					minuten: rundgang.durationMinutes,
				})}
				title={rundgang.title}
				zitat={rundgang.leitsatz}
				illustration={
					<Illustration
						id={rundgang.id}
						label={rundgang.title}
						// 420px: the Bild-Hero illustration size (Figma Bild-Hero 36584:15357).
						// eslint-disable-next-line restrictions/arbitrary-size-classes
						className="size-[420px]"
					/>
				}
				actions={
					firstStation && (
						<Link href={firstStation.url} className={buttonVariants({ variant: 'default' })}>
							{t('rundgang.heroStarten')}
							<Icon iconName="arrowRight" data-icon="inline-end" />
						</Link>
					)
				}
			>
				<Body components={bodyImageComponents(rundgang.id)} />
			</BildHero>

			{/* `id="route"` is the Rundgang-Leiste's own "Route" action's deep-link
			    target (issue #120). */}
			<PageSection id="route" data-slot="route-section">
				<div className="mb-10 flex flex-wrap items-center justify-between gap-3">
					<h2 className="heading-sm text-foreground">{t('rundgang.routeHeading')}</h2>
					{firstStation && (
						<p className="text-sm text-muted-foreground">
							{t('rundgang.routeHinweis', {
								von: firstStation.number,
								bis: firstStation.lastNumber,
							})}
						</p>
					)}
				</div>
				<WegLeiste mode="rundgang" rundgang={rundgang} stationen={stationen} />
			</PageSection>

			<PageSection data-slot="stationen-section">
				<div className="mb-10 flex flex-wrap items-center justify-between gap-3">
					<h2 className="heading-sm text-foreground">{t('rundgang.stationenHeading')}</h2>
					<p className="text-sm text-muted-foreground">{t('rundgang.stationenHinweis')}</p>
				</div>
				<ol className="flex flex-col gap-3">
					{stationen.map((station) => (
						<li key={station.id}>
							<Item render={<Link href={station.url} />} variant="outline" size="xs">
								<span
									aria-hidden="true"
									className="w-8 shrink-0 text-center font-mono text-base text-muted-foreground"
								>
									{formatTwoDigits(station.number)}
								</span>
								<ItemMedia>
									<Illustration
										id={stationIllustrationId(station, rundgang)}
										label={shortTitleOrTitle(station)}
									/>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{shortTitleOrTitle(station)}</ItemTitle>
									<ItemDescription>{station.description}</ItemDescription>
								</ItemContent>
								{decorativeCta(
									'outline',
									t('station.hierEinsteigen'),
									// Figma's own Item drops the "ca." StationDetail's heading already
									// carries ("station.readingTime"); reused as-is here for one phrasing
									// sitewide rather than a second, Figma-only reading-time key.
									<span className="text-sm text-muted-foreground">
										{t('station.readingTime', { n: station.readingTimeMinutes })}
									</span>,
								)}
							</Item>
						</li>
					))}
				</ol>
			</PageSection>

			{hasNachDemRundgang && (
				<PageSection data-slot="nach-dem-rundgang-section">
					<h2 className="heading-sm mb-10 text-foreground">
						{t('rundgang.nachDemRundgangHeading')}
					</h2>
					<div className="flex flex-col gap-3 sm:flex-row">
						{next && (
							<Item render={<Link href={next.url} />} variant="outline" className="flex-1">
								<ItemMedia className="size-11">
									<Illustration id={next.id} label={next.title} />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{next.title}</ItemTitle>
									<ItemDescription>{t('rundgang.naechsterRundgang')}</ItemDescription>
								</ItemContent>
							</Item>
						)}
						{thema && (
							<Item render={<Link href={thema.url} />} variant="outline" className="flex-1">
								<ItemMedia className="size-11">
									<Illustration id={thema.id} label={thema.title} />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{thema.title}</ItemTitle>
									<ItemDescription>{t('rundgang.themaVertiefen')}</ItemDescription>
								</ItemContent>
							</Item>
						)}
					</div>
				</PageSection>
			)}
		</div>
	)
}

export { RundgangDetail }
