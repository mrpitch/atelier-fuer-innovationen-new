import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { GangartBox } from './gangart-box'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'gangart-box-valid'))

describe('GangartBox', () => {
	it('names the Rundgang Station and the Viertel, and links to the Station', () => {
		const viertel = graph.getViertel('stadt/testviertel')
		if (!viertel) throw new Error('fixture content has no stadt/testviertel')
		const rundgang = graph.getSchauenRundgang(viertel.id)
		const station = graph.getSchauenStation(viertel.id)
		if (!rundgang || !station) throw new Error('fixture content has no Schauen Rundgang/Station')

		const html = renderToStaticMarkup(
			<GangartBox rundgang={rundgang} station={station} viertel={viertel} />,
		)

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).toContain('GANGART WECHSELN')
		expect(html).toContain(`Station ${station.number} im Rundgang`)
		expect(html).toContain(viertel.title)
		expect(html).toContain(`href="${station.url}"`)
		expect(html).toContain(`Station ${station.number} ansehen`)
		// no bookmark line (issue #100 AC)
		expect(html).not.toContain('Lesezeichen')
	})
})
