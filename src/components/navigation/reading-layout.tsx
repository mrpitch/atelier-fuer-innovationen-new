import { cn } from 'cn'
import type * as React from 'react'

import { KapitelThemenWeg } from '@/components/navigation/kapitel-themen-weg'
import { ThemenWegSheet } from '@/components/navigation/themen-weg-sheet'
import type { Abschnitt, ContentGraph, Kapitel } from '@/lib/content'

interface ReadingLayoutProps extends React.ComponentProps<'div'> {
	graph: ContentGraph
	kapitel: Kapitel
	// Set on an Abschnitt page, see KapitelThemenWeg.
	abschnitt?: Abschnitt
	randspalte?: React.ReactNode
	children: React.ReactNode
}

// The three-column reading layout for a Kapitel or Abschnitt page (Kartei
// design system: a 300px Themen-Weg sidebar, the text column and a 260px
// Randspalte, 56px apart) — issue #99. At 1024 and up the sidebar sits beside
// the text; below that it becomes the "Themen-Weg · N Kapitel" button and
// Sheet, and the Randspalte stacks under the text.
function ReadingLayout({
	graph,
	kapitel,
	abschnitt,
	randspalte,
	children,
	className,
	...props
}: ReadingLayoutProps) {
	// Rendered once, server-side, and placed in both the desktop column and
	// the mobile Sheet (ThemenWegSheet) — passing it as children across that
	// boundary keeps the content graph lookup out of the Client Component
	// (static-export.md).
	const themenWeg = <KapitelThemenWeg graph={graph} kapitel={kapitel} abschnitt={abschnitt} />

	return (
		<div
			data-slot="reading-layout"
			className={cn(
				'flex flex-col gap-8 px-5 py-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:items-start lg:gap-14 lg:px-0 lg:py-12 lg:pr-24 lg:pl-16',
				className,
			)}
			{...props}
		>
			<ThemenWegSheet kapitelCount={graph.kapitel.length} className="lg:hidden">
				{themenWeg}
			</ThemenWegSheet>
			<aside data-slot="themen-weg-column" className="hidden lg:block">
				{themenWeg}
			</aside>
			<div data-slot="reading-content" className="min-w-0">
				{children}
			</div>
			<aside data-slot="randspalte" className="min-w-0">
				{randspalte}
			</aside>
		</div>
	)
}

export { ReadingLayout }
