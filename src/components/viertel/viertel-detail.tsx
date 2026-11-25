import Link from 'next/link'
import type * as React from 'react'

import { AufsaetzeListe } from '@/components/aufsatz/aufsaetze-liste'
import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { MiniStadtplan } from '@/components/stadt/mini-stadtplan'
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

import { Steckbrief } from './steckbrief'

interface ViertelDetailProps extends React.ComponentProps<'div'> {
	viertel: Viertel
	locale?: string
}

// Where "Wege durch dieses Viertel ↓" in the Bild-Hero scrolls to: the Weg
// section the next ticket (the Wege section, issue #96's own notes) adds
// below this page, matched by that section's own `id`.
const WEGE_ANCHOR = 'wege-durch-dieses-viertel'

// A Viertel's own page content (Figma T02, issue #96): Bild-Hero, Steckbrief,
// "Mehr aus dem Viertel" and "Weiter im Stadtplan", shared between its
// dedicated German route (src/app/stadt/[viertel]/page.tsx) and the
// catch-all route's prefixed, localized rendering (issue #36). Its Kapitel
// and Aufsätze are the German document's related lists (content-layer.md).
async function ViertelDetail({ viertel, locale, ...props }: ViertelDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(viertel.id, locale)
	const kapitel = graph.getKapitelByViertel(viertel.id)
	const { leitthema } = graph
	const previous = graph.getPrevious(viertel.id)
	const next = graph.getNext(viertel.id)

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
						// 420px: the Bild-Hero illustration size (Kartei design system, Shapes).
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
						<Link href={`#${WEGE_ANCHOR}`} className={buttonVariants({ variant: 'ghost' })}>
							{t('viertel.heroWegeAction')}
						</Link>
					</>
				}
			>
				<Body components={bodyImageComponents(viertel.id)} />
			</BildHero>

			<section data-slot="steckbrief-section" className="px-5 py-14 md:px-24 md:py-16">
				<SectionTitle tagline={t('viertel.steckbriefTagline')} className="mb-10" />
				<h2 className="sr-only">{t('viertel.steckbriefTagline')}</h2>
				<Steckbrief steckbrief={viertel.steckbrief} />
			</section>

			<AufsaetzeListe aufsaetze={graph.getAufsaetzeByViertel(viertel.id)} />

			<section data-slot="weiter-im-stadtplan-section" className="px-5 py-14 md:px-24 md:py-16">
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
			</section>
		</div>
	)
}

export { ViertelDetail }
