import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { buildContentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

// An Aufsatz's ID is its URL slug under this fixed prefix (ADR-0003); kept
// local to this route, the same way the Viertel route keeps its own
// id-from-slug mapping local instead of reusing the Seite rule generically.
const AUFSATZ_ID_PREFIX = 'bibliothek/aufsaetze'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

function idFromSlug(slug: string): string {
	return `${AUFSATZ_ID_PREFIX}/${slug}`
}

function importAufsatzBody(id: string) {
	return import(`@/content/${id}/index.mdx`)
}

export function generateStaticParams() {
	return graph.aufsaetze.map((aufsatz) => ({ slug: aufsatz.id.split('/').at(-1)! }))
}

export async function generateMetadata({
	params,
}: PageProps<'/bibliothek/aufsaetze/[slug]'>): Promise<Metadata> {
	const { slug } = await params
	const aufsatz = graph.getAufsatz(idFromSlug(slug))
	if (!aufsatz) notFound()

	return {
		title: aufsatz.title,
		description: aufsatz.description,
		alternates: { canonical: aufsatz.url },
	}
}

export default async function AufsatzPage({ params }: PageProps<'/bibliothek/aufsaetze/[slug]'>) {
	const { slug } = await params
	const id = idFromSlug(slug)
	const aufsatz = graph.getAufsatz(id)
	if (!aufsatz) notFound()

	const { default: Body } = await importAufsatzBody(id)

	return (
		<main>
			<h1>{aufsatz.title}</h1>
			<p>{t('aufsatz.readingTime', { n: aufsatz.readingTimeMinutes })}</p>
			<Body />
		</main>
	)
}

export const dynamicParams = false
