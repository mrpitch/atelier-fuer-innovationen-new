import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'themen-ort-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { ThemaDetail } = await import('./thema-detail')

async function render(themaId: string) {
	const thema = graph.getThema(themaId)
	if (!thema) throw new Error(`fixture content has no ${themaId}`)
	return renderToStaticMarkup(await ThemaDetail({ thema }))
}

// ThemenOrtDetail's own content is covered by themen-ort-detail.test.tsx;
// this only tests ThemaDetail's own job, deciding which of the two to render.
describe('ThemaDetail', () => {
	it('keeps the bare rendering for the Leitthema', async () => {
		const html = await render('themen/eine-welt-fuer-morgen')

		expect(html).toContain('data-slot="thema-detail"')
		expect(html).not.toContain('data-slot="themen-ort-detail"')
	})

	it('delegates a Themen-Ort to ThemenOrtDetail', async () => {
		const html = await render('themen/futursysteme')

		expect(html).toContain('data-slot="themen-ort-detail"')
		expect(html).not.toContain('data-slot="thema-detail"')
	})
})
