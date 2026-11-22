import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PreviousNext } from '@/components/navigation/previous-next'
import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

const RUNDGANG_ID_PREFIX = 'rundgaenge'

// A Station's URL segment under its Rundgang comes from the graph's own
// numbering rule (ADR-0003, station.ts) — this route only compares the
// requested segment against it, never recomputes the number itself.
function findStation(rundgangSlug: string, position: string) {
	const rundgang = graph.getRundgang(`${RUNDGANG_ID_PREFIX}/${rundgangSlug}`)
	if (!rundgang) return undefined
	return graph.getStationenByRundgang(rundgang.id).find((item) => String(item.number) === position)
}

export function generateStaticParams() {
	return graph.rundgaenge.flatMap((rundgang) =>
		graph.getStationenByRundgang(rundgang.id).map((station) => ({
			rundgang: rundgang.id.split('/').at(-1)!,
			position: String(station.number),
		})),
	)
}

export async function generateMetadata({
	params,
}: PageProps<'/rundgaenge/[rundgang]/[position]'>): Promise<Metadata> {
	const { rundgang: rundgangSlug, position } = await params
	const station = findStation(rundgangSlug, position)
	if (!station) notFound()

	return {
		title: station.title,
		description: station.description,
		alternates: { canonical: station.url },
	}
}

export default async function StationPage({
	params,
}: PageProps<'/rundgaenge/[rundgang]/[position]'>) {
	const { rundgang: rundgangSlug, position } = await params
	const station = findStation(rundgangSlug, position)
	if (!station) notFound()

	const Body = await graph.getBody(station.id)

	return (
		<main>
			<h1>
				{t('station.number', { n: station.number })}: {shortTitleOrTitle(station)}
			</h1>
			<p>{t('station.readingTime', { n: station.readingTimeMinutes })}</p>
			<Body />
			<PreviousNext
				previous={graph.getPreviousStation(station.id)}
				next={graph.getNextStation(station.id)}
			/>
		</main>
	)
}

export const dynamicParams = false
