import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ZentrumDetail } from '@/components/zentrum/zentrum-detail'
import { contentGraph } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

// A production graph has no Zentrum while it is a Draft (issue #33).
export function generateMetadata(): Metadata {
	const graph = contentGraph()
	if (!graph.zentrum) notFound()
	return documentMetadata(graph.zentrum, graph.site.name)
}

export default function ZentrumPage() {
	const { zentrum } = contentGraph()
	if (!zentrum) notFound()

	return (
		<main>
			<ZentrumDetail zentrum={zentrum} />
		</main>
	)
}
