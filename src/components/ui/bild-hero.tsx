import { cva } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

import { MonoLabel } from '@/components/ui/mono-label'

const zitatVariants = cva('text-[28px] text-foreground', {
	variants: {
		style: {
			upright: 'font-serif xl:text-[40px]',
			// The Thema Leitsatz: italic display serif (Figma T09a/T09b, issue #144).
			italic: 'font-heading italic xl:text-[32px]',
		},
	},
	defaultVariants: { style: 'upright' },
})

interface BildHeroProps extends React.ComponentProps<'section'> {
	// The uppercase mono eyebrow that names the page and its position (Kartei
	// design system, the Label Rule), e.g. "DER STADTPLAN · ACHT VIERTEL · EIN
	// ZENTRUM". A Badge may sit next to it; this hero (issue #95) sets none.
	eyebrow: string
	badge?: React.ReactNode
	title: string
	zitat?: string
	// Petrol marks the Thema heroes' eyebrow (Figma T09a/T09b, issue #145).
	eyebrowTone?: 'primary' | 'muted'
	// `zitatStyle` italic sets the Thema Leitsatz in italic display serif, not
	// as the upright Zitat of the other heroes.
	zitatStyle?: 'upright' | 'italic'
	// Unset on the Thema page's Themen-Ort hero (issue #125), whose intro
	// sits in the page body below instead of inside the hero.
	children?: React.ReactNode
	actions?: React.ReactNode
	illustration: React.ReactNode
}

// Xenia / Section / Bild-Hero (Figma 36584:15357, component set 36625:8921):
// a text column (eyebrow, title, Zitat, intro, actions) beside an
// illustration, 420px on desktop; the illustration comes first below 1280px.
// At 1024 the row would leave the text 332px, too narrow for the 88px title
// (issue #110), so the hero switches at xl (Kartei design system, Breakpoints).
// The title hyphenates (lang="de"), so a one-word title like "Futursysteme"
// breaks only at a syllable ("Futur-systeme").
function BildHero({
	eyebrow,
	badge,
	title,
	zitat,
	children,
	actions,
	illustration,
	eyebrowTone = 'muted',
	zitatStyle = 'upright',
	className,
	...props
}: BildHeroProps) {
	return (
		<section
			data-slot="bild-hero"
			className={cn(
				'flex flex-col-reverse gap-10 px-5 pt-12 pb-20 xl:flex-row xl:items-center xl:justify-between xl:gap-20 xl:px-6',
				className,
			)}
			{...props}
		>
			{/* 748px: the Bild-Hero text column (Figma Bild-Hero 36584:15357). */}
			{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
			<div className="flex max-w-[748px] flex-col gap-6">
				<div className="flex flex-wrap items-center gap-3">
					<MonoLabel tone={eyebrowTone}>{eyebrow}</MonoLabel>
					{badge}
				</div>
				<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] hyphens-auto text-foreground xl:text-[88px]">
					{title}
				</h1>
				{zitat && <p className={zitatVariants({ style: zitatStyle })}>{zitat}</p>}
				{children && <div className="text-lg text-muted-foreground">{children}</div>}
				{actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
			</div>
			<div data-slot="bild-hero-media" className="shrink-0 [&>svg]:h-auto [&>svg]:max-w-full">
				{illustration}
			</div>
		</section>
	)
}

export { BildHero }
