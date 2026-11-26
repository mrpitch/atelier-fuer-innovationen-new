import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { Rundgang, Station } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

import { stationStopp } from './weg-leiste'

interface StationsnavigationProps extends React.ComponentProps<'nav'> {
	rundgang: Rundgang
	// The Rundgang's Stationen in route order (station.ts's orderStationen) —
	// the same list the Rundgang-Übersicht's Weg-Leiste gets, so this and
	// that component never derive two different orders for one Rundgang.
	stationen: readonly Station[]
	current: Station
}

// Below `lg` (kartei-design-system.md, Layout rules: "Rundgang station
// pages ... the bottom bar keeps only the previous and next buttons, without
// their stop illustrations") the previous/next buttons drop their own
// Illustration — 390 has no room for it beside the two-line label.
function previousItem(rundgang: Rundgang, station: Station) {
	return (
		<Item render={<Link href={station.url} />} variant="outline" className="flex-1">
			<ItemMedia className="hidden size-10 lg:flex">
				<Illustration id={station.ortId ?? rundgang.id} label={shortTitleOrTitle(station)} />
			</ItemMedia>
			<ItemContent>
				<ItemDescription>
					{t('station.previousPosition', { number: station.number })}
				</ItemDescription>
				<ItemTitle>
					<Icon iconName="arrowLeft" className="size-3.5 shrink-0" />
					{shortTitleOrTitle(station)}
				</ItemTitle>
			</ItemContent>
		</Item>
	)
}

function nextItem(rundgang: Rundgang, station: Station) {
	return (
		<Item
			render={<Link href={station.url} />}
			className="flex-1 border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80"
		>
			<ItemMedia className="hidden size-10 lg:flex">
				<Illustration id={station.ortId ?? rundgang.id} label={shortTitleOrTitle(station)} />
			</ItemMedia>
			<ItemContent>
				<ItemDescription className="text-primary-foreground/80">
					{t('station.nextPosition', { number: station.number })}
				</ItemDescription>
				<ItemTitle>
					{shortTitleOrTitle(station)}
					<Icon iconName="arrowRight" className="size-3.5 shrink-0" />
				</ItemTitle>
			</ItemContent>
		</Item>
	)
}

// Xenia / Rundgang / Stationsnavigation (Figma 36625:9412, issue #120): a
// Station page's own previous/next — none at either end of the Rundgang
// (station.ts's `lastNumber`/offset already settle where those are) — and,
// from `lg` only (kartei-design-system.md, Breakpoints: "Stationsnavigation"
// switches at `lg`, hidden below it, the same as the Rundgang-Leiste), every
// Stopp of the Rundgang: "gesehen" before the current Station, "aktuell" at
// it, "offen" after — reusing weg-leiste.tsx's own Stopp/Routen-Stopp choice
// (stationStopp) instead of repeating it.
function Stationsnavigation({
	rundgang,
	stationen,
	current,
	className,
	...props
}: StationsnavigationProps) {
	const index = stationen.findIndex((station) => station.id === current.id)
	const previous = index > 0 ? stationen[index - 1] : undefined
	const next = index !== -1 && index < stationen.length - 1 ? stationen[index + 1] : undefined

	return (
		<nav
			data-slot="stationsnavigation"
			aria-label={t('station.navigationLabel')}
			className={cn(
				'flex items-stretch gap-4 border-t border-border px-5 py-4 lg:items-center lg:px-24',
				className,
			)}
			{...props}
		>
			{previous ? previousItem(rundgang, previous) : <div className="flex-1" />}
			<div className="hidden items-center gap-2 lg:flex">
				{stationen.map((station, stationIndex) =>
					stationStopp(
						station,
						stationIndex < index ? 'gesehen' : stationIndex === index ? 'aktuell' : 'offen',
					),
				)}
			</div>
			{next ? nextItem(rundgang, next) : <div className="flex-1" />}
		</nav>
	)
}

export { Stationsnavigation }
