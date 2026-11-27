import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Wortmarke } from '@/components/layout/wortmarke'
import { buttonVariants } from '@/components/ui/button'
import { Fortschritt } from '@/components/ui/fortschritt'
import { MonoLabel } from '@/components/ui/mono-label'
import { Separator } from '@/components/ui/separator'
import type { Rundgang, Station } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface RundgangLeisteProps extends React.ComponentProps<'div'> {
	rundgang: Rundgang
	station: Station
}

// Xenia / Rundgang / Rundgang-Leiste (Figma component set 36625:9356, issue
// #120): a Station page's own top bar, replacing the site Header there — the
// Wortmarke, the Rundgang's name, a Fortschritt filled to the current
// Station, "Station n von N · Name", "noch ca. n Min.", and the "Route" /
// "Rundgang beenden" actions. Figma's own two variants (Breakpoint=Desktop,
// Breakpoint=Mobile) switch at `lg` (kartei-design-system.md, Breakpoints:
// "Rundgang-Eintrag, Rundgang-Leiste"), the same as Header/Footer and most
// other components — not `xl` as its 1024 frame's own wrapped single-row
// Desktop instance might suggest at a glance.
function RundgangLeiste({ rundgang, station, className, ...props }: RundgangLeisteProps) {
	// "Rundgang beenden" leads to the Rundgänge-Hub, distinct from `rundgang.url`,
	// the one Rundgang's own Rundgang-Übersicht "Route" already links to.
	const graph = contentGraph()
	const hub = graph.getSeite(RUNDGAENGE_SEITE_ID)
	if (!hub) throw new Error(`RundgangLeiste: unknown Seite ID: ${RUNDGAENGE_SEITE_ID}`)

	return (
		<div
			data-slot="rundgang-leiste"
			className={cn(
				'flex flex-col gap-4 border-b border-border bg-background px-5 py-4 lg:flex-row lg:items-center lg:gap-6 lg:px-24',
				className,
			)}
			{...props}
		>
			<div className="flex shrink-0 items-center gap-4">
				<Wortmarke
					site={graph.site}
					homeUrl={graph.navigation.url}
					showTagline={false}
					className="shrink-0"
				/>
				<Separator orientation="vertical" role="presentation" className="h-8" />
				<div className="flex flex-col gap-0.5">
					<MonoLabel>{t('rundgang.leisteEyebrow')}</MonoLabel>
					<p className="text-sm font-semibold text-foreground">{shortTitleOrTitle(rundgang)}</p>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
				<Fortschritt total={station.lastNumber} current={station.number} className="lg:flex-1" />
				<div className="flex items-center justify-between gap-4 lg:shrink-0">
					<p className="text-sm font-medium text-foreground">
						{t('station.leistePosition', {
							number: station.number,
							total: station.lastNumber,
							title: shortTitleOrTitle(station),
						})}
					</p>
					<p className="text-sm text-muted-foreground">
						{t('station.leisteRestzeit', { n: station.remainingMinutes })}
					</p>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-3">
				<Link
					href={`${rundgang.url}#route`}
					className={buttonVariants({ variant: 'ghost', size: 'sm' })}
				>
					{t('rundgang.leisteRoute')}
				</Link>
				<Link href={hub.url} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
					{t('rundgang.leisteBeenden')}
				</Link>
			</div>
		</div>
	)
}

export { RundgangLeiste }
