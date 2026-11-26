import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

interface RoutenStoppProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
	href: string
	nummer: number
	name: string
}

// Xenia / Rundgang / Routen-Stopp (Figma 36598:35017, issue #118): a Station
// with no Ort (glossary) on the Weg-Leiste's Rundgang mode — a plain
// numbered circle with its own name below, since there is no Illustration to
// show instead. Unlike Stopp's component set, Figma draws no reading-state
// variant for this one: every Stopp on a Rundgang-Übersicht is "offen" (no
// current position, no reading state tracked there), so this never changes
// its look.
function RoutenStopp({ href, nummer, name, className, ...props }: RoutenStoppProps) {
	return (
		<Link
			href={href}
			data-slot="routen-stopp"
			className={cn(
				'flex flex-col items-center gap-1 rounded-sm p-1 text-muted-foreground',
				className,
			)}
			{...props}
		>
			<span className="flex size-9 items-center justify-center rounded-full border border-border font-mono text-xs font-medium">
				{nummer}
			</span>
			<span className="w-20 text-center text-xs leading-tight">{name}</span>
		</Link>
	)
}

export { RoutenStopp }
