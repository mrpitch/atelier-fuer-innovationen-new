import path from 'node:path'

import Link from 'next/link'
import type * as React from 'react'

import { buildContentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

// Unlike Breadcrumbs/PreviousNext, this reads the content graph itself: it's
// placed in the Sitemap Seite's own MDX body (issue #34), not handed items by
// page.tsx, so there is no parent already holding them.
function SitemapList(props: React.ComponentProps<'nav'>) {
	const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

	return (
		<nav data-slot="sitemap-list" aria-label={t('navigation.sitemap')} {...props}>
			<ul>
				{graph.sitemap.map((item) => (
					<li key={item.id}>
						<Link href={item.url}>{item.title}</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

export { SitemapList }
