import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { ThemenListe } from '@/components/thema/themen-liste'
import { ViertelListe } from '@/components/viertel/viertel-liste'
import { buildContentGraph } from '@/lib/content'

// The Stadt area's landing Seite (issue #28): the one Seite ID that also
// lists the Viertel and Zentrum, derived from the content graph.
const STADT_SEITE_ID = 'stadt'

// The Themen area's landing Seite (issue #31): the one Seite ID that also
// lists the three Themen, derived from the content graph.
const THEMEN_SEITE_ID = 'themen'

// `next dev` is the one caller that previews a Draft (issue #33); every other
// command, `next build` included, sees the published-only graph.
const graph = buildContentGraph(path.join(process.cwd(), 'src/content'), {
	development: process.env.NODE_ENV === 'development',
})

function idFromSlug(slug: string[] | undefined): string {
	return (slug ?? []).join('/')
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

	const Body = await graph.getBody(id)

	return (
		<main>
			<Breadcrumbs items={graph.getBreadcrumbs(id)} />
			<h1>{seite.title}</h1>
			<Body />
			{id === STADT_SEITE_ID && <ViertelListe viertel={graph.viertel} zentrum={graph.zentrum} />}
			{id === THEMEN_SEITE_ID && <ThemenListe themen={graph.themen} />}
			<PreviousNext previous={graph.getPrevious(id)} next={graph.getNext(id)} />
		</main>
	)
}

export const dynamicParams = false
