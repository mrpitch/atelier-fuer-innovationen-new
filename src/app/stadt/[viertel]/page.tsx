import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Illustration } from '@/components/viertel/illustration'
import { Steckbrief } from '@/components/viertel/steckbrief'
import { buildContentGraph } from '@/lib/content'

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

	return (
		<main>
			<Illustration id={viertel.id} label={viertel.title} />
			<h1>{viertel.title}</h1>
			<Steckbrief leitsatz={viertel.leitsatz} steckbrief={viertel.steckbrief} />
			<Body />
		</main>
	)
}

export const dynamicParams = false
