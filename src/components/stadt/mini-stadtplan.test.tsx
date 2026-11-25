import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { MiniStadtplan } from './mini-stadtplan'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('MiniStadtplan', () => {
	it('marks only the current Viertel "aktuell" and every other Plan-Feld, the Zentrum included, "offen"', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'stadtplan-valid'))
		const aktuell = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
		if (!aktuell) throw new Error('fixture missing stadt/kontexte')

		const html = renderToStaticMarkup(
			<MiniStadtplan viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={aktuell.id} />,
		)

		expect(html.match(/data-status="aktuell"/g)).toHaveLength(1)
		expect(html.match(/data-status="offen"/g)).toHaveLength(8)
	})

	it('is hidden from assistive tech, since the Items beside it carry the real links', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'stadtplan-valid'))
		const aktuell = graph.viertel[0]
		if (!aktuell) throw new Error('fixture missing a Viertel')

		const html = renderToStaticMarkup(
			<MiniStadtplan viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={aktuell.id} />,
		)

		expect(html).toContain('aria-hidden="true"')
	})
})
