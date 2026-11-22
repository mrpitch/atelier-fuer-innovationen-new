import path from 'node:path'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AufsaetzeListe } from '@/components/aufsatz/aufsaetze-liste'
import { Illustration } from '@/components/viertel/illustration'
import { Steckbrief } from '@/components/viertel/steckbrief'
import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

// A Viertel's ID is its URL segment under the Stadt area's document ID
// (loader.ts's location rule); ADR-0003 keeps that mapping local to this
// route instead of reusing the file path generically, the way Seite does.
function idFromViertelSlug(slug: string): string {
	return `stadt/${slug}`
}

function importViertelBody(id: string) {
	return import(`@/content/${id}/index.mdx`)
}

export function generateStaticParams() {
	return graph.viertel.map((viertel) => ({ viertel: viertel.id.split('/').at(-1)! }))
}

export async function generateMetadata({
	params,
}: PageProps<'/stadt/[viertel]'>): Promise<Metadata> {
	const { viertel: slug } = await params
	const viertel = graph.getViertel(idFromViertelSlug(slug))
	if (!viertel) notFound()

	return {
		title: viertel.title,
		description: viertel.description,
		alternates: { canonical: viertel.url },
	}
}

export default async function ViertelPage({ params }: PageProps<'/stadt/[viertel]'>) {
	const { viertel: slug } = await params
	const id = idFromViertelSlug(slug)
	const viertel = graph.getViertel(id)
	if (!viertel) notFound()

	const { default: Body } = await importViertelBody(id)
	const kapitel = graph.getKapitelByViertel(viertel.id)

	return (
		<main>
			<Illustration id={viertel.id} label={viertel.title} />
			<h1>{viertel.title}</h1>
			<Steckbrief leitsatz={viertel.leitsatz} steckbrief={viertel.steckbrief} />
			<Body />
			{kapitel && (
				<nav aria-label={t('viertel.kapitelHeading')}>
					<h2>{t('viertel.kapitelHeading')}</h2>
					<Link href={kapitel.url}>
						{t('kapitel.number', { n: kapitel.number })}: {shortTitleOrTitle(kapitel)}
					</Link>
				</nav>
			)}
			<AufsaetzeListe aufsaetze={graph.getAufsaetzeByViertel(viertel.id)} />
		</main>
	)
}

export const dynamicParams = false
