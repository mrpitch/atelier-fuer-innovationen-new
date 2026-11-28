import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { NavigationNode } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

function SitemapBranch({ nodes }: { nodes: readonly NavigationNode[] }) {
	return (
		<ul className="flex list-disc flex-col gap-3 pl-5 marker:text-muted-foreground">
			{nodes.map((node) => (
				<li key={node.id} className="flex flex-col gap-3">
					<span>
						<Link href={node.url} className="text-muted-foreground hover:text-foreground">
							{node.title}
						</Link>
						<span className="text-muted-foreground">{` — ${node.url}`}</span>
					</span>
					{node.children.length > 0 && <SitemapBranch nodes={node.children} />}
				</li>
			))}
		</ul>
	)
}

// One column per top-level Navigation group (issue #136): a real group's own
// page is the column heading (it's a published page too, so it still needs
// its own link); a group with no page of its own (`url` undefined — the
// Leitthema group below) gets a plain-text heading instead, since there's no
// page to link it to. Either way, its own pages nest below exactly as
// SitemapBranch always nested them.
function SitemapColumn({
	title,
	url,
	nodes,
}: {
	title: string
	url?: string
	nodes: readonly NavigationNode[]
}) {
	return (
		<div data-slot="sitemap-column" className="flex flex-col gap-4">
			<h2 className="heading-sm text-foreground">
				{url ? (
					<Link href={url} className="hover:underline">
						{title}
					</Link>
				) : (
					title
				)}
			</h2>
			{nodes.length > 0 && <SitemapBranch nodes={nodes} />}
		</div>
	)
}

// Unlike Breadcrumbs/PreviousNext, this reads the content graph itself
// (issue #34): it's placed by the Sitemap Seite's own full-page layout
// (SitemapHub), which holds the graph for its own breadcrumbs but doesn't
// pass this list its tree, so the list reads the graph itself. Restyled,
// not replaced, for the Figma composition (issue #136): the Sitemap tree's
// root (the Startseite) gets its own link above the grid; its children
// become the grid's columns, four across at `lg`, down to one stacked
// column below `md` (Kartei design system, Breakpoints).
//
// `graph.sitemap`'s root children are the real top-level Seiten (Navigation
// order) plus, for an area with no published Seite of its own (issue #60's
// `attach()` then falls back to the root — today only the Leitthema, whose
// Kapitel sit directly under `leitthema/`, never under a Seite, by design:
// content-layer.md), every one of that area's documents individually. Reading
// `root.children` as-is would turn each of those into its own column; cross-
// referencing `graph.navigation`'s own top-level Seiten tells real columns
// (their own page, so a linked heading) apart from that leftover content,
// grouped into one more column instead, headed in plain text since it has no
// page of its own.
function SitemapList({ className, ...props }: React.ComponentProps<'nav'>) {
	const graph = contentGraph()
	const root = graph.sitemap
	const topLevelSeiteIds = new Set(graph.navigation.children.map((seite) => seite.id))
	const columns = root.children.filter((child) => topLevelSeiteIds.has(child.id))
	const leftover = root.children.filter((child) => !topLevelSeiteIds.has(child.id))

	return (
		<nav
			data-slot="sitemap-list"
			aria-label={t('navigation.sitemap')}
			className={cn('flex flex-col gap-10', className)}
			{...props}
		>
			<Link href={root.url} className="text-muted-foreground hover:text-foreground">
				{root.title}
			</Link>
			<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
				{columns.map((column) => (
					<SitemapColumn
						key={column.id}
						title={column.title}
						url={column.url}
						nodes={column.children}
					/>
				))}
				{leftover.length > 0 && (
					<SitemapColumn title={t('navigation.sitemapLeitthema')} nodes={leftover} />
				)}
			</div>
		</nav>
	)
}

export { SitemapList }
