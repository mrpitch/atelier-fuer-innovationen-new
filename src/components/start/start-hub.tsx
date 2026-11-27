import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { TestimonialsSection1 } from '@/components/pro-blocks/landing-page/testimonials-sections/testimonials-section-1'
import { PageSection } from '@/components/stadt/page-section'
import type { Seite } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface StartHubProps extends React.ComponentProps<'div'> {
	seite: Seite
}

const STADT_SEITE_ID = 'stadt'
const THEMEN_SEITE_ID = 'themen'

// The Startseite (issue #129, epic #128): a Hero built from `tagline`,
// `heading` and `intro`, an optional testimonial from `zitat` — the same
// shared Zitat shape the Leitthema's own reuses (TestimonialsSection1,
// issue #124) — and a link into each of the three areas. All four Hero/
// testimonial fields are optional; the page renders only what's set and
// never the MDX body (user stories 26–30).
function StartHub({ seite, className, ...props }: StartHubProps) {
	const graph = contentGraph()
	const stadt = graph.getSeite(STADT_SEITE_ID)
	const rundgaenge = graph.getSeite(RUNDGAENGE_SEITE_ID)
	const themen = graph.getSeite(THEMEN_SEITE_ID)

	return (
		<div data-slot="start-hub" className={cn(className)} {...props}>
			<PageSection data-slot="start-hero">
				{seite.tagline && <Tagline>{seite.tagline}</Tagline>}
				<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] hyphens-auto text-foreground xl:text-[88px]">
					{seite.heading ?? seite.title}
				</h1>
				{seite.intro && <p className="text-lg text-muted-foreground">{seite.intro}</p>}
			</PageSection>

			{seite.zitat && <TestimonialsSection1 zitat={seite.zitat} />}

			<PageSection data-slot="start-navigation">
				<nav aria-label={t('start.hub.navigation')}>
					<ul className="flex flex-col gap-10 md:flex-row">
						{stadt && (
							<li>
								<h2 className="heading-sm text-foreground">{t('start.hub.stadtplanHeading')}</h2>
								<Link href={stadt.url}>{t('start.hub.stadtplanLink')}</Link>
							</li>
						)}
						{rundgaenge && (
							<li>
								<h2 className="heading-sm text-foreground">{t('start.hub.rundgaengeHeading')}</h2>
								<Link href={rundgaenge.url}>{t('start.hub.rundgaengeLink')}</Link>
							</li>
						)}
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
