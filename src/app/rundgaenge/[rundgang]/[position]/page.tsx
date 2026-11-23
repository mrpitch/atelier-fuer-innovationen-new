import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StationDetail } from '@/components/rundgang/station-detail'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().rundgaenge.flatMap((rundgang) =>
		contentGraph()
			.getStationenByRundgang(rundgang.id)
			.map((station) => {
				const [, rundgangSlug, position] = urlSegments(station.url)
				return { rundgang: rundgangSlug, position }
			}),
	)
}

export async function generateMetadata({
	params,
}: PageProps<'/rundgaenge/[rundgang]/[position]'>): Promise<Metadata> {
	const { rundgang, position } = await params
	return documentMetadata(
		findDocument('station', 'rundgaenge', rundgang, position) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function StationPage({
	params,
}: PageProps<'/rundgaenge/[rundgang]/[position]'>) {
	const { rundgang, position } = await params

	return (
		<main>
			<StationDetail
				station={findDocument('station', 'rundgaenge', rundgang, position) ?? notFound()}
			/>
		</main>
	)
}

export const dynamicParams = false
