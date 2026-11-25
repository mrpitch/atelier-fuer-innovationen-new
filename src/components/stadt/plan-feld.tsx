import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

const planFeldVariants = cva('flex items-center justify-center rounded-none font-mono text-xs', {
	variants: {
		// Besucht (visited) is a real Figma variant but has no code counterpart
		// yet: the Mini-Stadtplan never tracks reading state (issue #96), so
		// only the current place and every open one render.
		//
		// Koralle (bg-signal) marks the current place on a map or bar, but
		// never as a fill behind text (Kartei design system, Signal Rule;
		// theme.css's --color-signal comment) — the Figma component itself
		// fills "aktuell" with Petrol, but that fill-behind-text reading
		// conflicts with the design system, so "aktuell" keeps the Karteikarte
		// fill and gets a Koralle ring instead.
		status: {
			aktuell: 'bg-card text-card-foreground ring-2 ring-signal ring-inset',
			offen: 'bg-card text-card-foreground',
		},
	},
	defaultVariants: { status: 'offen' },
})

interface PlanFeldProps extends React.ComponentProps<'div'>, VariantProps<typeof planFeldVariants> {
	nummer: string
}

// Xenia / Stadt / Plan-Feld (Figma component set 36585:8629): one tile of
// the Mini-Stadtplan — a 26px square naming its place's number, Karteikarte
// with a Koralle ring when it's the current place, plain Karteikarte
// otherwise.
function PlanFeld({ nummer, status = 'offen', className, ...props }: PlanFeldProps) {
	return (
		<div
			data-slot="plan-feld"
			data-status={status}
			// 26px: the Plan-Feld size (Kartei design system, Mini-Stadtplan).
			// eslint-disable-next-line restrictions/arbitrary-size-classes
			className={cn('size-[26px]', planFeldVariants({ status }), className)}
			{...props}
		>
			{nummer}
		</div>
	)
}

export { PlanFeld, planFeldVariants }
