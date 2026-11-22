import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { ViertelListe } from '@/components/viertel/viertel-liste'
import { buildContentGraph } from '@/lib/content'

// The Stadt area's landing Seite (issue #28): the one Seite ID that also
// lists the Viertel and Zentrum, derived from the content graph.
const STADT_SEITE_ID = 'stadt'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

function idFromSlug(slug: string[] | undefined): string {
	return (slug ?? []).join('/')
}

function importSeiteBody(id: string) {
	return id === '' ? import('@/content/index.mdx') : import(`@/content/${id}/index.mdx`)
}

export function generateStaticParams() {
	return graph.seiten.map((seite) => ({
		slug: seite.id === '' ? [] : seite.id.split('/'),
	}))
}

export async function generateMetadata({ params }: PageProps<'/[[...slug]]'>): Promise<Metadata> {
	const { slug } = await params
	const seite = graph.getSeite(idFromSlug(slug))
	if (!seite) notFound()

	return {
		title: seite.title,
		description: seite.description,
		alternates: { canonical: seite.url },
		openGraph: {
			title: seite.title,
			description: seite.description,
			url: seite.url,
			siteName: graph.site.name,
		},
	}
}

export default async function Page({ params }: PageProps<'/[[...slug]]'>) {
	const { slug } = await params
	const id = idFromSlug(slug)
	const seite = graph.getSeite(id)
	if (!seite) notFound()

	const { default: Body } = await importSeiteBody(id)

	return (
		<main>
			<Breadcrumbs items={graph.getBreadcrumbs(id)} />
			<h1>{seite.title}</h1>
			<Body />
			{id === STADT_SEITE_ID && <ViertelListe viertel={graph.viertel} zentrum={graph.zentrum} />}
			<PreviousNext previous={graph.getPrevious(id)} next={graph.getNext(id)} />
		</main>
	)
}

export const dynamicParams = false
