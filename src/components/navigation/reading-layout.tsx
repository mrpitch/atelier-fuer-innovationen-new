import { cn } from 'cn'
import type * as React from 'react'

import { ThemenWegSheet } from '@/components/navigation/themen-weg-sheet'

interface ReadingLayoutProps extends React.ComponentProps<'div'> {
	// Rendered once, server-side, and placed in both the desktop column and
	// the mobile Sheet (ThemenWegSheet) — passing it as children across that
	// boundary keeps the content graph lookup out of the Client Component
	// (static-export.md).
	themenWeg: React.ReactNode
	themenWegKapitelCount: number
	randspalte?: React.ReactNode
	children: React.ReactNode
}

// The three-column reading layout for a Kapitel or Abschnitt page (Kartei
// design system: a 300px Themen-Weg sidebar, the text column and a 260px
// Randspalte, 56px apart) — issue #99. At 1024 and up the sidebar sits beside
// the text; below that it becomes the "Themen-Weg · N Kapitel" button and
// Sheet, and the Randspalte stacks under the text.
function ReadingLayout({
	themenWeg,
	themenWegKapitelCount,
	randspalte,
	children,
	className,
	...props
}: ReadingLayoutProps) {
	return (
		<div
			data-slot="reading-layout"
			className={cn(
				'flex flex-col gap-8 px-5 py-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:items-start lg:gap-14 lg:px-0 lg:py-12 lg:pr-24 lg:pl-16',
				className,
			)}
			{...props}
		>
			<ThemenWegSheet kapitelCount={themenWegKapitelCount} className="lg:hidden">
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
