import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { Site } from '@/lib/content'

interface WortmarkeProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
	site: Site
	homeUrl: string
}

// Xenia / Site / Wortmarke (Figma 36577:16140): the site name over its
// tagline, linking to the Startseite. Its own component (DESIGN.md,
// Navigation) so the header, the footer and the mobile header (#84) share
// one implementation instead of each restating the two-line brand mark. The
// name's 28px is Figma's own size, between the scale's text-2xl and text-3xl.
function Wortmarke({ site, homeUrl, className, ...props }: WortmarkeProps) {
	return (
		<Link
			data-slot="wortmarke"
			href={homeUrl}
			className={cn('inline-flex items-baseline gap-2.5', className)}
			{...props}
		>
			<span className="font-heading text-[28px] leading-none tracking-[-0.01em] text-foreground">
				{site.name}
			</span>
			<span className="font-mono text-xs text-muted-foreground">{site.tagline}</span>
		</Link>
	)
}

export { Wortmarke }
