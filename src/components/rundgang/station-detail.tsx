import Link from 'next/link'
import type * as React from 'react'

import { RundgangLeiste } from '@/components/navigation/rundgang-leiste'
import { Stationsnavigation } from '@/components/navigation/stationsnavigation'
import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item'
import { RichText } from '@/components/ui/rich-text'
import type { Station } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

import { buildStationGangart, resolveOrt } from './gangarten'
import { StationsBuehne } from './stations-buehne'

interface StationDetailProps extends React.ComponentProps<'div'> {
	station: Station
	locale?: string
}

// A Station's own page content, walking mode (Figma T06, issues #120, #121):
// its own layout, without the site Header and Footer (page.tsx leaves both
// out instead of the usual SiteShell) — the Rundgang-Leiste takes their
// place. Below it, the Stations-Bühne beside the Stadtführer text (tagline,
// title, MDX body) and — at an Ort — the Gangart switch into the Leitthema's
// own Lesen Gangart, then the Stationsnavigation; shared between the
// dedicated German route and the catch-all route's localized rendering
// (issue #36). The illustration/text split switches at `xl`
// (kartei-design-system.md, Breakpoints: "Stations-Bühne"). The heading is
// the full title, not the Short title (issue #23), same as AbschnittDetail's
// own; Short title stays for neighbor labels and the Illustration's
// accessible name.
async function StationDetail({ station, locale, ...props }: StationDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(station.id, locale)
	const rundgang = graph.getRundgang(station.rundgangId)
	if (!rundgang) throw new Error(`StationDetail: unknown Rundgang ID: ${station.rundgangId}`)
	const stationen = graph.getStationenByRundgang(rundgang.id)
	const ort = resolveOrt(graph, station.ortId)
	const gangart = ort && buildStationGangart(graph, ort)

	return (
		<div data-slot="station-detail" {...props}>
			<RundgangLeiste rundgang={rundgang} station={station} />
			<div className="flex flex-col xl:flex-row">
				<StationsBuehne
					station={station}
					rundgang={rundgang}
					ort={ort}
					viertel={graph.viertel}
					zentrum={graph.zentrum}
				/>
				<div className="flex flex-1 flex-col gap-5 px-5 py-12 xl:px-16 xl:py-20">
					<Tagline>
						{t('station.stadtfuehrerTagline', {
							number: station.number,
							total: station.lastNumber,
						})}
					</Tagline>
					<h1 className="font-heading text-[40px] leading-none tracking-[-0.02em] text-foreground xl:text-[48px]">
						{station.title}
					</h1>
					<RichText>
						<Body components={bodyImageComponents(station.id)} />
					</RichText>
					{gangart && (
						<div className="flex flex-col items-start gap-4">
							{gangart.aktion && (
								<Item variant="outline">
									<ItemMedia>
										<Illustration
											id={gangart.aktion.illustrationId}
											label={gangart.aktion.illustrationLabel}
										/>
									</ItemMedia>
									<ItemContent>
										<ItemTitle>{gangart.aktion.title}</ItemTitle>
										<ItemDescription>{t('rundgang.gangartWechseln')}</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Link
											href={gangart.aktion.aktionHref}
											className={buttonVariants({ variant: 'secondary', size: 'sm' })}
										>
											{gangart.aktion.aktionLabel}
											<Icon iconName="arrowRight" data-icon="inline-end" />
										</Link>
									</ItemActions>
								</Item>
							)}
							<Link
								href={gangart.erkundenHref}
								className={buttonVariants({ variant: 'link', size: 'sm' })}
							>
								{gangart.erkundenLabel}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						</div>
					)}
				</div>
			</div>
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={station} />
		</div>
	)
}

export { StationDetail }
