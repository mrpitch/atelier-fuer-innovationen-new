import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

// A slug param's segments, joined back into the URL graph.resolveUrl expects
// (ADR-0001: an optional locale segment is part of that URL, not something
// this route parses by hand).
function urlFromSlug(slug: string[] | undefined): string {
	const segments = slug ?? []
	return segments.length === 0 ? '/' : `/${segments.join('/')}`
}

// The reverse of urlFromSlug, for generateStaticParams: a graph-provided URL
// (German, or a configured locale's own prefixed one) back into slug
// segments.
function slugFromUrl(url: string): string[] {
	return url.split('/').filter(Boolean)
}

export function generateStaticParams() {
	const german = graph.seiten.map((seite) => ({ slug: slugFromUrl(seite.url) }))
	// Prefixed routes only exist once a locale is configured (issue #36,
	// ADR-0001) — graph.locales is empty today, so this contributes nothing.
	const translated = graph.locales.flatMap((locale) =>
		graph.getLocalizedSeiten(locale).map((seite) => ({ slug: slugFromUrl(seite.url) })),
	)
	return [...german, ...translated]
}

export async function generateMetadata({ params }: PageProps<'/[[...slug]]'>): Promise<Metadata> {
	const { slug } = await params
	const resolved = graph.resolveUrl(urlFromSlug(slug))
	if (!resolved) notFound()
	const { seite } = resolved

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
	const resolved = graph.resolveUrl(urlFromSlug(slug))
	if (!resolved) notFound()
	const { seite } = resolved
	const id = seite.id

	// A translated page's body is always the German body for now (issue #36
	// is plumbing, not a shipped translation): no extra locale is configured,
	// so this never runs in production, and there is no translated MDX to
	// compile through Next's MDX pipeline yet (graph.getBody only imports the
	// German file). Breadcrumbs and previous/next stay the German Navigation
	// for the same reason.
	const Body = await graph.getBody(id)

	return (
		<main>
			<Breadcrumbs items={graph.getBreadcrumbs(id)} />
			<h1>{seite.title}</h1>
			<Body />
			{id === STADT_SEITE_ID && <ViertelListe viertel={graph.viertel} zentrum={graph.zentrum} />}
			{id === RUNDGAENGE_SEITE_ID && <RundgaengeListe rundgaenge={graph.rundgaenge} />}
			{id === THEMEN_SEITE_ID && <ThemenListe themen={graph.themen} />}
			<PreviousNext previous={graph.getPrevious(id)} next={graph.getNext(id)} />
		</main>
	)
}

export const dynamicParams = false
