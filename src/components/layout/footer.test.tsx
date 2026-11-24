import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Footer } from './footer'
import { Wortmarke } from './wortmarke'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function buildFixtureGraph() {
	return buildContentGraph(path.join(fixturesDir, 'footer-valid'))
}

describe('Footer', () => {
	it('renders each group label with its links in order, and the legal row', () => {
		const graph = buildFixtureGraph()
		const groups = graph.getMenu('footer')
		const legalMenu = graph.getMenu('footer-legal')

		const html = renderToStaticMarkup(
			<Footer
				wortmarke={<Wortmarke site={graph.site} homeUrl={graph.navigation.url} />}
				copyright={graph.site.copyright}
				groups={groups}
				legalMenu={legalMenu}
			/>,
		)

		// Group labels, each followed by its own links in Menu order.
		const entdecken = groups.find((group) => group.label === 'Entdecken')
		const lesen = groups.find((group) => group.label === 'Lesen')
		if (!entdecken || !lesen) throw new Error('fixture footer Menu is missing a group')

		const entdeckenIndex = html.indexOf('Entdecken')
		const ideeIndex = html.indexOf(entdecken.links[0].label)
		const ueberIndex = html.indexOf(entdecken.links[1].label)
		const lesenIndex = html.indexOf('Lesen')
		const buchIndex = html.indexOf(lesen.links[0].label)

		expect(entdeckenIndex).toBeGreaterThanOrEqual(0)
		expect(ideeIndex).toBeGreaterThan(entdeckenIndex)
		expect(ueberIndex).toBeGreaterThan(ideeIndex)
		expect(lesenIndex).toBeGreaterThan(ueberIndex)
		expect(buchIndex).toBeGreaterThan(lesenIndex)

		for (const link of [...entdecken.links, ...lesen.links]) {
			expect(html).toContain(`href="${link.url}"`)
		}

		// The legal row, in Menu order, outside the footer-menu groups.
		expect(legalMenu.length).toBeGreaterThan(0)
		let previousIndex = -1
		for (const link of legalMenu) {
			const index = html.indexOf(`href="${link.url}"`)
			expect(index).toBeGreaterThan(previousIndex)
			previousIndex = index
		}

		expect(html).toContain('data-slot="footer-menu-group"')
		expect(html).toContain('data-slot="footer-legal-menu"')
		expect(html).toContain(graph.site.copyright)
	})
})
