import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import type { NavigationNode } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

function SitemapBranch({ nodes }: { nodes: readonly NavigationNode[] }) {
	return (
		<ul className="flex flex-col gap-3">
			{nodes.map((node) => (
				<li key={node.id} className="flex flex-col gap-3">
					<Link href={node.url} className="text-muted-foreground hover:text-foreground">
						{node.title}
					</Link>
					{node.children.length > 0 && (
						<div className="pl-4">
							<SitemapBranch nodes={node.children} />
						</div>
					)}
				</li>
			))}
		</ul>
	)
}

// One column per top-level Navigation group (issue #136): the group's own
// page is the column heading (it's a published page too, so it still needs
// its own link), its own pages nested below exactly as SitemapBranch always
// nested them.
function SitemapColumn({ group }: { group: NavigationNode }) {
	return (
		<div data-slot="sitemap-column" className="flex flex-col gap-4">
			<h2 className="heading-sm text-foreground">
				<Link href={group.url} className="hover:underline">
					{group.title}
				</Link>
			</h2>
			{group.children.length > 0 && <SitemapBranch nodes={group.children} />}
		</div>
	)
}

// Unlike Breadcrumbs/PreviousNext, this reads the content graph itself
// (issue #34): it's placed by the Sitemap Seite's own full-page layout
// (SitemapHub), not handed items by page.tsx, so there is no parent already
// holding them. Restyled, not replaced, for the Figma composition (issue
// #136): the Sitemap tree's root (the Startseite) gets its own link above
// the grid; its children — one top-level group per area (issue #60) —
// become the grid's columns, four across at `lg`, down to one stacked
// column below `md` (Kartei design system, Breakpoints).
function SitemapList({ className, ...props }: React.ComponentProps<'nav'>) {
	const root = contentGraph().sitemap

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
				{root.children.map((group) => (
					<SitemapColumn key={group.id} group={group} />
				))}
			</div>
		</nav>
	)
}

export { SitemapList }
