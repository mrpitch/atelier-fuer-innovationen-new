import Link from 'next/link'
import type * as React from 'react'

import { AufsaetzeListe } from '@/components/aufsatz/aufsaetze-liste'
import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { WegLeiste } from '@/components/navigation/weg-leiste'
import { MiniStadtplan } from '@/components/stadt/mini-stadtplan'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { Badge } from '@/components/ui/badge'
import { BildHero } from '@/components/ui/bild-hero'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { Viertel } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'
import { bodyImageComponents } from '@/mdx-components'

import { GangartKarte } from './gangart-karte'
import { buildLesenGangart, buildSchauenGangart } from './gangarten'
import { Steckbrief } from './steckbrief'

interface ViertelDetailProps extends React.ComponentProps<'div'> {
	viertel: Viertel
	locale?: string
}

// Where "Wege durch dieses Viertel ↓" in the Bild-Hero scrolls to: the Wege
// section below (issue #96's own notes), matched by that section's own `id`.
const WEGE_ANCHOR = 'wege-durch-dieses-viertel'

// A Viertel's own page content (Figma T02, issues #96, #97): Bild-Hero,
// Steckbrief, "Mehr aus dem Viertel", "Wege durch dieses Viertel" and
// "Weiter im Stadtplan", shared between its dedicated German route
// (src/app/stadt/[viertel]/page.tsx) and the catch-all route's prefixed,
// localized rendering (issue #36). Its Kapitel and Aufsätze are the German
// document's related lists (content-layer.md).
async function ViertelDetail({ viertel, locale, ...props }: ViertelDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(viertel.id, locale)
	const kapitel = graph.getKapitelByViertel(viertel.id)
	const { leitthema } = graph
	const previous = graph.getPrevious(viertel.id)
	const next = graph.getNext(viertel.id)
	const schauenGangart = buildSchauenGangart(graph, viertel)
	const lesenGangart = buildLesenGangart(graph, viertel)
	const hasWege = Boolean(schauenGangart || lesenGangart)

	return (
		<div data-slot="viertel-detail" {...props}>
			<Ortsleiste breadcrumbs={graph.getBreadcrumbs(viertel.id)} previous={previous} next={next} />
			<BildHero
				eyebrow={t('stadt.hub.kachelNummer', { number: formatTwoDigits(viertel.number) })}
				badge={
					kapitel &&
					leitthema && (
						<Badge variant="secondary">{t('viertel.heroBadge', { title: leitthema.title })}</Badge>
					)
				}
				title={viertel.title}
				zitat={viertel.leitsatz}
				illustration={
					<Illustration
						id={viertel.id}
						label={viertel.title}
						// 420px: the Bild-Hero illustration size (Figma, Bild-Hero component).
						// eslint-disable-next-line restrictions/arbitrary-size-classes
						className="size-[420px]"
					/>
				}
				actions={
					<>
						{kapitel && (
							<Link href={kapitel.url} className={buttonVariants({ variant: 'default' })}>
								{t('viertel.heroKapitelAction', { number: kapitel.number })}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						)}
						{hasWege && (
							<Link href={`#${WEGE_ANCHOR}`} className={buttonVariants({ variant: 'ghost' })}>
								{t('viertel.heroWegeAction')}
								<Icon iconName="arrowDown" data-icon="inline-end" />
							</Link>
						)}
					</>
				}
			>
				<Body components={bodyImageComponents(viertel.id)} />
			</BildHero>

			<PageSection data-slot="steckbrief-section">
				<SectionTitle tagline={t('viertel.steckbriefTagline')} className="mb-10" />
				<h2 className="sr-only">{t('viertel.steckbriefTagline')}</h2>
				<Steckbrief steckbrief={viertel.steckbrief} />
			</PageSection>

			<AufsaetzeListe aufsaetze={graph.getAufsaetzeByViertel(viertel.id)} />

			{hasWege && (
				<PageSection id={WEGE_ANCHOR} data-slot="wege-section">
					<SectionTitle
						tagline={t('viertel.wege.tagline')}
						title={t('viertel.wege.title')}
						description={t('viertel.wege.description')}
						className="mb-10"
					/>
					<WegLeiste
						viertel={graph.viertel}
						zentrum={graph.zentrum}
						aktuellId={viertel.id}
						aktuellNummer={viertel.number}
						className="mb-6"
					/>
					<div className="flex flex-col gap-6 lg:flex-row">
						{schauenGangart && <GangartKarte {...schauenGangart} />}
						{lesenGangart && <GangartKarte {...lesenGangart} />}
					</div>
				</PageSection>
			)}

			<PageSection data-slot="weiter-im-stadtplan-section">
				<div className="mb-10 flex flex-wrap items-center gap-6">
					<MiniStadtplan viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={viertel.id} />
					<SectionTitle
						tagline={t('viertel.weiterTagline')}
						title={t('viertel.weiterTitle', { number: formatTwoDigits(viertel.number) })}
					/>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					{previous && (
						<Item render={<Link href={previous.url} />} variant="outline" className="flex-1">
							<ItemMedia className="size-11">
								<Illustration id={previous.id} label={previous.title} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{previous.title}</ItemTitle>
								<ItemDescription>{t('viertel.weiterVorheriges')}</ItemDescription>
							</ItemContent>
						</Item>
					)}
					{next && (
						<Item render={<Link href={next.url} />} variant="outline" className="flex-1">
							<ItemMedia className="size-11">
								<Illustration id={next.id} label={next.title} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{next.title}</ItemTitle>
								<ItemDescription>{t('viertel.weiterNaechstes')}</ItemDescription>
							</ItemContent>
						</Item>
					)}
				</div>
			</PageSection>
		</div>
	)
}

export { ViertelDetail }
