import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Header } from './header'
import { Wortmarke } from './wortmarke'

const pathname = vi.hoisted(() => ({ current: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }))

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('Header', () => {
	it('renders the wortmarke and marks the area for the current path, on desktop and mobile', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'header-valid'))
		const menu = graph.getMenu('header')
		const rundgaenge = menu.find((item) => item.label === 'Rundgänge')
		if (!rundgaenge) throw new Error('fixture header Menu is missing Rundgänge')
		pathname.current = `${rundgaenge.url}/station`

		const html = renderToStaticMarkup(
			<Header
				wortmarke={<Wortmarke site={graph.site} homeUrl={graph.navigation.url} />}
				menu={menu}
			/>,
		)

		expect(html).toContain('data-slot="header"')
		expect(html).toContain('data-slot="mobile-header"')
		expect(html.match(/data-slot="wortmarke"/g)).toHaveLength(2)
		// One marked entry in the desktop menu and one in the mobile panel.
		expect(html.match(/aria-current="page"/g)).toHaveLength(2)
	})

	it('marks nothing on the Startseite', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'header-valid'))
		pathname.current = '/'

		const html = renderToStaticMarkup(
			<Header
				wortmarke={<Wortmarke site={graph.site} homeUrl={graph.navigation.url} />}
				menu={graph.getMenu('header')}
			/>,
		)

		expect(html).not.toContain('aria-current="page"')
	})
})
