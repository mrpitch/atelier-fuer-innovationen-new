import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

const planFeldVariants = cva('flex items-center justify-center rounded-none font-mono text-xs', {
	variants: {
		// Besucht (visited) is a real Figma variant but has no code counterpart
		// yet: the Mini-Stadtplan never tracks reading state (issue #96), so
		// only the current place and every open one render.
		//
		// "aktuell" is the Figma fill: Petrol with white text (Kartei design
		// system, Petrol Rule: the current place on the Mini-Stadtplan; issue
		// #109).
		status: {
			aktuell: 'bg-primary text-primary-foreground',
			offen: 'bg-card text-card-foreground',
		},
	},
	defaultVariants: { status: 'offen' },
})

interface PlanFeldProps extends React.ComponentProps<'div'>, VariantProps<typeof planFeldVariants> {
	nummer: string
}

// Xenia / Stadt / Plan-Feld (Figma component set 36585:8629): one tile of
// the Mini-Stadtplan — a 26px square naming its place's number, Petrol when
// it's the current place, Karteikarte otherwise.
function PlanFeld({ nummer, status = 'offen', className, ...props }: PlanFeldProps) {
	return (
		<div
			data-slot="plan-feld"
			data-status={status}
			// 26px: the Plan-Feld size (Figma, Plan-Feld component).
			// eslint-disable-next-line restrictions/arbitrary-size-classes
			className={cn('size-[26px]', planFeldVariants({ status }), className)}
			{...props}
		>
			{nummer}
		</div>
	)
}

export { PlanFeld, planFeldVariants }
