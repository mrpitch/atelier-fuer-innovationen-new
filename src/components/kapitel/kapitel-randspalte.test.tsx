import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { KapitelRandspalte } from './kapitel-randspalte'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'kapitel-randspalte-valid'))

function renderFor(viertelId: string) {
	const viertel = graph.getViertel(viertelId)
	if (!viertel) throw new Error(`fixture content has no ${viertelId}`)
	return renderToStaticMarkup(<KapitelRandspalte graph={graph} viertel={viertel} />)
}

describe('KapitelRandspalte', () => {
	it('renders the Gangart-Box and "Im Viertel außerdem" for a Viertel that has both', () => {
		const html = renderFor('stadt/mit-rundgang')

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).toContain('IM VIERTEL AUSSERDEM')
	})

	it('drops the Gangart-Box when the Viertel has no Station in a Schauen Rundgang, independent of its Aufsätze', () => {
		// ohne-rundgang has an Aufsatz but no Station, so this proves the
		// Gangart-Box's own drop-out rule, not the Aufsätze section's.
		const html = renderFor('stadt/ohne-rundgang')

		expect(html).not.toContain('data-slot="gangart-box"')
		expect(html).toContain('IM VIERTEL AUSSERDEM')
		expect(html).toContain('Zweiter Aufsatz')
	})

	it('leaves out "Im Viertel außerdem" when the Viertel has no Aufsätze, independent of its Station', () => {
		// ohne-aufsatz has a Station but no Aufsatz, so this proves the
		// Aufsätze section's own drop-out rule, not the Gangart-Box's.
		const html = renderFor('stadt/ohne-aufsatz')

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).not.toContain('IM VIERTEL AUSSERDEM')
	})
})
