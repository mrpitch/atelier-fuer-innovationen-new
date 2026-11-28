import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

const graph = buildContentGraph(path.join(fixturesDir, 'sitemap-list-valid'))

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { SitemapList } = await import('./sitemap-list')

function render() {
	return renderToStaticMarkup(<SitemapList />)
}

describe('SitemapList', () => {
	it('names the whole nav "Sitemap"', () => {
		const html = render()

		expect(html).toMatch(/<nav[^>]*aria-label="Sitemap"/)
	})

	it('lays out one column per top-level Navigation group, each with a heading', () => {
		const html = render()

		expect(html).toMatch(/<h2[^>]*><a[^>]*href="\/idee"[^>]*>Idee<\/a><\/h2>/)
		expect(html).toMatch(/<h2[^>]*><a[^>]*href="\/stadt"[^>]*>Stadtplan<\/a><\/h2>/)
	})

	it('nests a group’s own pages under its column, as the Navigation nests them', () => {
		const html = render()

		const stadtColumn = html.slice(html.indexOf('>Stadtplan<'))
		expect(stadtColumn).toContain('>Zentrum<')
		expect(stadtColumn).toContain('>Ein Viertel<')
	})

	it('nests a deeper branch — a Kapitel’s own Abschnitt — under that Kapitel, not flattened into its column', () => {
		const html = render()

		const kapitelIndex = html.indexOf('>Ein Kapitel<')
		const abschnittIndex = html.indexOf('>Ein Abschnitt<')
		expect(kapitelIndex).toBeGreaterThan(-1)
		expect(abschnittIndex).toBeGreaterThan(kapitelIndex)

		// The Abschnitt sits in its own nested <ul>, inside the Kapitel's <li>.
		const kapitelLi = html.slice(kapitelIndex, abschnittIndex + '>Ein Abschnitt<'.length)
		expect(kapitelLi).toMatch(/<ul[^>]*>[^<]*<li[^>]*>[^<]*<a[^>]*>Ein Abschnitt</)
	})

	it('links every page once, including the Startseite', () => {
		const html = render()
		const kapitel = graph.getKapitel('leitthema/ein-kapitel')
		const abschnitt = graph.getAbschnitt('leitthema/ein-kapitel/ein-abschnitt')
		if (!kapitel || !abschnitt) throw new Error('fixture missing an expected document')

		expect(html.match(/href="\/idee"/g)).toHaveLength(1)
		expect(html).toContain('href="/stadt/zentrum"')
		expect(html).toContain('href="/stadt/ein-viertel"')
		expect(html).toContain(`href="${kapitel.url}"`)
		expect(html).toContain(`href="${abschnitt.url}"`)
	})
})
