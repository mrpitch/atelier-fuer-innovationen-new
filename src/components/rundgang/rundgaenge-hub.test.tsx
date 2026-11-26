import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'rundgang-eintrag-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { RundgaengeHub } = await import('./rundgaenge-hub')

async function render() {
	const seite = graph.getSeite('')
	if (!seite) throw new Error('fixture missing the root Seite')
	return renderToStaticMarkup(await RundgaengeHub({ seite }))
}

describe('RundgaengeHub', () => {
	it('shows one Rundgang-Eintrag per Rundgang, in meta.json order', async () => {
		const html = await render()

		expect(html.match(/data-slot="rundgang-eintrag"/g)).toHaveLength(2)
		expect(html.indexOf('Testrundgang mit Kennzeichen')).toBeLessThan(
			html.indexOf('Testrundgang ohne Kennzeichen'),
		)
	})

	it("derives the hero eyebrow's Rundgang count from the graph", async () => {
		const html = await render()

		expect(html).toContain(`${graph.rundgaenge.length} FÜHRUNGEN DES STADTFÜHRERS`)
	})

	it('shows "So funktioniert ein Rundgang" with three steps, no "Fortsetzen" section', async () => {
		const html = await render()

		expect(html).toContain('So funktioniert ein Rundgang')
		expect(html.match(/data-slot="feature-section-9"/g)).toHaveLength(1)
		expect(html).not.toContain('Fortsetzen')
	})
})
