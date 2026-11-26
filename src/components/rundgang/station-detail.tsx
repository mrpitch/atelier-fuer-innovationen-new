import type * as React from 'react'

import { RundgangLeiste } from '@/components/navigation/rundgang-leiste'
import { Stationsnavigation } from '@/components/navigation/stationsnavigation'
import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { Illustration } from '@/components/ui/illustration'
import { RichText } from '@/components/ui/rich-text'
import type { Station } from '@/lib/content'
import { contentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface StationDetailProps extends React.ComponentProps<'div'> {
	station: Station
	locale?: string
}

// A Station's own page content, walking mode (Figma T06, issue #120): its
// own layout, without the site Header and Footer (page.tsx leaves both out
// instead of the usual SiteShell) — the Rundgang-Leiste takes their place.
// Below it, the Stadtführer text (tagline, title, MDX body) beside the
// Station's illustration, then the Stationsnavigation. The Stations-Bühne
// (a Stadtplan-position illustration backdrop) and the Gangart switch (a
// "Kapitel n lesen" card, "Viertel n frei erkunden") are a later ticket's
// (the left column holds only the illustration until then); this is shared
// between the dedicated German route and the catch-all route's localized
// rendering (issue #36). The illustration/text split switches at `xl`
// (kartei-design-system.md, Breakpoints: "Stations-Bühne"), so this
// placeholder stage keeps the same reveal point the full Stations-Bühne
// will once it replaces it. The heading is the full title, not the Short
// title (issue #23), same as AbschnittDetail's own; Short title stays for
// neighbor labels and the Illustration's accessible name.
async function StationDetail({ station, locale, ...props }: StationDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(station.id, locale)
	const rundgang = graph.getRundgang(station.rundgangId)
	if (!rundgang) throw new Error(`StationDetail: unknown Rundgang ID: ${station.rundgangId}`)
	const stationen = graph.getStationenByRundgang(rundgang.id)

	return (
		<div data-slot="station-detail" {...props}>
			<RundgangLeiste rundgang={rundgang} station={station} />
			<div className="flex flex-col xl:flex-row">
				<div className="flex shrink-0 items-center justify-center bg-muted p-10 xl:w-1/2">
					<Illustration
						id={station.ortId ?? rundgang.id}
						label={shortTitleOrTitle(station)}
						className="size-40 xl:size-56"
					/>
				</div>
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
				</div>
			</div>
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={station} />
		</div>
	)
}

export { StationDetail }
