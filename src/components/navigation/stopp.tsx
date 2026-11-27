import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Illustration } from '@/components/ui/illustration'

const stoppVariants = cva(
	'flex flex-col items-center gap-1 rounded-sm p-1 font-mono text-xs font-medium',
	{
		variants: {
			status: {
				aktuell: 'border border-primary bg-secondary text-primary',
				// Figma's own Status=gesehen variant (36585:8190) renders identically
				// to Status=offen (36585:8228): same fills, same Nummer colour. A
				// Stationsnavigation (issue #120) still sets the two apart with
				// `data-status`, for the reader's own position in the route, not a
				// visual difference Figma never drew.
				gesehen: 'text-muted-foreground',
				offen: 'text-muted-foreground',
			},
		},
		defaultVariants: { status: 'offen' },
	},
)

type StoppStatus = NonNullable<VariantProps<typeof stoppVariants>['status']>

interface StoppProps
	extends Omit<React.ComponentProps<typeof Link>, 'href'>, VariantProps<typeof stoppVariants> {
	href: string
	nummer: number
	illustrationId: string
	illustrationLabel: string
}

// Xenia / Weg / Stopp (Figma component set 36585:8230, issue #97): one place
// on the Weg-Leiste — its 36px illustration over its own number. "aktuell"
// is the Figma variant: Petrolschleier with a Petrol ring and a Petrol
// Nummer (Kartei design system, Mist Rule and the Ink Rule's current-Stopp
// exception; issue #109). A Rundgang-Übersicht (issue #118) tracks no
// current position and sets every Stopp "offen"; a Station's own
// Stationsnavigation (issue #120) does, so "gesehen" marks a Stopp before it
// in the route.
function Stopp({
	href,
	nummer,
	illustrationId,
	illustrationLabel,
	status = 'offen',
	className,
	...props
}: StoppProps) {
	return (
		<Link
			href={href}
			data-slot="stopp"
			data-status={status}
			aria-current={status === 'aktuell' ? 'page' : undefined}
			className={cn(stoppVariants({ status }), className)}
			{...props}
		>
			<Illustration id={illustrationId} label={illustrationLabel} className="size-9" />
			<span>{nummer}</span>
		</Link>
	)
}

export { Stopp, type StoppStatus, stoppVariants }
