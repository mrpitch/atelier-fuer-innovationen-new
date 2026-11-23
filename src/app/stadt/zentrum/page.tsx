import path from 'node:path'

import type { Metadata } from 'next'

import { StationenListe } from '@/components/rundgang/stationen-liste'
import { Illustration } from '@/components/viertel/illustration'
import { buildContentGraph } from '@/lib/content'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

export const metadata: Metadata = {
	title: graph.zentrum.title,
	description: graph.zentrum.description,
	alternates: { canonical: graph.zentrum.url },
}

export default async function ZentrumPage() {
	const Body = await graph.getBody(graph.zentrum.id)

	return (
		<main>
			<Illustration id={graph.zentrum.id} label={graph.zentrum.title} />
			<h1>{graph.zentrum.title}</h1>
			<Body />
			<StationenListe stationen={graph.getStationenByOrt(graph.zentrum.id)} />
		</main>
	)
}
