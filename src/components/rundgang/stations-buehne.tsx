import { cn } from 'cn'
import type * as React from 'react'

import { MiniStadtplan } from '@/components/stadt/mini-stadtplan'
import { Illustration } from '@/components/ui/illustration'
import type { Ort, Rundgang, Station, Viertel, Zentrum } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

import { ortIsViertel } from './gangarten'

interface StationsBuehneProps extends React.ComponentProps<'div'> {
	station: Station
	rundgang: Rundgang
	ort: Ort | undefined
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
}

// Xenia / Rundgang / Stations-Bühne (Figma 36625:9587, issue #121): a
// Station's illustration stage. At an Ort, that Ort's own name ("VIERTEL 03"
// or "ZENTRUM") beside the Station's own ("Station 03"), the Ort's
// illustration, and — below it — the Mini-Stadtplan with the Ort "aktuell"
// beside "Sie sind hier" and the Station's own `lage` note. Without an Ort,
// there's no Ort to name or place on a Stadtplan, so only the Station's own
// label and the Rundgang's illustration show; the `lage` note still shows
// alone when the Station carries one — Figma draws no screen for this (no
// Ort), so this mirrors the "at an Ort" layout with its Ort-only parts left
// out instead. The Mobile/Desktop variants share this one layout: only the
// illustration and the Ort/Station label row resize, at `xl`
// (kartei-design-system.md, Breakpoints: "Stations-Bühne").
function StationsBuehne({
	station,
	rundgang,
	ort,
	viertel,
	zentrum,
	className,
	...props
}: StationsBuehneProps) {
	const illustrationId = ort?.id ?? rundgang.id
	const ortLabel =
		ort === undefined
			? undefined
			: ortIsViertel(ort)
				? t('stadt.hub.kachelNummer', { number: formatTwoDigits(ort.number) })
				: t('stadt.hub.zentrumNummer')
	const hasLageBlock = ort !== undefined || station.lage !== undefined

	return (
		<div
			data-slot="stations-buehne"
			className={cn('flex shrink-0 flex-col gap-10 bg-muted p-6 xl:w-1/2 xl:p-10', className)}
			{...props}
		>
			<div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase">
				{ortLabel && <span>{ortLabel}</span>}
				<span className={cn(ortLabel === undefined && 'ml-auto')}>
					{t('station.buehneLabel', { number: formatTwoDigits(station.number) })}
				</span>
			</div>
			<div className="flex flex-1 items-center justify-center">
				<Illustration
					id={illustrationId}
					label={shortTitleOrTitle(station)}
					className="size-40 xl:size-56"
				/>
			</div>
			{hasLageBlock && (
				<div className="flex flex-wrap items-center gap-6">
					{ort && <MiniStadtplan viertel={viertel} zentrum={zentrum} aktuellId={ort.id} />}
					{station.lage && (
						<div className="flex flex-col gap-1">
							<p className="text-sm font-medium text-foreground">{t('navigation.youAreHere')}</p>
							<p className="text-xs text-muted-foreground">{station.lage}</p>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export { StationsBuehne }
