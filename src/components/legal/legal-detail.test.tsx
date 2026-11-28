import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'legal-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
function withBody(g: typeof fixtureGraph) {
	return { ...g, getBody: async () => () => null } as typeof fixtureGraph
}
const graph = withBody(fixtureGraph)

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { LegalDetail } = await import('./legal-detail')

function seite(id: string) {
	const found = graph.seiten.find((candidate) => candidate.id === id)
	if (!found) throw new Error(`fixture missing Seite "${id}"`)
	return found
}

describe('LegalDetail', () => {
	it('renders the Ortsleiste with the other footer-legal pages as actions, excluding Impressum itself and any Kontakt link', async () => {
		const html = renderToStaticMarkup(await LegalDetail({ seite: seite('impressum') }))

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).toContain('href="/datenschutz"')
		expect(html).toContain('href="/sitemap"')
		expect(html).not.toContain('href="/impressum"')
		expect(html).not.toContain('Kontakt')
	})

	it('renders the Ortsleiste actions for Datenschutz excluding Datenschutz itself', async () => {
		const html = renderToStaticMarkup(await LegalDetail({ seite: seite('datenschutz') }))

		expect(html).toContain('href="/impressum"')
		expect(html).toContain('href="/sitemap"')
		expect(html).not.toContain('href="/datenschutz"')
	})

	it('renders the Section Title XL with the "Rechtliches" kicker and the Seite title as the page\'s own h1', async () => {
		const html = renderToStaticMarkup(await LegalDetail({ seite: seite('impressum') }))

		expect(html).toContain('data-slot="section-title"')
		expect(html).toContain('Rechtliches')
		expect(html).toContain('<h1')
		expect(html).toContain('>Impressum</h1>')
	})

	it('wraps the MDX body in the Typography Rich Text style', async () => {
		const html = renderToStaticMarkup(await LegalDetail({ seite: seite('impressum') }))

		expect(html).toContain('data-slot="rich-text"')
	})
})
