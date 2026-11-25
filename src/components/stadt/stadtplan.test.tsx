import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Stadtplan } from './stadtplan'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('Stadtplan', () => {
	it('renders the 8 Viertel and the Zentrum in the reading order 1 2 3 / 8 Z 4 / 7 6 5', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'stadtplan-valid'))

		const html = renderToStaticMarkup(<Stadtplan viertel={graph.viertel} zentrum={graph.zentrum} />)

		const names = [
			'Testviertel Eins',
			'Testviertel Zwei',
			'Testviertel Drei',
			'Testviertel Acht',
			'Testzentrum',
			'Testviertel Vier',
			'Testviertel Sieben',
			'Testviertel Sechs',
			'Testviertel Fuenf',
		]
		const positions = names.map((name) => html.indexOf(name))

		expect(positions.every((position) => position >= 0)).toBe(true)
		expect(positions).toEqual([...positions].sort((a, b) => a - b))
	})

	it("links each tile to its own Ort's page, the Zentrum tile to the Zentrum", () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'stadtplan-valid'))

		const html = renderToStaticMarkup(<Stadtplan viertel={graph.viertel} zentrum={graph.zentrum} />)

		expect(html).toContain('href="/stadt/annaeherung"')
		expect(html).toContain('href="/stadt/zentrum"')
		expect(html).toContain('data-variant="zentrum"')
	})
})
