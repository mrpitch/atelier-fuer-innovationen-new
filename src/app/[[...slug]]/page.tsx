import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { bodyImageComponents } from '@/components/content/body-image'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { RundgaengeListe } from '@/components/rundgang/rundgaenge-liste'
import { ThemenListe } from '@/components/thema/themen-liste'
import { ViertelListe } from '@/components/viertel/viertel-liste'
import { buildContentGraph } from '@/lib/content'

// The Stadt area's landing Seite (issue #28): the one Seite ID that also
// lists the Viertel and Zentrum, derived from the content graph.
const STADT_SEITE_ID = 'stadt'

// The Rundgänge area's landing Seite (issue #32): the one Seite ID that also
// lists every Rundgang, the same pattern as the Stadt area above.
const RUNDGAENGE_SEITE_ID = 'rundgaenge'
// The Themen area's landing Seite (issue #31): the one Seite ID that also
// lists the three Themen, derived from the content graph.
const THEMEN_SEITE_ID = 'themen'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

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
			<Body components={bodyImageComponents(id)} />
			{id === STADT_SEITE_ID && <ViertelListe viertel={graph.viertel} zentrum={graph.zentrum} />}
			{id === RUNDGAENGE_SEITE_ID && <RundgaengeListe rundgaenge={graph.rundgaenge} />}
			{id === THEMEN_SEITE_ID && <ThemenListe themen={graph.themen} />}
			<PreviousNext previous={graph.getPrevious(id)} next={graph.getNext(id)} />
		</main>
	)
}

export const dynamicParams = false
