import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { HeroSection7 } from '@/components/pro-blocks/landing-page/hero-sections/hero-section-7'
import { TestimonialsSection1 } from '@/components/pro-blocks/landing-page/testimonials-sections/testimonials-section-1'
import { RundgangKarte } from '@/components/rundgang/rundgang-karte'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { Stadtplan } from '@/components/stadt/stadtplan'
import { buttonVariants } from '@/components/ui/button'
import type { Seite } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface StartHubProps extends React.ComponentProps<'div'> {
	seite: Seite
}

const STADT_SEITE_ID = 'stadt'
const THEMEN_SEITE_ID = 'themen'

// The Startseite (issues #130, #131, epic #128): the Home / Hero built from
// `tagline`, `heading` and `intro` (Pro Blocks Hero Section 7, Figma T01
// 36579:8663), the Stadtplan section reusing the Stadt epic's own Stadtplan
// and Viertel-Kachel unchanged, the Rundgänge section (one Rundgang-Karte per
// Rundgang in rundgaenge/meta.json order, Figma 36579:9420), an optional
// testimonial from `zitat` — the same shared Zitat shape the Leitthema's own
// reuses (TestimonialsSection1, issue #124) — in Figma's own section order,
// and a link into the Themen area (issue #129, user stories 26–30) below it
// until its own section (issue #132's "Drei Themen") replaces it. All
// Hero/testimonial fields are optional; the page renders only what's set and
// never the MDX body.
function StartHub({ seite, className, ...props }: StartHubProps) {
	const graph = contentGraph()
	const stadt = graph.getSeite(STADT_SEITE_ID)
	const rundgaenge = graph.getSeite(RUNDGAENGE_SEITE_ID)
	const themen = graph.getSeite(THEMEN_SEITE_ID)
	const { viertel, zentrum } = graph
	const [firstRundgang] = graph.rundgaenge
	const ersteStation = firstRundgang && graph.getStationenByRundgang(firstRundgang.id)[0]
	const rundgaengeTagline = t('start.rundgaenge.tagline')

	return (
		<div data-slot="start-hub" className={cn(className)} {...props}>
			<HeroSection7
				tagline={seite.tagline}
				heading={seite.heading ?? seite.title}
				intro={seite.intro}
				actions={
					<>
						{ersteStation && (
							<Link href={ersteStation.url} className={buttonVariants({ variant: 'default' })}>
								{t('start.hero.rundgangAction')}
							</Link>
						)}
						{stadt && (
							<Link href={stadt.url} className={buttonVariants({ variant: 'secondary' })}>
								{t('start.hero.stadtplanAction')}
							</Link>
						)}
					</>
				}
			/>

			<PageSection data-slot="start-stadtplan-section">
				<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
					<SectionTitle
						tagline={t('start.stadtplan.tagline')}
						title={t('start.stadtplan.heading')}
						description={t('start.stadtplan.description')}
					/>
					{stadt && (
						<Link href={stadt.url} className={buttonVariants({ variant: 'link', size: 'sm' })}>
							{t('start.stadtplan.cta')}
						</Link>
					)}
				</div>
				<nav aria-label={t('stadt.navigation')}>
					<Stadtplan viertel={viertel} zentrum={zentrum} />
				</nav>
			</PageSection>

			<PageSection data-slot="start-rundgaenge-section">
				{/* The same tagline doubles as the section's own accessible heading
				    (Figma shows no visible one, "Show Heading: false" — the
				    Rundgänge-Hub's own Tagline does the same, rundgaenge-hub.tsx). */}
				<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
					<SectionTitle tagline={rundgaengeTagline} />
					{rundgaenge && (
						<Link href={rundgaenge.url} className={buttonVariants({ variant: 'link', size: 'sm' })}>
							{t('start.rundgaenge.cta')}
						</Link>
					)}
				</div>
				<h2 className="sr-only">{rundgaengeTagline}</h2>
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
					{graph.rundgaenge.map((rundgang) => (
						<RundgangKarte
							key={rundgang.id}
							rundgang={rundgang}
							stationen={graph.getStationenByRundgang(rundgang.id)}
						/>
					))}
				</div>
			</PageSection>

			{seite.zitat && <TestimonialsSection1 zitat={seite.zitat} />}

			<PageSection data-slot="start-navigation">
				<nav aria-label={t('start.hub.navigation')}>
					<ul className="flex flex-col gap-10 md:flex-row">
						{themen && (
							<li>
								<h2 className="heading-sm text-foreground">{t('start.hub.themenHeading')}</h2>
								<Link href={themen.url}>{t('start.hub.themenLink')}</Link>
							</li>
						)}
					</ul>
				</nav>
			</PageSection>
		</div>
	)
}

export { StartHub }
