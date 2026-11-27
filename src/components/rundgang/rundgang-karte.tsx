import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import type { Rundgang, Station } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface RundgangKarteProps extends React.ComponentProps<'div'> {
	rundgang: Rundgang
	// In route order (station.ts's orderStationen) — not renumbered here.
	stationen: readonly Station[]
}

// Xenia / Rundgang / Rundgang-Karte (Figma 36581:7693, issue #131): one
// Rundgang's own compact card on the Startseite's Rundgänge section — unlike
// the Rundgänge-Hub's own Rundgang-Eintrag, no illustration, Kennzeichen,
// Leitsatz or Station badges, just its number, "n Stationen · n Min.", title
// and route, and the one "Rundgang starten" action. Figma also draws a short
// descriptive line (the "Text" property) that neither this issue's field
// list nor the Rundgang content model carries — left out rather than
// hand-typed. The Route line itself is left out entirely when no Station
// stands at an Ort (`rundgang.routeOrte` empty): "Annäherung → Kontexte →
// Zukunft"-style examples in Figma don't correspond to any real Rundgang's
// actual Stationen, none of which name an Ort outside "Besuch im Zentrum".
function RundgangKarte({ rundgang, stationen, className, ...props }: RundgangKarteProps) {
	const [firstStation] = stationen
	const stationenText =
		rundgang.stationenCount === 1
			? t('rundgang.karte.stationSingular')
			: t('rundgang.stationenCount', { n: rundgang.stationenCount })

	return (
		<Card
			data-slot="rundgang-karte"
			size="sm"
			className={cn('gap-4 rounded-none bg-transparent p-0 ring-0', className)}
			{...props}
		>
			<span aria-hidden="true" className="heading-xl text-primary">
				{formatTwoDigits(rundgang.number)}
			</span>
			<p className="font-mono text-xs text-primary">
				{t('rundgang.summary', {
					stationen: stationenText,
					duration: t('rundgang.karte.duration', { n: rundgang.durationMinutes }),
				})}
			</p>
			<h3 className="heading-md text-primary">{rundgang.title}</h3>
			{rundgang.routeOrte.length > 0 && (
				<p className="border-t border-border pt-4 font-mono text-xs text-primary">
					{rundgang.routeOrte.join(t('rundgang.karte.routeSeparator'))}
				</p>
			)}
			{firstStation && (
				<Link href={firstStation.url} className={buttonVariants({ variant: 'default' })}>
					{t('rundgang.karte.starten')}
					<Icon iconName="arrowRight" data-icon="inline-end" />
				</Link>
			)}
		</Card>
	)
}

export { RundgangKarte }
