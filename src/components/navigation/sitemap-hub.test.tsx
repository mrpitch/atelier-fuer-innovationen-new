import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

const graph = buildContentGraph(path.join(fixturesDir, 'sitemap-hub-valid'))

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { SitemapHub } = await import('./sitemap-hub')

function render() {
	const seite = graph.getSeite('sitemap')
	if (!seite) throw new Error('fixture missing the Sitemap Seite')
	return renderToStaticMarkup(<SitemapHub seite={seite} />)
}

describe('SitemapHub', () => {
	it("renders the Sitemap Seite's own tagline, title and description as the Section Title XL", () => {
		const html = render()

		expect(html).toMatch(/data-slot="tagline"[^>]*>Übersicht</)
		expect(html).toMatch(/<h1[^>]*>Sitemap<\/h1>/)
		expect(html).toContain('Alle Bereiche der Wissensstadt auf einen Blick – mit ihren Adressen.')
	})

	it('shows the Ortsleiste breadcrumb to the Sitemap Seite and the generated, nested Sitemap list beneath it', () => {
		const html = render()

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).toContain('data-slot="sitemap-list"')
		// The embedded list's own column for the fixture's other top-level Seite.
		expect(html).toContain('>Idee<')
	})

	it('renders nothing besides the Seitenkopf and the Sitemap list — no previous/next', () => {
		const html = render()

		expect(html).not.toContain('data-slot="previous-next"')
	})
})
