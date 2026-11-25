import { cn } from 'cn'
import type * as React from 'react'

interface BildHeroProps extends React.ComponentProps<'section'> {
	// The uppercase mono eyebrow that names the page and its position (Kartei
	// design system, the Label Rule), e.g. "DER STADTPLAN · ACHT VIERTEL · EIN
	// ZENTRUM". A Badge may sit next to it; this hero (issue #95) sets none.
	eyebrow: string
	badge?: React.ReactNode
	title: string
	zitat?: string
	children: React.ReactNode
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
	className,
	...props
}: BildHeroProps) {
	return (
		<section
			data-slot="bild-hero"
			className={cn(
				'flex flex-col-reverse gap-10 px-5 pt-12 pb-20 xl:flex-row xl:items-center xl:justify-between xl:gap-20 xl:px-24',
				className,
			)}
			{...props}
		>
			{/* 748px: the Bild-Hero text column (Kartei design system, Layout). */}
			{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
			<div className="flex max-w-[748px] flex-col gap-6">
				<div className="flex flex-wrap items-center gap-3">
					<p className="font-mono text-xs text-muted-foreground uppercase">{eyebrow}</p>
					{badge}
				</div>
				<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] hyphens-auto text-foreground xl:text-[88px]">
					{title}
				</h1>
				{zitat && <p className="font-serif text-[28px] text-foreground xl:text-[40px]">{zitat}</p>}
				<div className="text-lg text-muted-foreground">{children}</div>
				{actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
			</div>
			<div data-slot="bild-hero-media" className="shrink-0">
				{illustration}
			</div>
		</section>
	)
}

export { BildHero }
