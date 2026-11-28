import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { NavigationNode } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

// `split` runs the top-level list in two CSS columns from `lg` (never
// breaking an entry across them), for the wide Entdecken column.
function SitemapBranch({
	nodes,
	split = false,
	nested = false,
}: {
	nodes: readonly NavigationNode[]
	split?: boolean
	nested?: boolean
}) {
	return (
		<ul
			className={cn(
				'list-disc pl-5 marker:text-muted-foreground',
				split
					? 'lg:columns-2 lg:gap-x-10 [&>li]:mb-3 [&>li]:break-inside-avoid'
					: 'flex flex-col gap-3',
				nested && 'mt-3',
			)}
		>
			{nodes.map((node) => (
				<li key={node.id}>
					<Link href={node.url} className="text-muted-foreground hover:text-foreground">
						{node.title}
					</Link>
					{node.children.length > 0 && <SitemapBranch nodes={node.children} nested />}
				</li>
			))}
		</ul>
	)
}

// One block per Menu group of the `sitemap` Menu (issue #136, Figma:
// Entdecken, Lesen, Projekt, Service): the group's label is a plain-text
// heading, and each of its entries is listed with its own pages nested below
// exactly as the Sitemap tree nests them. `wide` is the first group, which
// spans two of the three columns from `lg` and splits its list across them.
function SitemapColumn({
	title,
	nodes,
	wide = false,
}: {
	title: string
	nodes: readonly NavigationNode[]
	wide?: boolean
}) {
	return (
		<div data-slot="sitemap-column" className={cn('flex flex-col gap-4', wide && 'lg:col-span-2')}>
			<h2 className="heading-sm text-foreground">{title}</h2>
			{nodes.length > 0 && <SitemapBranch nodes={nodes} split={wide} />}
		</div>
	)
}

function indexByUrl(
	node: NavigationNode,
	into: Map<string, NavigationNode> = new Map(),
): Map<string, NavigationNode> {
	into.set(node.url, node)
	for (const child of node.children) indexByUrl(child, into)
	return into
}

// Unlike Breadcrumbs/PreviousNext, this reads the content graph itself
// (issue #34): it's placed by the Sitemap Seite's own full-page layout
// (SitemapHub), which holds the graph for its own breadcrumbs but doesn't
// pass this list its tree, so the list reads the graph itself.
//
// The columns come from the `sitemap` Menu (a curated grouping, since the
// Figma columns don't follow the Navigation's top level); each entry's
// subtree and URL come from `graph.sitemap`, never restated (ADR-0003). The
// Startseite is the first bullet of the first column: it's the Sitemap
// tree's root, which a Menu entry can't name (an empty ID), and it is listed
// without its children, since those are the columns' own entries.
function SitemapList({ className, ...props }: React.ComponentProps<'nav'>) {
	const graph = contentGraph()
	const root = graph.sitemap
	const nodesByUrl = indexByUrl(root)
	const startseite: NavigationNode = { ...root, children: [] }
	const columns = graph.getMenu('sitemap').map((group, index) => {
		const nodes = group.links.flatMap((link) => nodesByUrl.get(link.url) ?? [])
		return { label: group.label, nodes: index === 0 ? [startseite, ...nodes] : nodes }
	})

	const [first, ...others] = columns

	return (
		<nav
			data-slot="sitemap-list"
			aria-label={t('navigation.sitemap')}
			className={cn('grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3', className)}
			{...props}
		>
			{first && <SitemapColumn title={first.label} nodes={first.nodes} wide />}
			<div data-slot="sitemap-more" className="flex flex-col gap-10">
				{others.map((column) => (
					<SitemapColumn key={column.label} title={column.label} nodes={column.nodes} />
				))}
			</div>
		</nav>
	)
}

export { SitemapList }
