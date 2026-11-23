import path from 'node:path'

import Link from 'next/link'
import type * as React from 'react'

import type { Viertel } from '@/lib/content'
import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'

interface ViertelTeaserCardProps extends React.ComponentProps<'article'> {
	viertel: Viertel
}

// The presentational half (issue #35): purely data-driven, so a test can
// render it against a Viertel straight from a fixture graph (Testing
// conventions) without going through ViertelTeaser's own, hardcoded content
// directory.
function ViertelTeaserCard({ viertel, ...props }: ViertelTeaserCardProps) {
	return (
		<article data-slot="viertel-teaser" {...props}>
			<Link href={viertel.url}>
				<span>{String(viertel.number).padStart(2, '0')}</span>
				<h3>{shortTitleOrTitle(viertel)}</h3>
			</Link>
			<p>{viertel.leitsatz}</p>
		</article>
	)
}

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
	const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))
	const viertel = graph.getViertel(id)
	if (!viertel) {
		throw new Error(`ViertelTeaser: unknown Viertel ID: ${id}`)
	}
	return <ViertelTeaserCard viertel={viertel} />
}

export { ViertelTeaser, ViertelTeaserCard }
