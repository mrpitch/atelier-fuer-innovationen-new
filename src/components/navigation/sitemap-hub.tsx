import { cn } from 'cn'
import type * as React from 'react'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { SitemapList } from '@/components/navigation/sitemap-list'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitleXl } from '@/components/ui/section-title-xl'
import type { Seite } from '@/lib/content'
import { contentGraph } from '@/lib/content'

interface SitemapHubProps extends React.ComponentProps<'div'> {
	seite: Seite
}

// /sitemap (issue #136, Figma page 6, 36617:15595): Breadcrumbs, the Section
// Title XL Seitenkopf — kicker, title and description all from the Sitemap
// Seite's own frontmatter, the same `tagline` field the Startseite's own Hero
// reads — and the restyled, generated Sitemap list. Nothing else (the
// issue's own "What to build"): no previous/next, since a utility page like
// this has no reading-order neighbour.
function SitemapHub({ seite, className, ...props }: SitemapHubProps) {
	const graph = contentGraph()
	if (!seite.tagline) throw new Error('SitemapHub: the Sitemap Seite has no tagline (kicker)')

	return (
		<div data-slot="sitemap-hub" className={cn(className)} {...props}>
			<Breadcrumbs items={graph.getBreadcrumbs(seite.id)} />
			<PageSection data-slot="sitemap-hub-section" className="flex flex-col gap-14">
				<SectionTitleXl
					kicker={seite.tagline}
					title={seite.title}
					description={seite.description}
				/>
				<SitemapList />
			</PageSection>
		</div>
	)
}

export { SitemapHub }
