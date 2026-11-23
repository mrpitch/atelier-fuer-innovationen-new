import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RundgangDetail } from '@/components/rundgang/rundgang-detail'
import { contentGraph, findDocument, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'

export function generateStaticParams() {
	return contentGraph().rundgaenge.map((rundgang) => {
		const [, slug] = urlSegments(rundgang.url)
		return { rundgang: slug }
	})
}

export async function generateMetadata({
	params,
}: PageProps<'/rundgaenge/[rundgang]'>): Promise<Metadata> {
	const { rundgang } = await params
	return documentMetadata(
		findDocument('rundgang', 'rundgaenge', rundgang) ?? notFound(),
		contentGraph().site.name,
	)
}

export default async function RundgangPage({ params }: PageProps<'/rundgaenge/[rundgang]'>) {
	const { rundgang } = await params

	return (
		<main>
			<RundgangDetail rundgang={findDocument('rundgang', 'rundgaenge', rundgang) ?? notFound()} />
		</main>
	)
}

export const dynamicParams = false
