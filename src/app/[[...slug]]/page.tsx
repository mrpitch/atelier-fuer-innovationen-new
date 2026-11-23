import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { bodyImageComponents } from '@/components/content/body-image'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { RundgaengeListe } from '@/components/rundgang/rundgaenge-liste'
import { ThemenListe } from '@/components/thema/themen-liste'
import { ViertelDetail } from '@/components/viertel/viertel-detail'
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

// `next dev` is the one caller that previews a Draft (issue #33); every other
// command, `next build` included, sees the published-only graph.
const graph = buildContentGraph(path.join(process.cwd(), 'src/content'), {
	development: process.env.NODE_ENV === 'development',
})

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
	// ADR-0001) — graph.locales is empty today, so neither of these
	// contributes anything. A Viertel's own unprefixed German route comes
	// from its dedicated page (src/app/stadt/[viertel]/page.tsx), not here —
	// only its localized, prefixed URLs belong to the catch-all.
	const translatedSeiten = graph.locales.flatMap((locale) =>
		graph.getLocalizedSeiten(locale).map((seite) => ({ slug: slugFromUrl(seite.url) })),
	)
	const translatedViertel = graph.locales.flatMap((locale) =>
		graph.getLocalizedViertel(locale).map((viertel) => ({ slug: slugFromUrl(viertel.url) })),
	)
	return [...german, ...translatedSeiten, ...translatedViertel]
}

export async function generateMetadata({ params }: PageProps<'/[[...slug]]'>): Promise<Metadata> {
	const { slug } = await params
	const resolved = graph.resolveUrl(urlFromSlug(slug))
	if (!resolved) notFound()
	const document = resolved.kind === 'seite' ? resolved.seite : resolved.viertel

	return {
		title: document.title,
		description: document.description,
		alternates: { canonical: document.url },
		openGraph: {
			title: document.title,
			description: document.description,
			url: document.url,
			siteName: graph.site.name,
		},
	}
}

export default async function Page({ params }: PageProps<'/[[...slug]]'>) {
	const { slug } = await params
	const resolved = graph.resolveUrl(urlFromSlug(slug))
	if (!resolved) notFound()

	// A translated page's body is always the German body for now (issue #36
	// is plumbing, not a shipped translation): no extra locale is configured,
	// so this never runs in production, and there is no translated MDX to
	// compile through Next's MDX pipeline yet (graph.getBody only imports the
	// German file). Breadcrumbs, previous/next and a Viertel's related
	// Aufsätze/Stationen/Kapitel stay the German Navigation and data for the
	// same reason — only the fields a translation can set actually change.
	if (resolved.kind === 'viertel') {
		const { viertel } = resolved
		const Body = await graph.getBody(viertel.id)

		return (
			<main>
				<ViertelDetail
					viertel={viertel}
					Body={Body}
					kapitel={graph.getKapitelByViertel(viertel.id)}
					aufsaetze={graph.getAufsaetzeByViertel(viertel.id)}
					stationen={graph.getStationenByOrt(viertel.id)}
				/>
			</main>
		)
	}

	const { seite } = resolved
	const id = seite.id
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
