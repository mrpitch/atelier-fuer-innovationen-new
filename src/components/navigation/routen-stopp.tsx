import { cva } from 'class-variance-authority'
import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { StoppStatus } from './stopp'

const routenStoppVariants = cva(
	'flex flex-col items-center gap-1 rounded-sm p-1 font-mono text-xs font-medium',
	{
		variants: {
			status: {
				aktuell: 'text-primary',
				gesehen: 'text-muted-foreground',
				offen: 'text-muted-foreground',
			},
		},
		defaultVariants: { status: 'offen' },
	},
)

const routenStoppNummerVariants = cva(
	'flex size-9 items-center justify-center rounded-full border',
	{
		variants: {
			status: {
				aktuell: 'border-primary bg-secondary',
				gesehen: 'border-border',
				offen: 'border-border',
			},
		},
		defaultVariants: { status: 'offen' },
	},
)

interface RoutenStoppProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
	href: string
	nummer: number
	name: string
	status?: StoppStatus
}

// Xenia / Rundgang / Routen-Stopp (Figma 36598:35017, issue #118): a Station
// with no Ort (glossary) on the Weg-Leiste's Rundgang mode — a plain
// numbered circle with its own name below, since there is no Illustration to
// show instead. Figma draws this as a single component with no reading-state
// variant, since a Rundgang-Übersicht tracks no current position: every
// Stopp there is "offen" (weg-leiste.tsx). A Station's own Stationsnavigation
// (issue #120) does track one, and a Station without an Ort is as much a
// Routen-Stopp there as on the Übersicht — so this carries Stopp's own
// status styling (stoppVariants' aktuell look) rather than only ever
// rendering its Figma-drawn "offen" look.
function RoutenStopp({
	href,
	nummer,
	name,
	status = 'offen',
	className,
	...props
}: RoutenStoppProps) {
	return (
		<Link
			href={href}
			data-slot="routen-stopp"
			data-status={status}
			aria-current={status === 'aktuell' ? 'page' : undefined}
			className={cn(routenStoppVariants({ status }), className)}
			{...props}
		>
			<span className={routenStoppNummerVariants({ status })}>{nummer}</span>
			<span className="w-20 text-center text-xs leading-tight">{name}</span>
		</Link>
	)
}

export { RoutenStopp, routenStoppNummerVariants, routenStoppVariants }
