import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { asFlatMenu, buildContentGraph } from '@/lib/content'

import { HeaderMenu } from './header-menu'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function buildFixtureGraph() {
	return buildContentGraph(path.join(fixturesDir, 'header-valid'))
}

function headerMenu(graph: ReturnType<typeof buildFixtureGraph>) {
	return asFlatMenu(graph.getMenu('header'))
}

// The <a> for one Menu entry, so a test can check its aria-current without
// assuming attribute order in the rendered markup.
function linkTag(html: string, href: string): string | undefined {
	return html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>`))?.[0]
}

describe('HeaderMenu', () => {
	it('marks the area a nested path belongs to as current, e.g. a Station marks Rundgänge', () => {
		const graph = buildFixtureGraph()
		const menu = headerMenu(graph)
		const station = graph.getStation('rundgaenge/besuch-im-zentrum/station-eins')
		if (!station) throw new Error('fixture is missing its Station')
		const rundgaenge = menu.find((item) => item.label === 'Rundgänge')
		const idee = menu.find((item) => item.label === 'Idee')
		if (!rundgaenge || !idee) throw new Error('fixture header Menu is missing an entry')

		const html = renderToStaticMarkup(<HeaderMenu menu={menu} currentPath={station.url} />)

		expect(linkTag(html, rundgaenge.url)).toContain('aria-current="page"')
		expect(linkTag(html, idee.url)).not.toContain('aria-current')
	})

	it('marks no entry current on the Startseite', () => {
		const graph = buildFixtureGraph()
		const menu = headerMenu(graph)

		const html = renderToStaticMarkup(<HeaderMenu menu={menu} currentPath={graph.navigation.url} />)

		expect(html).not.toContain('aria-current')
	})
})
