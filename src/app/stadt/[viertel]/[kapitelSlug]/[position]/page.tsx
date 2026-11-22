import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PreviousNext } from '@/components/navigation/previous-next'
import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

// A Kapitel's URL segment under its Viertel comes from the graph's own
// kapitelUrl() rule (ADR-0003: one URL rule per type, in the content graph) —
// this route only compares the requested segment against it, never rebuilds
// the "kapitel-{n}" format itself.
function findAbschnitt(viertelSlug: string, requestedKapitelSlug: string, position: string) {
	const kapitel = graph.getKapitelByViertel(`stadt/${viertelSlug}`)
	if (!kapitel || kapitel.url.split('/').at(-1) !== requestedKapitelSlug) return undefined
	return graph.getAbschnitteByKapitel(kapitel.id).find((item) => String(item.position) === position)
}

function importAbschnittBody(id: string) {
	return import(`@/content/${id}/index.mdx`)
}

export function generateStaticParams() {
	return graph.kapitel.flatMap((kapitel) =>
		graph.getAbschnitteByKapitel(kapitel.id).map((abschnitt) => ({
			viertel: kapitel.viertelId.split('/').at(-1)!,
			kapitelSlug: kapitel.url.split('/').at(-1)!,
			position: String(abschnitt.position),
		})),
	)
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]/[position]'>): Promise<Metadata> {
	const { viertel, kapitelSlug: requestedKapitelSlug, position } = await params
	const abschnitt = findAbschnitt(viertel, requestedKapitelSlug, position)
	if (!abschnitt) notFound()

	return {
		title: abschnitt.title,
		description: abschnitt.description,
		alternates: { canonical: abschnitt.url },
	}
}

export default async function AbschnittPage({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]/[position]'>) {
	const { viertel, kapitelSlug: requestedKapitelSlug, position } = await params
	const abschnitt = findAbschnitt(viertel, requestedKapitelSlug, position)
	if (!abschnitt) notFound()

	const { default: Body } = await importAbschnittBody(abschnitt.id)

	return (
		<main>
			<h1>
				{abschnitt.number} {shortTitleOrTitle(abschnitt)}
			</h1>
			<p>{t('abschnitt.readingTime', { n: abschnitt.readingTimeMinutes })}</p>
			<Body />
			<PreviousNext
				previous={graph.getPreviousAbschnitt(abschnitt.id)}
				next={graph.getNextAbschnitt(abschnitt.id)}
			/>
		</main>
	)
}

export const dynamicParams = false
