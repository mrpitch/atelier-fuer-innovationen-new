import { cva } from 'class-variance-authority'
import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { MonoLabel } from '@/components/ui/mono-label'

type ThemaKachelTyp = 'leitthema' | 'themen-ort'

interface ThemaKachelAction {
	readonly label: string
	readonly href: string
}

// The data every Thema-Kachel shows — shared with ThemenTriptychon's own
// tile list (themen-triptychon.tsx), so the two don't each declare the same
// shape.
interface ThemaKachelContent {
	typ: ThemaKachelTyp
	label: string
	illustrationId: string
	illustrationLabel: string
	titel: string
	teaser?: string
	meta: string
	action: ThemaKachelAction
}

interface ThemaKachelProps extends ThemaKachelContent, React.ComponentProps<'div'> {}

// 768: the Leitthema tile alone runs its Illustration and text side by side,
// full width; the two Themen-Ort tiles below stay stacked.
const themaKachelRowVariants = cva('flex flex-1 flex-col gap-6', {
	variants: {
		typ: {
			leitthema: 'md:flex-row md:items-center lg:flex-col lg:items-start',
			'themen-ort': '',
		},
	},
})

// 208/256/288px (Leitthema), 208/200/240px (Themen-Ort): the Thema-Kachel's
// own Illustration sizes at 390/768/1440 — 1024 reuses the 768 value in both
// (Kartei design system, Breakpoints, "Themen-Triptychon"; issue #149).
const themaKachelIllustrationVariants = cva('shrink-0', {
	variants: {
		typ: {
			// eslint-disable-next-line restrictions/arbitrary-size-classes
			leitthema: 'size-[208px] md:size-[256px] xl:size-[288px]',
			// eslint-disable-next-line restrictions/arbitrary-size-classes
			'themen-ort': 'size-[208px] md:size-[200px] xl:size-[240px]',
		},
	},
})

const themaKachelActionVariant: Record<ThemaKachelTyp, 'default' | 'outline'> = {
	leitthema: 'default',
	'themen-ort': 'outline',
}

// Xenia / Thema / Thema-Kachel (Figma component set 36936:10331, issue #149):
// one tile of the Themen-Triptychon — a mono Label, an Illustration, a serif
// Titel, an optional Teaser, a mono meta line and one action — square-cornered
// on the Triptychon's shared Karteikarte surface (the grid wrapper supplies
// the surface and the Haarlinie borders between tiles, the same way
// Stadtplan's grid does for Viertel-Kachel). Deliberately apart from
// ThemaKarte (the bordered, rounded card on the Startseite and Thema pages):
// same domain, different Figma component, never reused for the other's
// layout.
function ThemaKachel({
	typ,
	label,
	illustrationId,
	illustrationLabel,
	titel,
	teaser,
	meta,
	action,
	className,
	...props
}: ThemaKachelProps) {
	return (
		<div
			data-slot="thema-kachel"
			data-typ={typ}
			className={cn('flex h-full flex-col gap-6 rounded-none bg-card p-7', className)}
			{...props}
		>
			<MonoLabel>{label}</MonoLabel>
			<div className={themaKachelRowVariants({ typ })}>
				<Illustration
					id={illustrationId}
					label={illustrationLabel}
					className={themaKachelIllustrationVariants({ typ })}
				/>
				<div className="flex flex-1 flex-col gap-3">
					{/* 1024 reserves two lines so the three tiles' buttons align in that
					    row even when only one title wraps (Kartei design system,
					    Breakpoints, "Themen-Triptychon"); 1440 has the room to drop it. */}
					{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
					<p className="font-heading text-[32px] leading-tight text-foreground lg:min-h-[2lh] xl:min-h-0 xl:text-[36px]">
						{titel}
					</p>
					{teaser && <p className="font-serif text-base text-muted-foreground">{teaser}</p>}
					<p className="font-mono text-xs text-muted-foreground">{meta}</p>
				</div>
			</div>
			<Link
				href={action.href}
				className={buttonVariants({
					variant: themaKachelActionVariant[typ],
					className: 'self-start',
				})}
			>
				{action.label}
				<Icon iconName="arrowRight" data-icon="inline-end" />
			</Link>
		</div>
	)
}

export { ThemaKachel, type ThemaKachelContent }
