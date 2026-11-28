import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { BreadcrumbTrail } from '@/components/navigation/breadcrumb-trail'
import { PlaceBar } from '@/components/navigation/place-bar'
import { buttonVariants } from '@/components/ui/button'
import type { MenuLink, NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface OrtsleisteProps extends React.ComponentProps<'div'> {
	// The breadcrumb trail (graph.getBreadcrumbs), root Seite included — the
	// root never shows here (issue #82, Figma): every Ortsleiste screen draws
	// it starting at the area's own hub Seite (Stadtplan, Rundgänge, Themen).
	breadcrumbs: readonly NavigationLink[]
	previous?: NavigationLink
	next?: NavigationLink
	// The other footer-legal pages (graph.getMenu('footer-legal'), minus the
	// current page), for a legal page's own Ortsleiste in place of
	// previous/next (issue #135): a legal page has no neighbour sequence of
	// its own to walk.
	actions?: readonly MenuLink[]
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

function ActionLink({ action }: { action: MenuLink }) {
	return (
		<Link
			href={action.url}
			className={cn(
				buttonVariants({ variant: 'link', size: 'sm' }),
				'h-auto px-0 text-muted-foreground hover:text-foreground',
			)}
		>
			{action.label}
		</Link>
	)
}

// The breadcrumb on the left and the neighbouring places on the right
// (Kartei design system, Place bar), replacing the separate Breadcrumbs and
// PreviousNext on the Viertel, Zentrum, Rundgang and Thema pages (issue
// #82). Stacked up to 1279px, a row from 1280 up: at 1024 long neighbour names
// ("Besuch in der Umgebung →") don't fit beside the breadcrumb (issue #110,
// Kartei design system, Breakpoints). `actions` (issue #135) replaces that
// neighbour pair with the other footer-legal pages for a legal page.
function Ortsleiste({
	breadcrumbs,
	previous,
	next,
	actions,
	className,
	...props
}: OrtsleisteProps) {
	return (
		<PlaceBar
			data-slot="ortsleiste"
			switchAt="xl"
			className={cn('xl:justify-between', className)}
			{...props}
		>
			<BreadcrumbTrail breadcrumbs={breadcrumbs} />
			{actions !== undefined
				? actions.length > 0 && (
						<div className="flex flex-wrap items-center gap-6">
							{actions.map((action) => (
								<ActionLink key={action.url} action={action} />
							))}
						</div>
					)
				: (previous !== undefined || next !== undefined) && (
						<div className="flex items-center gap-2">
							{previous && <NeighbourLink link={previous} direction="previous" />}
							{next && <NeighbourLink link={next} direction="next" />}
						</div>
					)}
		</PlaceBar>
	)
}

export { Ortsleiste }
