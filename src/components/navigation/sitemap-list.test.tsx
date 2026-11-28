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

	it('lays out one column per `sitemap` Menu group, headed by the group label in menu order', () => {
		const html = render()

		const headings = (html.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) ?? []).map((heading) =>
			heading.replace(/<[^>]*>/g, ''),
		)
		expect(headings).toEqual(['Entdecken', 'Projekt'])
	})

	it('nests an entry’s own pages under it, as the Sitemap tree nests them', () => {
		const html = render()

		const stadtEntry = html.slice(html.indexOf('>Stadtplan<'))
		expect(stadtEntry).toContain('>Zentrum<')
		expect(stadtEntry).toContain('>Ein Viertel<')
	})

	it('lists the Startseite first in the first column, without its children', () => {
		const html = render()
		const entdecken = html.slice(html.indexOf('>Entdecken<'), html.indexOf('>Projekt<'))

		expect(entdecken.indexOf(' — /<')).toBeGreaterThan(-1)
		expect(entdecken.indexOf(' — /<')).toBeLessThan(entdecken.indexOf('>Stadtplan<'))
		expect(html.match(/href="\/idee"/g)).toHaveLength(1)
	})

	it('places a Kapitel by its own Menu entry, since the Leitthema has no Seite', () => {
		const html = render()
		const entdecken = html.slice(html.indexOf('>Entdecken<'), html.indexOf('>Projekt<'))

		expect(entdecken).toContain('>Ein Kapitel<')
	})

	it('nests a deeper branch — a Kapitel’s own Abschnitt — under that Kapitel, not flattened into its column', () => {
		const html = render()

		const kapitelIndex = html.indexOf('>Ein Kapitel<')
		const abschnittIndex = html.indexOf('>Ein Abschnitt<')
		expect(kapitelIndex).toBeGreaterThan(-1)
		expect(abschnittIndex).toBeGreaterThan(kapitelIndex)

		// The Abschnitt sits in its own nested <ul>, inside the Kapitel's <li>.
		const kapitelLi = html.slice(kapitelIndex, abschnittIndex + '>Ein Abschnitt<'.length)
		expect(kapitelLi).toMatch(/<ul[^>]*>[^<]*<li[^>]*><span><a[^>]*>Ein Abschnitt</)
	})

	it('lists each page as "Titel — /url" in a bulleted list', () => {
		const html = render()

		expect(html).toContain(' — /stadt/zentrum')
		expect(html).toContain('list-disc')
	})

	it('links every Menu-listed page once', () => {
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
