import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SiteShell } from '@/components/layout/site-shell'
import { ThemaDetail } from '@/components/thema/thema-detail'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().themen.map((thema) => {
		const [, slug] = urlSegments(thema.url)
		return { thema: slug }
	})
}

export async function generateMetadata({
	params,
}: PageProps<'/themen/[thema]'>): Promise<Metadata> {
	const { thema } = await params
	return documentMetadata(
		findDocument('thema', 'themen', thema) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function ThemaPage({ params }: PageProps<'/themen/[thema]'>) {
	const { thema } = await params

	return (
		<SiteShell>
			<main>
				<ThemaDetail thema={findDocument('thema', 'themen', thema) ?? notFound()} />
			</main>
		</SiteShell>
	)
}

export const dynamicParams = false
