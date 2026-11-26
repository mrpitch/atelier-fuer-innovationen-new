import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AbschnittDetail } from '@/components/abschnitt/abschnitt-detail'
import { SiteShell } from '@/components/layout/site-shell'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().kapitel.flatMap((kapitel) =>
		contentGraph()
			.getAbschnitteByKapitel(kapitel.id)
			.map((abschnitt) => {
				const [, viertel, kapitelSlug, position] = urlSegments(abschnitt.url)
				return { viertel, kapitelSlug, position }
			}),
	)
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]/[position]'>): Promise<Metadata> {
	const { viertel, kapitelSlug, position } = await params
	return documentMetadata(
		findDocument('abschnitt', 'stadt', viertel, kapitelSlug, position) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function AbschnittPage({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]/[position]'>) {
	const { viertel, kapitelSlug, position } = await params

	return (
		<SiteShell>
			<main>
				<AbschnittDetail
					abschnitt={
						findDocument('abschnitt', 'stadt', viertel, kapitelSlug, position) ?? notFound()
					}
				/>
			</main>
		</SiteShell>
	)
}

export const dynamicParams = false
