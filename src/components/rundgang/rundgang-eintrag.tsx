import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { stationStopp } from '@/components/rundgang/station-stopp'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import type { Rundgang, Station } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface RundgangEintragProps extends React.ComponentProps<'article'> {
	rundgang: Rundgang
	// In route order (station.ts's orderStationen) — not renumbered here.
	stationen: readonly Station[]
}

// Xenia / Rundgang / Rundgang-Eintrag (Figma component set 36625:9280, issue
// #119): one Rundgang's own card on the Rundgänge-Hub — its illustration,
// Kennzeichen (none without one, "Known deviations from Figma" doesn't apply
// here, it's an optional field already), title, Stationen count and
// duration, introduction and actions beside its own route (every
// Stopp/Routen-Stopp "offen", stationStopp from station-stopp.tsx), its
// Leitsatz and Station badges. Reading state stays out of scope (epic #115,
// "No reading state"): one button, "Rundgang starten", to the first
// Station, instead of Figma's own "Begonnen · n/N" badge and "Fortsetzen bei
// Station n". Figma switches from its Desktop to its Mobile variant between
// 1024 and 768 — the Tailwind `lg` breakpoint, used here instead of a
// container query (unlike WegLeisteShell, this component isn't nested inside
// another width-constrained element).
function RundgangEintrag({ rundgang, stationen, className, ...props }: RundgangEintragProps) {
	const [firstStation] = stationen

	return (
		<article
			data-slot="rundgang-eintrag"
			className={cn('flex flex-col gap-8 lg:flex-row lg:gap-14', className)}
			{...props}
		>
			{/* 420px: the Rundgang-Eintrag's own Kopf column (Figma 36625:9280). */}
			{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
			<div className="flex flex-col gap-3.5 lg:w-[420px] lg:shrink-0">
				<Illustration
					id={rundgang.id}
					label={rundgang.title}
					// 120px: the Rundgang-Eintrag's own Media slot (Figma 36625:9280).
					// eslint-disable-next-line restrictions/arbitrary-size-classes
					className="size-[120px]"
				/>
				<div className="flex items-center gap-2.5">
					<span aria-hidden="true" className="font-heading text-4xl text-muted-foreground">
						{formatTwoDigits(rundgang.number)}
					</span>
					{rundgang.kennzeichen && <Badge variant="outline">{rundgang.kennzeichen}</Badge>}
				</div>
				<h3 className="heading-md text-foreground">{rundgang.title}</h3>
				<p className="font-mono text-xs text-muted-foreground">
					{t('rundgang.summary', {
						stationen: t('rundgang.stationenCount', { n: rundgang.stationenCount }),
						duration: t('rundgang.duration', { n: rundgang.durationMinutes }),
					})}
				</p>
				<p className="text-base text-muted-foreground">{rundgang.description}</p>
				<div className="flex flex-wrap items-center gap-3">
					{firstStation && (
						<Link href={firstStation.url} className={buttonVariants({ variant: 'default' })}>
							{t('rundgang.eintrag.starten')}
							<Icon iconName="arrowRight" data-icon="inline-end" />
						</Link>
					)}
					<Link href={rundgang.url} className={buttonVariants({ variant: 'ghost' })}>
						{t('rundgang.eintrag.routeAnsehen')}
					</Link>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-8">
				<div className="flex flex-wrap items-center gap-4">
					{stationen.flatMap((station, index) => [
						stationStopp(station),
						index < stationen.length - 1 && (
							<span
								key={`${station.id}-weg`}
								aria-hidden="true"
								className="h-px w-5 shrink-0 bg-border"
							/>
						),
					])}
				</div>
				{rundgang.leitsatz && (
					<p className="font-serif text-xl text-foreground italic">{rundgang.leitsatz}</p>
				)}
				<div className="flex flex-wrap gap-2">
					{stationen.map((station) => (
						<Badge key={station.id} variant="outline">
							{t('rundgang.eintrag.stationBadge', {
								number: station.number,
								name: shortTitleOrTitle(station),
							})}
						</Badge>
					))}
				</div>
			</div>
		</article>
	)
}

export { RundgangEintrag }
