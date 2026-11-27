import Link from 'next/link'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { TestimonialsSection1 } from '@/components/pro-blocks/landing-page/testimonials-sections/testimonials-section-1'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { ThemaKarte } from '@/components/thema/thema-karte'
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
import type { Thema } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface LeitthemaDetailProps extends React.ComponentProps<'div'> {
	thema: Thema
	locale?: string
}

// The Leitthema's own page content (Figma T09a, issue #126): Bild-Hero, "Der
// Themen-Weg" (one row per Kapitel, in Viertel order), an optional
// Testimonial and "Abzweige vom Weg" (one Thema-Karte per Themen-Ort) —
// shared between its dedicated German route and the catch-all route's
// localized rendering (issue #36). Called only for the Leitthema (`thema`
// with no `kapitelId`); a Themen-Ort gets ThemenOrtDetail's own rendering
// (issue #125).
// `locale` stays in the signature to match ThemaDetail's own uniform
// forwarding to either branch (thema-detail.tsx), but goes unused: unlike
// every other Detail component, this one's intro is the Leitthema's own
// `description` (already locale-resolved by the caller), not its MDX body —
// so, alone among them, it never calls `getBody`.
async function LeitthemaDetail({ thema, locale: _locale, ...props }: LeitthemaDetailProps) {
	const graph = contentGraph()
	const { zentrum } = graph

	// "Themen-Weg beginnen" goes to Kapitel 1 (ADR-0003: "Kapitel n = Viertel n").
	const erstesKapitel = graph.kapitel.find((kapitel) => kapitel.number === 1)
	// "Als Rundgang ansehen" goes to Station 0 of the Zentrum's own Schauen
	// Rundgang — the same helper and the same destination the Stadtplan-Hub's
	// own "Rundgang durch alle Viertel" action uses (stadtplan-hub.tsx).
	const ersteStation = zentrum && graph.getSchauenStation(zentrum.id)

	// Every Themen-Ort in Ortsleiste order (graph.themenOrte) with its branch
	// Kapitel and that Kapitel's own Viertel resolved once — for everything
	// below that needs it: the Ortsleiste's own two actions, the Abzweige
	// heading and each Thema-Karte.
	const themenOrte = graph.themenOrte.map((item) => {
		const kapitel = graph.getKapitel(item.kapitelId)
		if (!kapitel) throw new Error(`LeitthemaDetail: unknown Kapitel ID: ${item.kapitelId}`)
		return { thema: item, kapitel, viertel: graph.getViertelOfKapitel(kapitel) }
	})
	const [ersterThemenOrt, zweiterThemenOrt] = themenOrte

	return (
		<div data-slot="leitthema-detail" {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(thema.id)}
				previous={ersterThemenOrt?.thema}
				next={zweiterThemenOrt?.thema}
			/>
			<BildHero
				eyebrow={t('thema.leitthemaHeroEyebrow')}
				title={thema.title}
				zitat={thema.leitsatz}
				zitatStyle="italic"
				eyebrowTone="primary"
				illustration={
					<Illustration
						id={thema.id}
						label={thema.title}
						// 220px below xl, 420px from xl (Figma T09a 36626:28730, 36603:12965).
						// eslint-disable-next-line restrictions/arbitrary-size-classes
						className="size-[220px] xl:size-[420px]"
					/>
				}
				actions={
					<>
						{erstesKapitel && (
							<Link href={erstesKapitel.url} className={buttonVariants({ variant: 'default' })}>
								{t('thema.leitthemaHeroWegAction')}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						)}
						{ersteStation && (
							<Link href={ersteStation.url} className={buttonVariants({ variant: 'ghost' })}>
								{t('thema.leitthemaHeroRundgangAction')}
							</Link>
						)}
					</>
				}
			>
				<p>{thema.description}</p>
			</BildHero>

			<PageSection data-slot="themen-weg-section" className="md:px-5 xl:px-24">
				<SectionTitle
					tagline={t('thema.weg.tagline')}
					title={t('thema.weg.title')}
					description={t('thema.weg.description')}
					className="mb-10"
				/>
				<ol className="flex flex-col gap-3">
					{graph.kapitel.map((kapitel) => {
						const viertel = graph.getViertelOfKapitel(kapitel)
						const abschnitteCount = graph.getAbschnitteByKapitel(kapitel.id).length

						return (
							<li key={kapitel.id}>
								<Item render={<Link href={kapitel.url} />} variant="outline">
									<span aria-hidden="true" className="font-mono text-xs font-semibold text-primary">
										{t('thema.weg.kapitelBadge', { number: kapitel.number })}
									</span>
									<ItemMedia className="size-10">
										<Illustration id={viertel.id} label={viertel.title} />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>
											{t('thema.weg.kapitelTitle', {
												number: kapitel.number,
												title: shortTitleOrTitle(kapitel),
											})}
										</ItemTitle>
										<ItemDescription>
											{t('thema.weg.viertelLine', {
												number: formatTwoDigits(viertel.number),
												title: viertel.title,
												n: abschnitteCount,
											})}
										</ItemDescription>
									</ItemContent>
									{decorativeCta('outline', t('thema.weg.lesen'))}
								</Item>
							</li>
						)
					})}
				</ol>
			</PageSection>

			{thema.zitat && <TestimonialsSection1 zitat={thema.zitat} />}

			<PageSection data-slot="abzweige-section" className="md:px-5 xl:px-24">
				<SectionTitle
					tagline={t('thema.abzweige.tagline')}
					title={t('thema.abzweige.title')}
					description={
						ersterThemenOrt &&
						zweiterThemenOrt &&
						t('thema.abzweige.description', {
							ersterTitle: ersterThemenOrt.thema.title,
							zweiterTitle: zweiterThemenOrt.thema.title,
							ersterKapitel: ersterThemenOrt.kapitel.number,
							zweiterKapitel: zweiterThemenOrt.kapitel.number,
						})
					}
					className="mb-10"
				/>
				<div className="flex flex-col gap-6 lg:flex-row">
					{themenOrte.map(({ thema: themenOrt, kapitel, viertel }) => (
						<ThemaKarte
							key={themenOrt.id}
							label={t('thema.abzweige.karteLabel', {
								viertelNumber: formatTwoDigits(viertel.number),
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
							action={{
								label: t('thema.abzweige.karteAction', { title: shortTitleOrTitle(themenOrt) }),
								href: themenOrt.url,
							}}
							className="flex-1"
						/>
					))}
				</div>
			</PageSection>
		</div>
	)
}

export { LeitthemaDetail }
