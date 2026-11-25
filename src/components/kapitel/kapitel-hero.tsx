import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Illustration } from '@/components/ui/illustration'
import { MonoLabel } from '@/components/ui/mono-label'
import type { Abschnitt, Kapitel, Thema, Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface KapitelHeroProps extends React.ComponentProps<'section'> {
	kapitel: Kapitel
	viertel: Viertel
	leitthema: Thema | undefined
	// graph.viertel.length: ADR-0003's "Kapitel n = Viertel n" makes "VON n"
	// range over every Viertel, the same count KapitelEbenenLeiste uses, not
	// graph.kapitel.length.
	viertelCount: number
	firstAbschnitt: Abschnitt | undefined
	children?: React.ReactNode
}

// Xenia / Kapitel / Kapitel-Hero (Figma component set 36625:9223, issue
// #100): the Kapitel's own hero inside the reading column, sized to its
// 608px width — not the page-level Bild-Hero, which a Kapitel page has none
// of. The Desktop variant puts the Ort beside the text; the Mobile variant
// (< 768, Figma's own "Breakpoint=Mobile") puts it first, like Bild-Hero's
// own illustration-first rule.
function KapitelHero({
	kapitel,
	viertel,
	leitthema,
	viertelCount,
	firstAbschnitt,
	children,
	className,
	...props
}: KapitelHeroProps) {
	return (
		<section
			data-slot="kapitel-hero"
			className={cn('flex flex-col-reverse gap-5 md:flex-row md:items-center md:gap-8', className)}
			{...props}
		>
			<div className="flex flex-col gap-3.5">
				<MonoLabel>
					{t('kapitel.heroOverline', {
						number: kapitel.number,
						total: viertelCount,
						leitthema: leitthema ? shortTitleOrTitle(leitthema) : '',
					})}
				</MonoLabel>
				<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] text-foreground">
					{kapitel.title}
				</h1>
				{kapitel.untertitel && (
					<p className="font-serif text-[22px] text-muted-foreground">{kapitel.untertitel}</p>
				)}
				{children && <div className="text-base text-muted-foreground">{children}</div>}
				<div className="flex flex-wrap items-center gap-3">
					{firstAbschnitt && (
						<Link href={firstAbschnitt.url} className={buttonVariants({ variant: 'default' })}>
							{t('kapitel.heroBeginnen', { number: firstAbschnitt.number })}
						</Link>
					)}
					{leitthema && (
						<Link href={leitthema.url} className={buttonVariants({ variant: 'ghost' })}>
							{t('kapitel.heroAlleKapitel', { total: viertelCount })}
						</Link>
					)}
				</div>
			</div>
			<div data-slot="kapitel-hero-ort" className="flex shrink-0 flex-col items-center gap-2">
				{/* 200px: the Kapitel-Hero Ort illustration size (Figma 36625:9223). */}
				{/* eslint-disable-next-line restrictions/arbitrary-size-classes */}
				<Illustration id={viertel.id} label={viertel.title} className="size-[200px]" />
				<p className="text-xs font-medium text-muted-foreground">
					{t('kapitel.heroOrt', { title: viertel.title })}
				</p>
			</div>
		</section>
	)
}

export { KapitelHero }
