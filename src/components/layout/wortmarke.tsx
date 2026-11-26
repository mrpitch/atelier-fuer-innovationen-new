import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { Site } from '@/lib/content'

interface WortmarkeProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
	site: Site
	homeUrl: string
	// The Rundgang-Leiste's own "Marke" (Figma 36625:9356, issue #120) sets no
	// tagline, unlike every other caller: its "Xenia" stands beside the
	// Rundgang's own name instead, so the tagline would repeat site context
	// the Rundgang-Leiste no longer needs.
	showTagline?: boolean
}

// Xenia / Site / Wortmarke (Figma 36577:16140): the site name over its
// tagline, linking to the Startseite. Its own component (Kartei design system,
// Navigation) so the header, the footer and the mobile header (#84) share
// one implementation instead of each restating the two-line brand mark. The
// name's 28px is Figma's own size, between the scale's text-2xl and text-3xl.
function Wortmarke({ site, homeUrl, showTagline = true, className, ...props }: WortmarkeProps) {
	return (
		<Link
			data-slot="wortmarke"
			href={homeUrl}
			className={cn('inline-flex items-baseline gap-2.5', className)}
			{...props}
		>
			<span
				className={cn(
					'font-heading leading-none tracking-[-0.01em] text-foreground',
					showTagline ? 'text-[28px]' : 'text-2xl',
				)}
			>
				{site.name}
			</span>
			{showTagline && (
				<span className="font-mono text-xs text-muted-foreground">{site.tagline}</span>
			)}
		</Link>
	)
}

export { Wortmarke }
