import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { BreadcrumbTrail } from '@/components/navigation/breadcrumb-trail'
import { PlaceBar } from '@/components/navigation/place-bar'
import { buttonVariants } from '@/components/ui/button'
import type { NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface OrtsleisteProps extends React.ComponentProps<'div'> {
	// The breadcrumb trail (graph.getBreadcrumbs), root Seite included — the
	// root never shows here (issue #82, Figma): every Ortsleiste screen draws
	// it starting at the area's own hub Seite (Stadtplan, Rundgänge, Themen).
	breadcrumbs: readonly NavigationLink[]
	previous?: NavigationLink
	next?: NavigationLink
}

// A neighbour's visible name: its Short title alone, or, for a Viertel
// neighbour, its number first (NavigationLink.number), the same composition
// stadtplan.tsx uses for a Viertel-Kachel's own numbered title.
function neighbourLabel(link: NavigationLink): string {
	return link.number === undefined
		? link.title
		: t('viertel.numberedTitle', { number: formatTwoDigits(link.number), title: link.title })
}

function NeighbourLink({
	link,
	direction,
}: {
	link: NavigationLink
	direction: 'previous' | 'next'
}) {
	return (
		<Link href={link.url} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
			{t(`ortsleiste.${direction}`, { label: neighbourLabel(link) })}
		</Link>
	)
}

// The breadcrumb on the left and the neighbouring places on the right
// (Kartei design system, Place bar), replacing the separate Breadcrumbs and
// PreviousNext on the Viertel, Zentrum, Rundgang and Thema pages (issue
// #82). Stacked up to 1279px, a row from 1280 up: at 1024 long neighbour names
// ("Besuch in der Umgebung →") don't fit beside the breadcrumb (issue #110,
// Kartei design system, Breakpoints). The Ebenen-Leiste keeps the PlaceBar's
// 1024 switch.
function Ortsleiste({ breadcrumbs, previous, next, className, ...props }: OrtsleisteProps) {
	return (
		<PlaceBar
			data-slot="ortsleiste"
			className={cn(
				'lg:flex-col lg:items-start lg:px-5 xl:flex-row xl:items-center xl:justify-between xl:px-24',
				className,
			)}
			{...props}
		>
			<BreadcrumbTrail breadcrumbs={breadcrumbs} />
			{(previous !== undefined || next !== undefined) && (
				<div className="flex items-center gap-2">
					{previous && <NeighbourLink link={previous} direction="previous" />}
					{next && <NeighbourLink link={next} direction="next" />}
				</div>
			)}
		</PlaceBar>
	)
}

export { Ortsleiste }
