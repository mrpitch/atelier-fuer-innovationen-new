import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Ortsleiste } from './ortsleiste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function renderFor(id: string) {
	const graph = buildContentGraph(path.join(fixturesDir, 'ortsleiste-valid'))
	return renderToStaticMarkup(
		<Ortsleiste
			breadcrumbs={graph.getBreadcrumbs(id)}
			previous={graph.getPrevious(id)}
			next={graph.getNext(id)}
		/>,
	)
}

describe('Ortsleiste', () => {
	it('renders the breadcrumb trail without the root Seite, and both neighbours for a middle place', () => {
		const html = renderFor('stadt/zweites-viertel')

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).not.toContain('Start')
		expect(html).toContain('Stadtplan')
		expect(html).toContain('href="/stadt"')
		expect(html).toContain('← 01 Erstes')
		expect(html).toContain('href="/stadt/erstes-viertel"')
		expect(html).toContain('03 Drittes →')
		expect(html).toContain('href="/stadt/drittes-viertel"')
	})

	it('renders only the next neighbour for the first place, named by number and Short title', () => {
		const html = renderFor('stadt/erstes-viertel')

		expect(html).not.toContain('←')
		expect(html).toContain('02 Zweites →')
		expect(html).toContain('href="/stadt/zweites-viertel"')
	})

	it('stays stacked up to 1279px and becomes a row at xl (issue #110)', () => {
		const html = renderFor('stadt/zweites-viertel')

		expect(html).toContain('data-switch-at="xl"')
	})

	it('renders only the previous neighbour for the last place', () => {
		const html = renderFor('stadt/drittes-viertel')

		expect(html).not.toContain('→')
		expect(html).toContain('← 02 Zweites')
		expect(html).toContain('href="/stadt/zweites-viertel"')
	})

	it('renders the other footer-legal pages as actions, excluding the current page and any Kontakt link', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'ortsleiste-legal-valid'))
		const actions = graph.getMenu('footer-legal').filter((link) => link.url !== '/impressum')
		const html = renderToStaticMarkup(
			<Ortsleiste breadcrumbs={graph.getBreadcrumbs('impressum')} actions={actions} />,
		)

		expect(html).toContain('Impressum')
		expect(html).toContain('Datenschutz')
		expect(html).toContain('href="/datenschutz"')
		expect(html).toContain('Sitemap')
		expect(html).toContain('href="/sitemap"')
		expect(html).not.toContain('href="/impressum"')
		expect(html).not.toContain('Kontakt')
	})

	it('renders no actions row when the footer-legal menu has no other page', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'ortsleiste-legal-valid'))
		const html = renderToStaticMarkup(
			<Ortsleiste breadcrumbs={graph.getBreadcrumbs('impressum')} actions={[]} />,
		)

		expect(html).not.toContain('Datenschutz')
		expect(html).not.toContain('Sitemap')
	})
})
