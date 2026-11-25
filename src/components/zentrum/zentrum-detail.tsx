import Link from 'next/link'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { WegLeiste } from '@/components/navigation/weg-leiste'
import { MiniStadtplan } from '@/components/stadt/mini-stadtplan'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { BildHero } from '@/components/ui/bild-hero'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { GangartKarte } from '@/components/viertel/gangart-karte'
import { buildSchauenGangart } from '@/components/viertel/gangarten'
import type { Zentrum } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

import { buildZentrumLesenGangart } from './gangarten'

interface ZentrumDetailProps extends React.ComponentProps<'div'> {
	zentrum: Zentrum
	locale?: string
}

// Where "Wege vom Zentrum aus ↓" in the Bild-Hero scrolls to: the Wege
// section below, the same anchor pattern viertel-detail.tsx's own
// WEGE_ANCHOR uses (issue #96's notes).
const WEGE_ANCHOR = 'wege-vom-zentrum-aus'

// The Zentrum's own page content (issue #98): the Viertel composition (Figma
// T02, since Figma draws no dedicated Zentrum screen) minus its Steckbrief
// and "Mehr aus dem Viertel" — Bild-Hero, Weg-Leiste with its Schauen and
// Lesen Gangart-Karten, and "Weiter im Stadtplan" — shared between the
// Zentrum's dedicated German route and the catch-all route's localized
// rendering (issue #36). Unlike a Viertel, the Zentrum has no Kapitel, so its
// Lesen Gangart-Karte is the Leitthema's own "Einführung" instead
// (zentrum/gangarten.ts), and its hero has no Thema badge or Kapitel button.
async function ZentrumDetail({ zentrum, locale, ...props }: ZentrumDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(zentrum.id, locale)
	const schauenGangart = buildSchauenGangart(graph, zentrum)
	const lesenGangart = buildZentrumLesenGangart(graph)
	const hasWege = Boolean(schauenGangart || lesenGangart)
	const [ersteViertel] = graph.viertel
	const letzteViertel = graph.viertel.at(-1)

	return (
		<div data-slot="zentrum-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(zentrum.id)}
				previous={graph.getPrevious(zentrum.id)}
				next={graph.getNext(zentrum.id)}
			/>
			<BildHero
				eyebrow={t('stadt.hub.zentrumNummer')}
				title={zentrum.title}
				illustration={
					<Illustration
						id={zentrum.id}
						label={zentrum.title}
						// 420px: the Bild-Hero illustration size (Figma Bild-Hero 36584:15357).
						// eslint-disable-next-line restrictions/arbitrary-size-classes
						className="size-[420px]"
					/>
				}
				actions={
					hasWege && (
						<Link href={`#${WEGE_ANCHOR}`} className={buttonVariants({ variant: 'ghost' })}>
							{t('zentrum.heroWegeAction')}
							<Icon iconName="arrowDown" data-icon="inline-end" />
						</Link>
					)
				}
			>
				<Body components={bodyImageComponents(zentrum.id)} />
			</BildHero>

			{hasWege && (
				<PageSection id={WEGE_ANCHOR} data-slot="wege-section">
					<SectionTitle
						tagline={t('zentrum.wege.tagline')}
						title={t('viertel.wege.title')}
						description={t('viertel.wege.description')}
						className="mb-10"
					/>
					<WegLeiste
						viertel={graph.viertel}
						zentrum={graph.zentrum}
						aktuellId={zentrum.id}
						aktuellNummer={0}
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
					<MiniStadtplan viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={zentrum.id} />
					<SectionTitle tagline={t('viertel.weiterTagline')} title={t('zentrum.weiterTitle')} />
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					{letzteViertel && (
						<Item render={<Link href={letzteViertel.url} />} variant="outline" className="flex-1">
							<ItemMedia className="size-11">
								<Illustration id={letzteViertel.id} label={letzteViertel.title} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{letzteViertel.title}</ItemTitle>
								<ItemDescription>{t('viertel.weiterVorheriges')}</ItemDescription>
							</ItemContent>
						</Item>
					)}
					{ersteViertel && (
						<Item render={<Link href={ersteViertel.url} />} variant="outline" className="flex-1">
							<ItemMedia className="size-11">
								<Illustration id={ersteViertel.id} label={ersteViertel.title} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{ersteViertel.title}</ItemTitle>
								<ItemDescription>{t('viertel.weiterNaechstes')}</ItemDescription>
							</ItemContent>
						</Item>
					)}
				</div>
			</PageSection>
		</div>
	)
}

export { ZentrumDetail }
