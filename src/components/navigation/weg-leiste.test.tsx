import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { WegLeiste } from './weg-leiste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('WegLeiste', () => {
	it('marks only the current place "aktuell" and every other Stopp, the Zentrum included, "offen"', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		const aktuell = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
		if (!aktuell) throw new Error('fixture missing stadt/kontexte')

		const html = renderToStaticMarkup(
			<WegLeiste
				viertel={graph.viertel}
				zentrum={graph.zentrum}
				aktuellId={aktuell.id}
				aktuellNummer={aktuell.number}
			/>,
		)

		expect(html.match(/data-status="aktuell"/g)).toHaveLength(1)
		expect(html.match(/data-status="offen"/g)).toHaveLength(2)
		expect(html).toContain('aria-current="page"')
	})

	it('links every Stopp to its own place', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		const aktuell = graph.viertel[0]
		if (!aktuell || !graph.zentrum) throw new Error('fixture missing a Viertel or the Zentrum')

		const html = renderToStaticMarkup(
			<WegLeiste
				viertel={graph.viertel}
				zentrum={graph.zentrum}
				aktuellId={aktuell.id}
				aktuellNummer={aktuell.number}
			/>,
		)

		expect(html).toContain(`href="${graph.zentrum.url}"`)
		for (const viertel of graph.viertel) {
			expect(html).toContain(`href="${viertel.url}"`)
		}
	})
})
