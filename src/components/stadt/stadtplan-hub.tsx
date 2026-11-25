import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { BildHero } from '@/components/ui/bild-hero'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import type { Seite } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

import { PageSection } from './page-section'
import { SectionTitle } from './section-title'
import { StadtTabelle } from './stadt-tabelle'
import { buildStadtTabelle } from './stadt-tabelle-rows'
import { Stadtplan } from './stadtplan'

interface StadtplanHubProps extends React.ComponentProps<'div'> {
	seite: Seite
	locale?: string
}

// /stadt, the Stadtplan-Hub (Figma T08 "Stadtplan-Hub", issue #95): the
// Bild-Hero, the Stadtplan and the "Was in jedem Viertel liegt" table — the
// Stadt area's landing Seite, replacing the placeholder ViertelListe.
async function StadtplanHub({ seite, locale, className, ...props }: StadtplanHubProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)
	const { viertel, zentrum } = graph

	// "Rundgang durch alle Viertel" goes to Station 0 of the Zentrum's own
	// Schauen Rundgang — the Rundgang every Stadtrundgang starts from, since
	// Station numbering counts from 0 only when it stands at the Zentrum
	// (urls.ts, ADR-0003).
	const ersteStation = zentrum && graph.getSchauenStation(zentrum.id)
	// "Themen-Weg beginnen" goes to Kapitel 1 (ADR-0003: "Kapitel n = Viertel n").
	const erstesKapitel = graph.kapitel.find((kapitel) => kapitel.number === 1)

	return (
		<div data-slot="stadtplan-hub" className={cn(className)} {...props}>
			<BildHero
				eyebrow={t('stadt.hub.eyebrow')}
				title={seite.title}
				zitat={t('stadt.hub.zitat')}
				illustration={
					zentrum && (
						<Illustration
							id={zentrum.id}
							label={zentrum.title}
							// 420px: the Bild-Hero illustration size (Figma, Bild-Hero component).
							// eslint-disable-next-line restrictions/arbitrary-size-classes
							className="size-[420px]"
						/>
					)
				}
				actions={
					<>
						{ersteStation && (
							<Link href={ersteStation.url} className={buttonVariants({ variant: 'default' })}>
								{t('stadt.hub.rundgangAction')}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						)}
						{erstesKapitel && (
							<Link href={erstesKapitel.url} className={buttonVariants({ variant: 'secondary' })}>
								{t('stadt.hub.themenWegAction')}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						)}
					</>
				}
			>
				<Body components={bodyImageComponents(seite.id)} />
			</BildHero>

			<PageSection data-slot="stadtplan-section">
				<SectionTitle tagline={t('stadt.hub.stadtplanTagline')} className="mb-10" />
				<h2 className="sr-only">{t('stadt.hub.stadtplanHeading')}</h2>
				<nav aria-label={t('stadt.navigation')}>
					<Stadtplan viertel={viertel} zentrum={zentrum} />
				</nav>
			</PageSection>

			<PageSection data-slot="stadt-tabelle-section" className="bg-muted">
				<StadtTabelle data={buildStadtTabelle(graph, viertel, zentrum)} />
			</PageSection>
		</div>
	)
}

export { StadtplanHub }
