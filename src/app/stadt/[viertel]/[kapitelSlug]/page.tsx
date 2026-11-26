import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { KapitelDetail } from '@/components/kapitel/kapitel-detail'
import { SiteShell } from '@/components/layout/site-shell'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().kapitel.map((kapitel) => {
		const [, viertel, kapitelSlug] = urlSegments(kapitel.url)
		return { viertel, kapitelSlug }
	})
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]'>): Promise<Metadata> {
	const { viertel, kapitelSlug } = await params
	return documentMetadata(
		findDocument('kapitel', 'stadt', viertel, kapitelSlug) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function KapitelPage({ params }: PageProps<'/stadt/[viertel]/[kapitelSlug]'>) {
	const { viertel, kapitelSlug } = await params

	return (
		<SiteShell>
			<main>
				<KapitelDetail
					kapitel={findDocument('kapitel', 'stadt', viertel, kapitelSlug) ?? notFound()}
				/>
			</main>
		</SiteShell>
	)
}

export const dynamicParams = false
