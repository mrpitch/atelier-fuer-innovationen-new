import path from 'node:path'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

// A Thema's ID is its URL slug under this fixed prefix (ADR-0003), the same
// local mapping the Aufsatz and Viertel routes keep for their own prefixes.
const THEMA_ID_PREFIX = 'themen'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

function idFromSlug(slug: string): string {
	return `${THEMA_ID_PREFIX}/${slug}`
}

export function generateStaticParams() {
	return graph.themen.map((thema) => ({ thema: thema.id.split('/').at(-1)! }))
}

export async function generateMetadata({
	params,
}: PageProps<'/themen/[thema]'>): Promise<Metadata> {
	const { thema: slug } = await params
	const thema = graph.getThema(idFromSlug(slug))
	if (!thema) notFound()

	return {
		title: thema.title,
		description: thema.description,
		alternates: { canonical: thema.url },
	}
}

export default async function ThemaPage({ params }: PageProps<'/themen/[thema]'>) {
	const { thema: slug } = await params
	const id = idFromSlug(slug)
	const thema = graph.getThema(id)
	if (!thema) notFound()

	const Body = await graph.getBody(id)
	// A Themen-Ort's own branching Kapitel; undefined for the Leitthema, which
	// lists every Kapitel instead of branching off a single one (issue #31).
	const branchingKapitel =
		thema.kapitelId !== undefined ? graph.getKapitel(thema.kapitelId) : undefined

	return (
		<main>
			<h1>{thema.title}</h1>
			<Body />
			<nav aria-label={t('thema.kapitelHeading')}>
				<h2>{t('thema.kapitelHeading')}</h2>
				{branchingKapitel ? (
					<Link href={branchingKapitel.url}>
						{t('kapitel.number', { n: branchingKapitel.number })}:{' '}
						{shortTitleOrTitle(branchingKapitel)}
					</Link>
				) : (
					<ol>
						{graph.kapitel.map((kapitel) => (
							<li key={kapitel.id}>
								<Link href={kapitel.url}>
									{t('kapitel.number', { n: kapitel.number })}: {shortTitleOrTitle(kapitel)}
								</Link>
							</li>
						))}
					</ol>
				)}
			</nav>
		</main>
	)
}

export const dynamicParams = false
