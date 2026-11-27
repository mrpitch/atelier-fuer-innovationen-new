import { cn } from 'cn'
import type * as React from 'react'

import { FeatureSection9 } from '@/components/pro-blocks/landing-page/feature-sections/feature-section-9'
import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { PageSection } from '@/components/stadt/page-section'
import { BildHero } from '@/components/ui/bild-hero'
import { Illustration } from '@/components/ui/illustration'
import type { Seite } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

import { RundgangEintrag } from './rundgang-eintrag'

interface RundgaengeHubProps extends React.ComponentProps<'div'> {
	seite: Seite
	locale?: string
}

// /rundgaenge, the Rundgänge-Hub (Figma T07 "Rundgänge-Hub", issue #119): the
// Bild-Hero, "Die Rundgänge des Stadtführers" (one Rundgang-Eintrag per
// Rundgang) and "So funktioniert ein Rundgang" — the Rundgänge area's
// landing Seite. No "Fortsetzen"
// section and no Banner "Zu den Dossiers" (both in Figma): reading state
// stays out of scope (epic #115) and the Dossiers banner belongs to the
// Bibliothek area, not named by this issue.
async function RundgaengeHub({ seite, locale, className, ...props }: RundgaengeHubProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)
	const { rundgaenge } = graph

	return (
		<div data-slot="rundgaenge-hub" className={cn(className)} {...props}>
			<BildHero
				eyebrow={t('rundgaenge.hub.eyebrow', { n: rundgaenge.length })}
				title={seite.title}
				illustration={
					// `[&>svg]:h-auto [&>svg]:max-w-full`: the same rule BildHero's own
					// media slot applies to a single Illustration (bild-hero.tsx), here
					// on this div instead, so it still reaches these three — nested one
					// level deeper — keeping them proportional instead of flex's default
					// shrink squeezing only their width below 1280 (the Bild-Hero's own
					// `xl` switch), as issue #110 already fixed for the single case.
					<div className="flex items-center [&>svg]:h-auto [&>svg]:max-w-full">
						{rundgaenge.map((rundgang, index) => (
							<Illustration
								key={rundgang.id}
								id={rundgang.id}
								label={rundgang.title}
								className={cn(
									// 200/240px: the Bild-Hero's three overlapping Rundgang
									// illustrations, the middle one larger (Figma Bild-Hero
									// 36584:15357 as used on T07 36893:19972).
									// eslint-disable-next-line restrictions/arbitrary-size-classes
									index === 1 ? 'size-[240px]' : 'size-[200px]',
									index > 0 && '-ml-6',
								)}
							/>
						))}
					</div>
				}
			>
				<Body components={bodyImageComponents(seite.id)} />
			</BildHero>

			<PageSection data-slot="rundgaenge-section">
				{/* "Aus dem Original, neu aufbereitet" is its own text node beside the
				    Kopf's Tagline in Figma (T07 36893:19976), not part of the "Pro
				    Blocks / Section Title" instance it sits next to — kept as a
				    second, plain string rather than folded into SectionTitle's own
				    (unused here) description slot. */}
				<div className="mb-10 flex flex-wrap items-center justify-between gap-3">
					<Tagline>{t('rundgaenge.hub.heading')}</Tagline>
					<p className="text-sm text-muted-foreground">{t('rundgaenge.hub.herkunft')}</p>
				</div>
				<h2 className="sr-only">{t('rundgaenge.hub.heading')}</h2>
				<div className="flex flex-col divide-y divide-border">
					{rundgaenge.map((rundgang) => (
						<RundgangEintrag
							key={rundgang.id}
							rundgang={rundgang}
							stationen={graph.getStationenByRundgang(rundgang.id)}
							className="py-10 first:pt-0 last:pb-0"
						/>
					))}
				</div>
			</PageSection>

			{/* Figma's own fourth step, "Später fortsetzen" ("Ihr Fortschritt
			    bleibt gespeichert"), is hidden on T07 (36893:19984) — the three
			    visible steps' own copy stays as Figma has it, including Schritt
			    2's "Fortschritt oben": that names the Stationsnavigation's
			    position-derived progress (epic #115, "Position … is not reading
			    state"), not a promise that it's saved between visits. */}
			<FeatureSection9
				tagline={t('rundgaenge.hub.featureTagline')}
				heading={t('rundgaenge.hub.featureHeading')}
				steps={[
					{
						title: t('rundgaenge.hub.schritt1Titel'),
						description: t('rundgaenge.hub.schritt1Text'),
					},
					{
						title: t('rundgaenge.hub.schritt2Titel'),
						description: t('rundgaenge.hub.schritt2Text'),
					},
					{
						title: t('rundgaenge.hub.schritt3Titel'),
						description: t('rundgaenge.hub.schritt3Text'),
					},
				]}
			/>
		</div>
	)
}

export { RundgaengeHub }
