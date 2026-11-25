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
				offen: 'text-muted-foreground',
			},
		},
		defaultVariants: { status: 'offen' },
	},
)

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
// exception; issue #109). The set's third
// variant, Status=gesehen, has no code counterpart: this page tracks no
// reading state, so every other place is "offen".
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

export { Stopp, stoppVariants }
