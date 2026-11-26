import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { RundgangLeiste } from './rundgang-leiste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-station-valid'))

const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
if (!rundgang) throw new Error('fixture missing rundgaenge/besuch-im-zentrum')
const station = graph.getStation('rundgaenge/besuch-im-zentrum/im-ersten-viertel')
if (!station) throw new Error('fixture missing the Station')
const hub = graph.getSeite('rundgaenge')
if (!hub) throw new Error('fixture missing the Rundgänge-Hub Seite')

describe('RundgangLeiste', () => {
	it("shows the Rundgang and the current Station's position and remaining time", () => {
		const html = renderToStaticMarkup(<RundgangLeiste rundgang={rundgang} station={station} />)

		expect(html).toContain('data-slot="rundgang-leiste"')
		expect(html).toContain(rundgang.title)
		expect(html).toContain(`Station ${station.number} von ${station.lastNumber}`)
		expect(html).toContain(`ca. ${station.remainingMinutes} Min.`)
	})

	it('links "Route" to the Rundgang-Übersicht\'s "Die Route" section and "Rundgang beenden" to the Rundgänge-Hub', () => {
		const html = renderToStaticMarkup(<RundgangLeiste rundgang={rundgang} station={station} />)

		expect(html).toContain(`href="${rundgang.url}#route"`)
		expect(html).toContain(`href="${hub.url}"`)
		expect(hub.url).not.toBe(rundgang.url)
		expect(html).toContain('Rundgang beenden')
	})

	it("fills the Fortschritt to the current Station's own number", () => {
		const html = renderToStaticMarkup(<RundgangLeiste rundgang={rundgang} station={station} />)

		expect(html.match(/data-slot="rundgang-fortschritt"/g)).toHaveLength(1)
		expect(html.match(/bg-primary/g)).toHaveLength(station.number)
	})
})
