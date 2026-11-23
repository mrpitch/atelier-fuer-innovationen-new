import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AbschnittDetail } from '@/components/abschnitt/abschnitt-detail'
import { AufsatzDetail } from '@/components/aufsatz/aufsatz-detail'
import { KapitelDetail } from '@/components/kapitel/kapitel-detail'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { RundgaengeListe } from '@/components/rundgang/rundgaenge-liste'
import { RundgangDetail } from '@/components/rundgang/rundgang-detail'
import { StationDetail } from '@/components/rundgang/station-detail'
import { ThemaDetail } from '@/components/thema/thema-detail'
import { ThemenListe } from '@/components/thema/themen-liste'
import { ViertelDetail } from '@/components/viertel/viertel-detail'
import { ViertelListe } from '@/components/viertel/viertel-liste'
import { ZentrumDetail } from '@/components/zentrum/zentrum-detail'
import type { Seite } from '@/lib/content'
import { contentGraph, urlFromSegments, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'
import { bodyImageComponents } from '@/mdx-components'

// The Stadt area's landing Seite (issue #28): the one Seite ID that also
// lists the Viertel and Zentrum, derived from the content graph.
const STADT_SEITE_ID = 'stadt'

// The Rundgänge area's landing Seite (issue #32): the one Seite ID that also
// lists every Rundgang, the same pattern as the Stadt area above.
const RUNDGAENGE_SEITE_ID = 'rundgaenge'
// The Themen area's landing Seite (issue #31): the one Seite ID that also
// lists the three Themen, derived from the content graph.
const THEMEN_SEITE_ID = 'themen'

// A slug param's segments, joined back into the URL graph.resolveUrl expects
// (ADR-0001: an optional locale segment is part of that URL, not something
// this route parses by hand).
function resolveSlug(slug: string[] | undefined) {
	const resolved = contentGraph().resolveUrl(urlFromSegments(slug ?? []))
	if (!resolved) notFound()
	return resolved
}

// This route serves every Seite, German or localized, and every localized
// document of any other type (issue #36, ADR-0001): a German Viertel,
// Kapitel, … has its own dedicated route, so the only non-Seite URLs here are
// the prefixed ones, one per `getLocalizedDocuments(locale)` entry for each
// configured locale — none in production, so a production build has no
// prefixed route.
export function generateStaticParams() {
	const graph = contentGraph()
	const german = graph.seiten.map((seite) => ({ slug: urlSegments(seite.url) }))
	const localized = graph.locales.flatMap((locale) =>
		graph
			.getLocalizedDocuments(locale)
			.map(({ document }) => ({ slug: urlSegments(document.url) })),
	)
	return [...german, ...localized]
}

export async function generateMetadata({ params }: PageProps<'/[[...slug]]'>): Promise<Metadata> {
	const { slug } = await params
	const { document, locale } = resolveSlug(slug)
	return documentMetadata(document, contentGraph().site.name, locale)
}

// A Seite's page: its body plus, on the three area landing Seiten, the list
// of the area's documents. Breadcrumbs and previous/next stay the German
// Navigation under a locale: only the translatable fields a translation can
// set change (issue #36).
async function SeitePage({ seite, locale }: { seite: Seite; locale?: string }) {
	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)

	return (
		<main>
			<Breadcrumbs items={graph.getBreadcrumbs(seite.id)} />
			<h1>{seite.title}</h1>
			<Body components={bodyImageComponents(seite.id)} />
			{seite.id === STADT_SEITE_ID && (
				<ViertelListe viertel={graph.viertel} zentrum={graph.zentrum} />
			)}
			{seite.id === RUNDGAENGE_SEITE_ID && <RundgaengeListe rundgaenge={graph.rundgaenge} />}
			{seite.id === THEMEN_SEITE_ID && <ThemenListe themen={graph.themen} />}
			<PreviousNext previous={graph.getPrevious(seite.id)} next={graph.getNext(seite.id)} />
		</main>
	)
}

export default async function Page({ params }: PageProps<'/[[...slug]]'>) {
	const { slug } = await params
	const resolved = resolveSlug(slug)
	const { locale } = resolved

	switch (resolved.kind) {
		case 'viertel':
			return (
				<main>
					<ViertelDetail viertel={resolved.document} locale={locale} />
				</main>
			)
		case 'zentrum':
			return (
				<main>
					<ZentrumDetail zentrum={resolved.document} locale={locale} />
				</main>
			)
		case 'aufsatz':
			return (
				<main>
					<AufsatzDetail aufsatz={resolved.document} locale={locale} />
				</main>
			)
		case 'kapitel':
			return (
				<main>
					<KapitelDetail kapitel={resolved.document} locale={locale} />
				</main>
			)
		case 'abschnitt':
			return (
				<main>
					<AbschnittDetail abschnitt={resolved.document} locale={locale} />
				</main>
			)
		case 'thema':
			return (
				<main>
					<ThemaDetail thema={resolved.document} locale={locale} />
				</main>
			)
		case 'rundgang':
			return (
				<main>
					<RundgangDetail rundgang={resolved.document} locale={locale} />
				</main>
			)
		case 'station':
			return (
				<main>
					<StationDetail station={resolved.document} locale={locale} />
				</main>
			)
		case 'seite':
			return <SeitePage seite={resolved.document} locale={locale} />
	}
}

export const dynamicParams = false
