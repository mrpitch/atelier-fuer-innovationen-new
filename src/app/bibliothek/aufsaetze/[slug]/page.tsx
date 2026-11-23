import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AufsatzDetail } from '@/components/aufsatz/aufsatz-detail'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().aufsaetze.map((aufsatz) => {
		const [, , slug] = urlSegments(aufsatz.url)
		return { slug }
	})
}

export async function generateMetadata({
	params,
}: PageProps<'/bibliothek/aufsaetze/[slug]'>): Promise<Metadata> {
	const { slug } = await params
	return documentMetadata(
		findDocument('aufsatz', 'bibliothek', 'aufsaetze', slug) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function AufsatzPage({ params }: PageProps<'/bibliothek/aufsaetze/[slug]'>) {
	const { slug } = await params

	return (
		<main>
			<AufsatzDetail
				aufsatz={findDocument('aufsatz', 'bibliothek', 'aufsaetze', slug) ?? notFound()}
			/>
		</main>
	)
}

export const dynamicParams = false
