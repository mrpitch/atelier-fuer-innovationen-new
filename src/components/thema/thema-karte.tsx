import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ThemaKarteAction {
	readonly label: string
	readonly href: string
}

interface ThemaKarteProps extends React.ComponentProps<'div'> {
	label: string
	illustration: React.ReactNode
	titel: string
	text: string
	action: ThemaKarteAction
}

// Xenia / Thema / Thema-Karte, Typ=Themen-Ort (Figma component set
// 36581:7877; Desktop 36581:7874, Mobile 36622:9099; issue #125): a Themen-Ort
// as a card, media first then its Label/Titel/Text/action — stacked with the
// Illustration centred above the body below `md`, side by side with the
// Illustration on the left from `md` (Kartei design system, Breakpoints,
// "Thema-Karte, Typ Themen-Ort"). The Typ=Leitthema variant isn't built here;
// issue #125 only needs the Themen-Ort one. Takes the same props as
// GangartBox (label, illustration, titel, text, action), the caller sizing
// the Illustration.
//
// `label` is set in mixed case ("Themen-Ort · Viertel 05 · zweigt bei Kapitel
// 5 ab"), unlike every other DM Mono Label in the system, which is typed
// uppercase (kartei-design-system.md, Open deviations). It therefore isn't a
// `MonoLabel`, whose `uppercase` class would force-capitalize it.
function ThemaKarte({
	label,
	illustration,
	titel,
	text,
	action,
	className,
	...props
}: ThemaKarteProps) {
	return (
		<Card
			data-slot="thema-karte"
			className={cn(
				'flex-col items-center gap-7 p-8 md:flex-row md:items-start',
				// 12px: the Thema-Karte's own corner radius, not the theme's
				// rounded-xl (kartei-design-system.md, Open deviations).
				// eslint-disable-next-line restrictions/arbitrary-radius-classes
				'rounded-[12px]',
				className,
			)}
			{...props}
		>
			{illustration}
			<div className="flex min-w-0 flex-col gap-3 text-center md:text-left">
				<p className="font-mono text-xs font-medium text-primary">{label}</p>
				<p className="font-heading text-2xl text-foreground">{titel}</p>
				<p className="font-serif text-base text-muted-foreground">{text}</p>
				<Link
					href={action.href}
					className={buttonVariants({
						variant: 'outline',
						className: 'self-center bg-card md:self-start',
					})}
				>
					{action.label}
				</Link>
			</div>
		</Card>
	)
}

export { ThemaKarte }
