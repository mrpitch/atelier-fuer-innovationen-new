import path from 'node:path'

import type { Metadata } from 'next'

import { Illustration } from '@/components/viertel/illustration'
import { buildContentGraph } from '@/lib/content'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

export const metadata: Metadata = {
	title: graph.zentrum.title,
	description: graph.zentrum.description,
	alternates: { canonical: graph.zentrum.url },
}

export default async function ZentrumPage() {
	// A literal import, not a dynamic one keyed by graph.zentrum.id: there is
	// exactly one Zentrum, tied 1:1 to this route (the same reasoning the
	// catch-all page uses for the root Seite's own literal import).
	const { default: Body } = await import('@/content/stadt/zentrum/index.mdx')

	return (
		<main>
			<Illustration id={graph.zentrum.id} label={graph.zentrum.title} />
			<h1>{graph.zentrum.title}</h1>
			<Body />
		</main>
	)
}
