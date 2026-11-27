import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Stationsnavigation } from './stationsnavigation'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-station-valid'))

const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
if (!rundgang) throw new Error('fixture missing rundgaenge/besuch-im-zentrum')
const stationen = graph.getStationenByRundgang(rundgang.id)

function stationNamed(title: string) {
	const station = stationen.find((item) => item.title === title)
	if (!station) throw new Error(`fixture missing Station "${title}"`)
	return station
}

describe('Stationsnavigation', () => {
	it('marks every Stopp before the current Station "gesehen", the current one "aktuell" and the rest "offen"', () => {
		const current = stationNamed('Im ersten Viertel')

		const html = renderToStaticMarkup(
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={current} />,
		)

		expect(html.match(/data-status="gesehen"/g)).toHaveLength(1)
		expect(html.match(/data-status="aktuell"/g)).toHaveLength(1)
		expect(html.match(/data-status="offen"/g)).toHaveLength(2)
		expect(html).toContain('aria-current="page"')
	})

	it('renders a Stopp for a Station at an Ort and a Routen-Stopp for one without, including as the current Stopp', () => {
		const current = stationNamed('Ohne Ort Eins')

		const html = renderToStaticMarkup(
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={current} />,
		)

		expect(html.match(/data-slot="stopp"/g)).toHaveLength(2)
		expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(2)
	})

	it('shows the previous and the next Station, each with its own name', () => {
		const current = stationNamed('Im ersten Viertel')
		const previous = stationNamed('Am Zentrum')
		const next = stationNamed('Ohne Ort Eins')

		const html = renderToStaticMarkup(
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={current} />,
		)

		expect(html).toContain(`href="${previous.url}"`)
		expect(html).toContain(previous.title)
		expect(html).toContain(`href="${next.url}"`)
		expect(html).toContain(next.title)
	})

	it('has no previous Station at the start of the Rundgang', () => {
		const current = stationNamed('Am Zentrum')
		const next = stationNamed('Im ersten Viertel')

		const html = renderToStaticMarkup(
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={current} />,
		)

		expect(html.match(/data-slot="item"/g)).toHaveLength(1)
		expect(html).toContain(`href="${next.url}"`)
	})

	it('has no next Station at the end of the Rundgang', () => {
		const current = stationNamed('Ohne Ort Zwei')
		const previous = stationNamed('Ohne Ort Eins')

		const html = renderToStaticMarkup(
			<Stationsnavigation rundgang={rundgang} stationen={stationen} current={current} />,
		)

		expect(html.match(/data-slot="item"/g)).toHaveLength(1)
		expect(html).toContain(`href="${previous.url}"`)
	})
})
