import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { asFlatMenu, buildContentGraph } from '@/lib/content'

import { MobileHeader } from './mobile-header'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('MobileHeader', () => {
	it('lists every header Menu entry in the panel and marks only the current area', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'header-valid'))
		const menu = asFlatMenu(graph.getMenu('header'))
		const rundgaenge = menu.find((item) => item.label === 'Rundgänge')
		if (!rundgaenge) throw new Error('fixture header Menu is missing Rundgänge')

		const html = renderToStaticMarkup(
			<MobileHeader
				site={graph.site}
				homeUrl={graph.navigation.url}
				menu={menu}
				currentPath={rundgaenge.url}
			/>,
		)

		for (const item of menu) expect(html).toContain(`href="${item.url}"`)
		expect(html.match(/aria-current="page"/g)).toHaveLength(1)
		expect(html.match(new RegExp(`<a[^>]*href="${rundgaenge.url}"[^>]*>`))?.[0]).toContain(
			'aria-current="page"',
		)
	})

	it('starts with the panel closed', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'header-valid'))
		const html = renderToStaticMarkup(
			<MobileHeader
				site={graph.site}
				homeUrl={graph.navigation.url}
				menu={asFlatMenu(graph.getMenu('header'))}
				currentPath="/"
			/>,
		)

		expect(html).toContain('aria-expanded="false"')
		expect(html).toMatch(/<div[^>]*hidden=""/)
	})
})
