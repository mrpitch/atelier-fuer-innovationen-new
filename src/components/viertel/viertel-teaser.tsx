import { contentGraph } from '@/lib/content'

import { ViertelTeaserCard } from './viertel-teaser-card'

interface ViertelTeaserProps {
	id: string
}

// The first content-referencing component (issue #35): an author writes
// <ViertelTeaser id="stadt/..." /> in any MDX body, without an import
// (content-layer.md). Unlike Breadcrumbs/PreviousNext, it reads the content
// graph itself, the same way SitemapList does — a page can't hand it data,
// since it doesn't know in advance which IDs a body's components reference.
// The content graph validates the ID the same way a frontmatter reference
// field is (body.ts) before the build ever renders this, the same
// assumption Illustration makes for its own ID lookup.
function ViertelTeaser({ id }: ViertelTeaserProps) {
	const graph = contentGraph()
	const viertel = graph.getViertel(id)
	if (!viertel) {
		throw new Error(`ViertelTeaser: unknown Viertel ID: ${id}`)
	}
	return <ViertelTeaserCard viertel={viertel} />
}

export { ViertelTeaser }
