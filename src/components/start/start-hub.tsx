import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { fullBleedBackground } from '@/components/layout/full-bleed'
import { HeroSection7 } from '@/components/pro-blocks/landing-page/hero-sections/hero-section-7'
import { TestimonialsSection1 } from '@/components/pro-blocks/landing-page/testimonials-sections/testimonials-section-1'
import { RundgangKarte } from '@/components/rundgang/rundgang-karte'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { Stadtplan } from '@/components/stadt/stadtplan'
import { ThemaKarte } from '@/components/thema/thema-karte'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import type { Seite } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID, STADT_SEITE_ID, THEMEN_SEITE_ID } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface StartHubProps extends React.ComponentProps<'div'> {
	seite: Seite
}

// The Startseite (issues #130, #131, epic #128): the Home / Hero built from
// `tagline`, `heading` and `intro` (Pro Blocks Hero Section 7, Figma T01
// 36579:8663), the Stadtplan section reusing the Stadt epic's own Stadtplan
// and Viertel-Kachel unchanged, the Rundgänge section (one Rundgang-Karte per
// Rundgang in rundgaenge/meta.json order, Figma 36579:9420), an optional
// testimonial from `zitat` — the same shared Zitat shape the Leitthema's own
// reuses (TestimonialsSection1, issue #124) — and the Drei Themen section
// (issue #132), in Figma's own section order. All
// Hero/testimonial fields are optional; the page renders only what's set and
// never the MDX body.
function StartHub({ seite, className, ...props }: StartHubProps) {
	const graph = contentGraph()
	const stadt = graph.getSeite(STADT_SEITE_ID)
	const rundgaenge = graph.getSeite(RUNDGAENGE_SEITE_ID)
	const themen = graph.getSeite(THEMEN_SEITE_ID)
	const { viertel, zentrum, leitthema } = graph
	// "Als Rundgang ansehen" below goes to Station 0 of the Zentrum's Schauen
	// Rundgang — the same helper and destination the Leitthema page's own hero
	// and the Stadtplan-Hub use (leitthema-detail.tsx, stadtplan-hub.tsx).
	const ersteStation = zentrum && graph.getSchauenStation(zentrum.id)
	// The Hero's "Rundgang starten" opens the first Station of the first
	// Rundgang in rundgaenge/meta.json, the same one the first Rundgang-Karte
	// starts.
	const [ersterRundgang] = graph.rundgaenge
	const [heroStation] = ersterRundgang ? graph.getStationenByRundgang(ersterRundgang.id) : []
	// "Themen-Weg beginnen" goes to Kapitel 1 (ADR-0003: "Kapitel n = Viertel n").
	const erstesKapitel = graph.kapitel.find((kapitel) => kapitel.number === 1)
	// The eight Viertel illustrations in Kapitel order, for the Leitthema
	// Thema-Karte's own "Weg K1–K8" strip (Figma Content slot 36581:7852).
	const themenWeg = graph.kapitel.map((kapitel) => ({
		kapitel,
		viertel: graph.getViertelOfKapitel(kapitel),
	}))
	// Every Themen-Ort in Ortsleiste order with its branch Kapitel and that
	// Kapitel's own Viertel resolved once, the same shape LeitthemaDetail's
	// own Abzweige section resolves (leitthema-detail.tsx).
	const themenOrte = graph.themenOrte.map((item) => {
		const kapitel = graph.getKapitel(item.kapitelId)
		if (!kapitel) throw new Error(`StartHub: unknown Kapitel ID: ${item.kapitelId}`)
		return { thema: item, kapitel, viertel: graph.getViertelOfKapitel(kapitel) }
	})
	const rundgaengeTagline = t('start.rundgaenge.tagline')

	return (
		<div data-slot="start-hub" className={cn(className)} {...props}>
			<HeroSection7
				tagline={seite.tagline}
				heading={seite.heading ?? seite.title}
				intro={seite.intro}
				actions={
					<>
						{heroStation && (
							<Link href={heroStation.url} className={buttonVariants({ variant: 'default' })}>
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

			<PageSection
				data-slot="start-rundgaenge-section"
				className={cn(fullBleedBackground, 'bg-muted/40')}
			>
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

			{leitthema && (
				<PageSection data-slot="start-themen-section">
					<div className="flex flex-col gap-10">
						<div className="flex flex-wrap items-end justify-between gap-4">
							<SectionTitle
								tagline={t('start.themen.tagline')}
								title={t('start.themen.heading')}
								description={t('start.themen.description')}
							/>
							{themen && (
								<Link href={themen.url} className={buttonVariants({ variant: 'link', size: 'sm' })}>
									{t('start.themen.cta')}
								</Link>
							)}
						</div>

						<ThemaKarte
							variant="leitthema"
							label={t('thema.leitthemaKarteLabel')}
							illustration={
								<Illustration
									id={leitthema.id}
									label={leitthema.title}
									// 260px: the Leitthema Thema-Karte's own Illustration size
									// (Figma Media slot 36581:7851).
									// eslint-disable-next-line restrictions/arbitrary-size-classes
									className="size-[260px] shrink-0"
								/>
							}
							titel={leitthema.title}
							text={leitthema.description}
							weg={
								<ol
									aria-label={t('thema.weg.tagline')}
									className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
								>
									{themenWeg.map(({ kapitel, viertel: wegViertel }, index) => (
										<li key={kapitel.id} className="flex items-center gap-2.5">
											<span className="flex flex-col items-center gap-1">
												<Illustration
													id={wegViertel.id}
													label={wegViertel.title}
													className="size-8 shrink-0"
												/>
												{/* 11px: the K1–K8 chapter chips' own size, below the Legend
												    Rule's 12px floor for every other DM Mono label
												    (kartei-design-system.md, Typography). */}
												<span className="font-mono text-[11px] text-muted-foreground">
													{t('thema.weg.kapitelBadge', { number: kapitel.number })}
												</span>
											</span>
											{index < themenWeg.length - 1 && (
												<span aria-hidden="true" className="h-px w-4 shrink-0 bg-border" />
											)}
										</li>
									))}
								</ol>
							}
							action={
								<>
									{erstesKapitel && (
										<Link
											href={erstesKapitel.url}
											className={buttonVariants({ variant: 'default' })}
										>
											{t('themenWeg.beginnen')}
											<Icon iconName="arrowRight" data-icon="inline-end" />
										</Link>
									)}
									{ersteStation && (
										<Link
											href={ersteStation.url}
											className={buttonVariants({ variant: 'outline', className: 'bg-card' })}
										>
											{t('thema.leitthemaHeroRundgangAction')}
										</Link>
									)}
								</>
							}
						/>

						{themenOrte.length > 0 && (
							<div className="flex flex-col gap-6 lg:flex-row">
								{themenOrte.map(({ thema: themenOrt, kapitel, viertel: ortViertel }) => (
									<ThemaKarte
										key={themenOrt.id}
										label={t('thema.abzweige.karteLabel', {
											viertelNumber: formatTwoDigits(ortViertel.number),
											kapitelNumber: kapitel.number,
										})}
										illustration={
											<Illustration
												id={themenOrt.id}
												label={themenOrt.title}
												// 140px: the Thema-Karte's own Illustration size (Figma 36581:7874).
												// eslint-disable-next-line restrictions/arbitrary-size-classes
												className="size-[140px] shrink-0"
											/>
										}
										titel={themenOrt.title}
										text={themenOrt.description}
										action={
											<Link
												href={ortViertel.url}
												className={buttonVariants({ variant: 'outline', className: 'bg-card' })}
											>
												{t('thema.heroInsViertelAction', { title: ortViertel.title })}
											</Link>
										}
										className="flex-1"
									/>
								))}
							</div>
						)}
					</div>
				</PageSection>
			)}
		</div>
	)
}

export { StartHub }
