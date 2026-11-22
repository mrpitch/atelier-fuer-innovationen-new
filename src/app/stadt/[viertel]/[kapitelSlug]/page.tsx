import path from 'node:path'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

// A Kapitel's URL segment under its Viertel comes from the graph's own
// kapitelUrl() rule (ADR-0003: one URL rule per type, in the content graph) —
// this route only compares the requested segment against it, never rebuilds
// the "kapitel-{n}" format itself.
function findKapitel(viertelSlug: string, requestedKapitelSlug: string) {
	const kapitel = graph.getKapitelByViertel(`stadt/${viertelSlug}`)
	return kapitel && kapitel.url.split('/').at(-1) === requestedKapitelSlug ? kapitel : undefined
}

export function generateStaticParams() {
	return graph.kapitel.map((kapitel) => ({
		viertel: kapitel.viertelId.split('/').at(-1)!,
		kapitelSlug: kapitel.url.split('/').at(-1)!,
	}))
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]/[kapitelSlug]'>): Promise<Metadata> {
	const { viertel, kapitelSlug: requestedKapitelSlug } = await params
	const kapitel = findKapitel(viertel, requestedKapitelSlug)
	if (!kapitel) notFound()

	return {
		title: kapitel.title,
		description: kapitel.description,
		alternates: { canonical: kapitel.url },
	}
}

export default async function KapitelPage({ params }: PageProps<'/stadt/[viertel]/[kapitelSlug]'>) {
	const { viertel, kapitelSlug: requestedKapitelSlug } = await params
	const kapitel = findKapitel(viertel, requestedKapitelSlug)
	if (!kapitel) notFound()

	const Body = await graph.getBody(kapitel.id)
	const abschnitte = graph.getAbschnitteByKapitel(kapitel.id)
	const abschnitteCount = t('kapitel.abschnitteCount', { n: abschnitte.length })
	const themenOrte = graph.getThemenByKapitel(kapitel.id)

	return (
		<main>
			<p>{t('kapitel.number', { n: kapitel.number })}</p>
			<h1>{kapitel.title}</h1>
			<Body />
			<nav aria-label={abschnitteCount}>
				<h2>{abschnitteCount}</h2>
				<ol>
					{abschnitte.map((abschnitt) => (
						<li key={abschnitt.id}>
							<Link href={abschnitt.url}>
								{abschnitt.number} {shortTitleOrTitle(abschnitt)}
							</Link>
						</li>
					))}
				</ol>
			</nav>
			{themenOrte.length > 0 && (
				<nav aria-label={t('kapitel.themenOrtHeading')}>
					<h2>{t('kapitel.themenOrtHeading')}</h2>
					<ul>
						{themenOrte.map((thema) => (
							<li key={thema.id}>
								<Link href={thema.url}>{shortTitleOrTitle(thema)}</Link>
							</li>
						))}
					</ul>
				</nav>
			)}
		</main>
	)
}

export const dynamicParams = false
