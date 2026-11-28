import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { RundgangKarte } from './rundgang-karte'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-karte-valid'))

function render(rundgangId: string) {
	const rundgang = graph.getRundgang(rundgangId)
	if (!rundgang) throw new Error(`fixture content has no ${rundgangId}`)
	const stationen = graph.getStationenByRundgang(rundgang.id)
	return renderToStaticMarkup(<RundgangKarte rundgang={rundgang} stationen={stationen} />)
}

describe('RundgangKarte', () => {
	it('shows the number, title, Stationen count, duration and route', () => {
		const rundgang = graph.getRundgang('rundgaenge/mit-route')
		if (!rundgang) throw new Error('fixture missing rundgaenge/mit-route')

		const html = render('rundgaenge/mit-route')

		expect(html).toContain('data-slot="rundgang-karte"')
		expect(html).toContain('01')
		expect(html).toContain('Testrundgang mit Route')
		expect(html).toContain(`${rundgang.stationenCount} Stationen`)
		expect(html).toContain(`${rundgang.durationMinutes} Min.`)
		expect(html).toContain('Zentrum → Erste Viertel')
	})

	it('reads "1 Station", not "1 Stationen", for a Rundgang with a single Station', () => {
		const html = render('rundgaenge/einzelne-station')

		expect(html).toContain('1 Station')
		expect(html).not.toContain('1 Stationen')
	})

	it('omits the route line for a Rundgang whose Stationen stand at no Ort at all', () => {
		const html = render('rundgaenge/einzelne-station')

		expect(html).not.toContain('→')
	})

	it('opens the Rundgang\'s first Station with "Rundgang starten"', () => {
		const rundgang = graph.getRundgang('rundgaenge/mit-route')
		if (!rundgang) throw new Error('fixture missing rundgaenge/mit-route')
		const [firstStation] = graph.getStationenByRundgang(rundgang.id)
		if (!firstStation) throw new Error('fixture missing a Station')

		const html = render('rundgaenge/mit-route')

		expect(html).toContain(`href="${firstStation.url}"`)
		expect(html).toContain('Rundgang starten')
	})
})
