import Link from 'next/link'
import type * as React from 'react'

import type { NavigationNode } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

function SitemapBranch({ nodes }: { nodes: readonly NavigationNode[] }) {
	return (
		<ul>
			{nodes.map((node) => (
				<li key={node.id}>
					<Link href={node.url}>{node.title}</Link>
					{node.children.length > 0 && <SitemapBranch nodes={node.children} />}
				</li>
			))}
		</ul>
	)
}

// Unlike Breadcrumbs/PreviousNext, this reads the content graph itself: it's
// placed in the Sitemap Seite's own MDX body (issue #34), not handed items by
// page.tsx, so there is no parent already holding them. It renders the
// Sitemap tree nested, each type under its area's Seite (issue #60).
function SitemapList(props: React.ComponentProps<'nav'>) {
	return (
		<nav data-slot="sitemap-list" aria-label={t('navigation.sitemap')} {...props}>
			<SitemapBranch nodes={[contentGraph().sitemap]} />
		</nav>
	)
}

export { SitemapList }
