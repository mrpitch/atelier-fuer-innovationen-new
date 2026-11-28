import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

import { Card } from '@/components/ui/card'

interface ThemaKarteProps
	extends React.ComponentProps<'div'>, VariantProps<typeof themaKarteVariants> {
	label: string
	illustration: React.ReactNode
	titel: string
	text: string
	// The Leitthema variant's own "Weg K1–K8" strip (Figma Content slot
	// 36581:7852, issue #132); the Themen-Ort variant has none. Named `weg`,
	// not `content`, since the latter collides with the native `content`
	// HTML attribute on `React.ComponentProps<'div'>`.
	weg?: React.ReactNode
	action: React.ReactNode
}

// Xenia / Thema / Thema-Karte (Figma component set 36581:7877): a Thema as a
// card, media first then its Label/Titel/Text/[Content]/Actions. Two
// variants:
// - Typ=Themen-Ort (Desktop 36581:7874, Mobile 36622:9099, issue #125):
//   stacked with the Illustration centred above the body below `md`, side by
//   side with the Illustration on the left from `md` (kartei-design-system.md,
//   Breakpoints, "Thema-Karte, Typ Themen-Ort").
// - Typ=Leitthema (Desktop 36581:7850, Mobile 36622:8942, issue #132): the
//   same shape, but switches at `lg` instead ("Thema-Karte, Typ Leitthema"),
//   its own Figma frames being drawn Mobile through 768 and Desktop from
//   1024; its title is set larger (Figma Titel 44px vs the Themen-Ort's
//   28px) and it alone uses the `weg` slot.
// `action` is a slot — one button for the Themen-Ort variant, two for the
// Leitthema one — the caller builds it with buttonVariants, the same way
// BildHero's own `actions` does; the caller also sizes the Illustration.
//
// `label` is set in mixed case on the Themen-Ort variant ("Themen-Ort ·
// Viertel 05 · zweigt bei Kapitel 5 ab"), unlike every other DM Mono Label in
// the system, which is typed uppercase (kartei-design-system.md, Open
// deviations). It therefore isn't a `MonoLabel`, whose `uppercase` class
// would force-capitalize it; the Leitthema variant's own label is typed
// uppercase already ("LEITTHEMA · …"), so the same plain `<p>` renders it
// unchanged either way.
const themaKarteVariants = cva('group/karte flex-col items-center gap-7 p-8', {
	variants: {
		variant: {
			'themen-ort': 'md:flex-row md:items-start',
			leitthema: 'lg:flex-row lg:items-start',
		},
	},
	defaultVariants: { variant: 'themen-ort' },
})

function ThemaKarte({
	variant = 'themen-ort',
	label,
	illustration,
	titel,
	text,
	weg,
	action,
	className,
	...props
}: ThemaKarteProps) {
	return (
		<Card
			data-slot="thema-karte"
			data-variant={variant}
			className={cn(
				themaKarteVariants({ variant }),
				// 12px: the Thema-Karte's own corner radius, not the theme's
				// rounded-xl (kartei-design-system.md, Open deviations).
				// eslint-disable-next-line restrictions/arbitrary-radius-classes
				'rounded-[12px]',
				className,
			)}
			{...props}
		>
			{illustration}
			<div
				className={cn(
					'flex min-w-0 flex-col gap-3 text-center',
					'group-data-[variant=themen-ort]/karte:md:text-left group-data-[variant=leitthema]/karte:lg:text-left',
				)}
			>
				<p className="font-mono text-xs font-medium text-primary">{label}</p>
				<p className="font-heading text-2xl text-foreground group-data-[variant=leitthema]/karte:text-4xl">
					{titel}
				</p>
				<p className="font-serif text-base text-muted-foreground">{text}</p>
				{weg}
				<div
					className={cn(
						'flex flex-wrap items-center justify-center gap-3',
						'group-data-[variant=themen-ort]/karte:md:justify-start group-data-[variant=leitthema]/karte:lg:justify-start',
					)}
				>
					{action}
				</div>
			</div>
		</Card>
	)
}

export { ThemaKarte, themaKarteVariants }
