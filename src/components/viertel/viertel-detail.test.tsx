import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(
	path.join(fixturesDir, '..', '..', 'zentrum', '__fixtures__', 'zentrum-detail-valid'),
)
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { ViertelDetail } = await import('./viertel-detail')

describe('ViertelDetail', () => {
	it('leaves the Kapitel button and the Thema badge out for a Viertel without a Kapitel', async () => {
		const [viertel] = graph.viertel
		if (!viertel) throw new Error('fixture missing a Viertel')
		expect(graph.getKapitelByViertel(viertel.id)).toBeUndefined()

		const html = renderToStaticMarkup(await ViertelDetail({ viertel }))
		const hero = html.slice(
			html.indexOf('<section data-slot="bild-hero"'),
			html.indexOf('</section>'),
		)

		expect(hero).toContain('Annäherung')
		expect(hero).not.toContain('Kapitel')
		expect(hero).not.toContain('data-slot="badge"')
	})
})
