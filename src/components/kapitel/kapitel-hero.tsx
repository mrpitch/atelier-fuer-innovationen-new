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
	// the length of the way, the same count KapitelEbenenLeiste uses.
	viertelCount: number
	// graph.kapitel.length: "Alle n Kapitel" counts the published Kapitel the
	// Leitthema page lists, like the Viertel page's Lesen card (issue #109).
	kapitelCount: number
	firstAbschnitt: Abschnitt | undefined
	children?: React.ReactNode
}

// Xenia / Kapitel / Kapitel-Hero (Figma component set 36625:9223, issue
// #100): the Kapitel's own hero inside the reading column — not the
// page-level Bild-Hero, which a Kapitel page has none of. The Desktop
// variant puts the Ort beside the text; the Mobile variant ("Breakpoint=
// Mobile" in Figma) puts it first, like Bild-Hero's own illustration-first
// rule. ReadingLayout's reading column is a variable width, not the full
// viewport (300px Themen-Weg and 260px Randspalte columns both cut into it
// from 1024 up, tailwind-conventions.md "use container queries … when a
// component's layout depends on its parent, not the viewport") — a `md:`
// viewport breakpoint here already overflowed into the Randspalte column at
// 1024, where the reading column is far narrower than 768px. `@container`
// queries the Hero's own rendered width instead.
function KapitelHero({
	kapitel,
	viertel,
	leitthema,
	viertelCount,
	kapitelCount,
	firstAbschnitt,
	children,
	className,
	...props
}: KapitelHeroProps) {
	return (
		<section data-slot="kapitel-hero" className={cn('@container', className)} {...props}>
			<div className="flex flex-col-reverse gap-5 @lg:flex-row @lg:items-center @lg:gap-8">
				<div className="flex flex-col gap-3.5">
					<MonoLabel>
						{leitthema
							? t('kapitel.heroOverline', {
									number: kapitel.number,
									total: viertelCount,
									leitthema: shortTitleOrTitle(leitthema),
								})
							: t('kapitel.heroOverlineOhneLeitthema', {
									number: kapitel.number,
									total: viertelCount,
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
								{t('kapitel.heroAlleKapitel', { total: kapitelCount })}
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
			</div>
		</section>
	)
}

export { KapitelHero }
