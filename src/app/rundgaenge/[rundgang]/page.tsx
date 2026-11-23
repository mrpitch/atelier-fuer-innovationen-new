import path from 'node:path'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

// A Rundgang's ID is its URL segment under this fixed prefix (ADR-0003),
// kept local to this route the same way the Aufsatz route keeps its own
// id-from-slug mapping local instead of reusing the Seite rule generically.
const RUNDGANG_ID_PREFIX = 'rundgaenge'

function idFromSlug(slug: string): string {
	return `${RUNDGANG_ID_PREFIX}/${slug}`
}

export function generateStaticParams() {
	return graph.rundgaenge.map((rundgang) => ({ rundgang: rundgang.id.split('/').at(-1)! }))
}

export async function generateMetadata({
	params,
}: PageProps<'/rundgaenge/[rundgang]'>): Promise<Metadata> {
	const { rundgang: slug } = await params
	const rundgang = graph.getRundgang(idFromSlug(slug))
	if (!rundgang) notFound()

	return {
		title: rundgang.title,
		description: rundgang.description,
		alternates: { canonical: rundgang.url },
	}
}

export default async function RundgangPage({ params }: PageProps<'/rundgaenge/[rundgang]'>) {
	const { rundgang: slug } = await params
	const id = idFromSlug(slug)
	const rundgang = graph.getRundgang(id)
	if (!rundgang) notFound()

	const Body = await graph.getBody(id)
	const stationen = graph.getStationenByRundgang(id)
	const stationenCount = t('rundgang.stationenCount', { n: rundgang.stationenCount })

	return (
		<main>
			<h1>{rundgang.title}</h1>
			<p>{t('rundgang.duration', { n: rundgang.durationMinutes })}</p>
			<Body />
			<nav aria-label={stationenCount}>
				<h2>{stationenCount}</h2>
				<ol>
					{stationen.map((station) => (
						<li key={station.id}>
							<Link href={station.url}>
								{t('station.number', { n: station.number })}: {shortTitleOrTitle(station)}
							</Link>
						</li>
					))}
				</ol>
			</nav>
		</main>
	)
}

export const dynamicParams = false
