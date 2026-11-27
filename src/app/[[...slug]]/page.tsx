import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AbschnittDetail } from '@/components/abschnitt/abschnitt-detail'
import { AufsatzDetail } from '@/components/aufsatz/aufsatz-detail'
import { KapitelDetail } from '@/components/kapitel/kapitel-detail'
import { SiteShell } from '@/components/layout/site-shell'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'
import { PreviousNext } from '@/components/navigation/previous-next'
import { RundgaengeHub } from '@/components/rundgang/rundgaenge-hub'
import { RundgangDetail } from '@/components/rundgang/rundgang-detail'
import { StationDetail } from '@/components/rundgang/station-detail'
import { StadtplanHub } from '@/components/stadt/stadtplan-hub'
import { StartHub } from '@/components/start/start-hub'
import { ThemaDetail } from '@/components/thema/thema-detail'
import { ThemenHub } from '@/components/thema/themen-hub'
import { ViertelDetail } from '@/components/viertel/viertel-detail'
import { ZentrumDetail } from '@/components/zentrum/zentrum-detail'
import type { Seite } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID, urlFromSegments, urlSegments } from '@/lib/content'
import { documentMetadata } from '@/lib/utils/document-metadata'
import { bodyImageComponents } from '@/mdx-components'

// The Startseite (issue #129, epic #128): the root Seite's own full-page
// layout — the StartHub — rather than the generic Seite + MDX body every
// other Seite below still gets; its MDX body is never rendered.
const START_SEITE_ID = ''

// The Stadt area's landing Seite: the Stadtplan-Hub (issue #95), its own
// full-page layout rather than the generic Seite + area list every other
// landing Seite below gets.
const STADT_SEITE_ID = 'stadt'

// The Themen area's landing Seite: the Themen-Hub (issue #149), its own
// full-page layout rather than the generic Seite + area list every other
// landing Seite below gets.
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
	// The Startseite (issue #129) is its own full-page layout — the StartHub —
	// not the generic Seite shape every other landing Seite below still gets;
	// its MDX body is never rendered.
	if (seite.id === START_SEITE_ID) {
		return (
			<SiteShell>
				<main>
					<StartHub seite={seite} />
				</main>
			</SiteShell>
		)
	}

	// The Stadtplan-Hub (issue #95) is its own full-page layout — Bild-Hero,
	// Stadtplan and table — not the generic Seite shape every other landing
	// Seite below still gets.
	if (seite.id === STADT_SEITE_ID) {
		return (
			<SiteShell>
				<main>
					<StadtplanHub seite={seite} locale={locale} />
				</main>
			</SiteShell>
		)
	}

	// The Rundgänge-Hub (issue #119) is its own full-page layout — Bild-Hero,
	// one Rundgang-Eintrag per Rundgang and "So funktioniert ein Rundgang" —
	// not the generic Seite shape every other landing Seite below still gets.
	if (seite.id === RUNDGAENGE_SEITE_ID) {
		return (
			<SiteShell>
				<main>
					<RundgaengeHub seite={seite} locale={locale} />
				</main>
			</SiteShell>
		)
	}

	// The Themen-Hub (issue #149) is its own full-page layout — Ortsleiste,
	// Seitenkopf, Themen-Triptychon and Rundgänge-Hinweis — not the generic
	// Seite shape every other landing Seite below still gets, and not the
	// placeholder ThemenListe it replaces.
	if (seite.id === THEMEN_SEITE_ID) {
		return (
			<SiteShell>
				<main>
					<ThemenHub seite={seite} locale={locale} />
				</main>
			</SiteShell>
		)
	}

	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)

	return (
		<SiteShell>
			<main>
				<Breadcrumbs items={graph.getBreadcrumbs(seite.id)} />
				<h1>{seite.title}</h1>
				<Body components={bodyImageComponents(seite.id)} />
				<PreviousNext previous={graph.getPrevious(seite.id)} next={graph.getNext(seite.id)} />
			</main>
		</SiteShell>
	)
}

export default async function Page({ params }: PageProps<'/[[...slug]]'>) {
	const { slug } = await params
	const resolved = resolveSlug(slug)
	const { locale } = resolved

	switch (resolved.kind) {
		case 'viertel':
			return (
				<SiteShell>
					<main>
						<ViertelDetail viertel={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'zentrum':
			return (
				<SiteShell>
					<main>
						<ZentrumDetail zentrum={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'aufsatz':
			return (
				<SiteShell>
					<main>
						<AufsatzDetail aufsatz={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'kapitel':
			return (
				<SiteShell>
					<main>
						<KapitelDetail kapitel={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'abschnitt':
			return (
				<SiteShell>
					<main>
						<AbschnittDetail abschnitt={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'thema':
			return (
				<SiteShell>
					<main>
						<ThemaDetail thema={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'rundgang':
			return (
				<SiteShell>
					<main>
						<RundgangDetail rundgang={resolved.document} locale={locale} />
					</main>
				</SiteShell>
			)
		case 'station':
			// A Station page (issue #120) has its own Rundgang-Leiste in place of
			// the site Header and Footer, so this is the one case SiteShell skips.
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
