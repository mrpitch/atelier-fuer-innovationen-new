import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { resolveOrt } from './gangarten'
import { StationsBuehne } from './stations-buehne'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'stations-buehne-valid'))

function render(stationId: string) {
	const station = graph.getStation(stationId)
	if (!station) throw new Error(`fixture content has no ${stationId}`)
	const rundgang = graph.getRundgang(station.rundgangId)
	if (!rundgang) throw new Error(`fixture content has no Rundgang for ${stationId}`)
	const ort = resolveOrt(graph, station.ortId)

	return renderToStaticMarkup(
		<StationsBuehne
			station={station}
			rundgang={rundgang}
			ort={ort}
			viertel={graph.viertel}
			zentrum={graph.zentrum}
		/>,
	)
}

describe('StationsBuehne', () => {
	it('names the Ort, shows its illustration and places it "aktuell" on the Mini-Stadtplan, with the Station\'s own lage', () => {
		const html = render('rundgaenge/besuch-im-zentrum/station-mit-lage')

		expect(html).toContain('data-slot="stations-buehne"')
		expect(html).toContain('VIERTEL 01')
		expect(html).toContain('Station 01')
		expect(html).toContain('data-slot="illustration-kontexte"')
		expect(html).toContain('data-slot="mini-stadtplan"')
		expect(html).toContain('data-status="aktuell"')
		expect(html).toContain('Sie sind hier')
		expect(html).toContain('Nordöstlich des Stadtplatzes.')
	})

	it('names the Zentrum instead of a Viertel number for a Station at the Zentrum', () => {
		const html = render('rundgaenge/besuch-im-zentrum/station-am-zentrum')

		expect(html).toContain('ZENTRUM')
		expect(html).toContain('data-slot="mini-stadtplan"')
	})

	it('omits "Sie sind hier" when the Station at an Ort has no lage', () => {
		const html = render('rundgaenge/besuch-im-zentrum/station-ohne-lage')

		expect(html).toContain('data-slot="mini-stadtplan"')
		expect(html).not.toContain('Sie sind hier')
	})

	it('shows the Rundgang illustration, the lage text and no Mini-Stadtplan or Ort label for a Station without an Ort', () => {
		const html = render('rundgaenge/besuch-im-zentrum/station-ohne-ort-mit-lage')

		expect(html).not.toContain('data-slot="mini-stadtplan"')
		expect(html).not.toContain('VIERTEL')
		expect(html).not.toContain('ZENTRUM')
		expect(html).toContain('data-slot="illustration-besuch-im-zentrum"')
		expect(html).toContain('Sie sind hier')
		expect(html).toContain('Am Stadtrand, abseits der Viertel.')
	})

	it('shows neither the Mini-Stadtplan, the Ort label nor "Sie sind hier" for a Station without an Ort or a lage', () => {
		const html = render('rundgaenge/besuch-im-zentrum/station-ohne-ort-ohne-lage')

		expect(html).not.toContain('data-slot="mini-stadtplan"')
		expect(html).not.toContain('VIERTEL')
		expect(html).not.toContain('ZENTRUM')
		expect(html).not.toContain('Sie sind hier')
	})
})
