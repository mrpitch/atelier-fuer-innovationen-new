import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { MobileHeader } from './mobile-header'
import { Wortmarke } from './wortmarke'

const pathname = vi.hoisted(() => ({ current: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }))

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('MobileHeader', () => {
	it('lists every header Menu entry in the panel and marks only the current area', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'header-valid'))
		const menu = graph.getMenu('header')
		const rundgaenge = menu.find((item) => item.label === 'Rundgänge')
		if (!rundgaenge) throw new Error('fixture header Menu is missing Rundgänge')

		pathname.current = rundgaenge.url
		const html = renderToStaticMarkup(
			<MobileHeader
				wortmarke={<Wortmarke site={graph.site} homeUrl={graph.navigation.url} />}
				menu={menu}
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
		pathname.current = '/'
		const html = renderToStaticMarkup(
			<MobileHeader
				wortmarke={<Wortmarke site={graph.site} homeUrl={graph.navigation.url} />}
				menu={graph.getMenu('header')}
			/>,
		)

		expect(html).toContain('aria-expanded="false"')
		expect(html).toMatch(/<div[^>]*hidden=""/)
	})
})
