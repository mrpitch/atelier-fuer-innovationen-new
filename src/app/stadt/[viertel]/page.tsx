import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ViertelDetail } from '@/components/viertel/viertel-detail'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().viertel.map((viertel) => {
		const [, slug] = urlSegments(viertel.url)
		return { viertel: slug }
	})
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]'>): Promise<Metadata> {
	const { viertel: slug } = await params
	return documentMetadata(
		findDocument('viertel', 'stadt', slug) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function ViertelPage({ params }: PageProps<'/stadt/[viertel]'>) {
	const { viertel: slug } = await params

	return (
		<main>
			<ViertelDetail viertel={findDocument('viertel', 'stadt', slug) ?? notFound()} />
		</main>
	)
}

export const dynamicParams = false
