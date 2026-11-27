import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// The real `src/content` Stationen (issue #116's placeholder content), not a
// fixture: the acceptance criterion names Besuch im Zentrum's own ends by
// their own route shape, so it's this content the test exercises (Testing
// conventions' own precedent: illustration.test.tsx, rundgang-detail's own
// real-content test). `getBody` is still stubbed — Vitest's dynamic import
// can't resolve a multi-segment id like a Next/Turbopack build can.
vi.mock('@/lib/content', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/content')>()
	const realGraph = actual.contentGraph()
	const graph = { ...realGraph, getBody: async () => () => null }
	return { ...actual, contentGraph: () => graph }
})

const { contentGraph } = await import('@/lib/content')
const { StationDetail } = await import('./station-detail')

const graph = contentGraph()

describe('StationDetail against the real content graph (issue #120)', () => {
	it('has no previous Station at Station 0 of Besuch im Zentrum', async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
		if (!rundgang) throw new Error('missing rundgaenge/besuch-im-zentrum')
		const [first] = graph.getStationenByRundgang(rundgang.id)
		if (!first) throw new Error('missing the first Station')
		expect(first.number).toBe(0)

		const html = renderToStaticMarkup(await StationDetail({ station: first }))
		const nav = html.slice(html.indexOf('data-slot="stationsnavigation"'))

		expect(nav.match(/data-slot="item"/g)).toHaveLength(1)
	})

	it('has no next Station at Station 8 of Besuch im Zentrum', async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
		if (!rundgang) throw new Error('missing rundgaenge/besuch-im-zentrum')
		const stationen = graph.getStationenByRundgang(rundgang.id)
		const last = stationen[stationen.length - 1]
		if (!last) throw new Error('missing the last Station')
		expect(last.number).toBe(8)
		expect(last.lastNumber).toBe(8)

		const html = renderToStaticMarkup(await StationDetail({ station: last }))
		const nav = html.slice(html.indexOf('data-slot="stationsnavigation"'))

		expect(nav.match(/data-slot="item"/g)).toHaveLength(1)
	})

	it('derives "Station n von N" and the remaining time from the content graph', async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
		if (!rundgang) throw new Error('missing rundgaenge/besuch-im-zentrum')
		const station = graph.getStation('rundgaenge/besuch-im-zentrum/kontexte')
		if (!station) throw new Error('missing rundgaenge/besuch-im-zentrum/kontexte')

		const html = renderToStaticMarkup(await StationDetail({ station }))

		expect(html).toContain(`Station ${station.number} von ${station.lastNumber}`)
		expect(html).toContain(`ca. ${station.remainingMinutes} Min.`)
	})

	it('shows the Stations-Bühne with its Mini-Stadtplan, Gangart item and Viertel link for a Besuch im Zentrum Station (issue #121)', async () => {
		const station = graph.getStation('rundgaenge/besuch-im-zentrum/kontexte')
		if (!station) throw new Error('missing rundgaenge/besuch-im-zentrum/kontexte')
		if (station.ortId === undefined) throw new Error('fixture expectation: this Station has an Ort')

		const html = renderToStaticMarkup(await StationDetail({ station }))

		expect(html).toContain('data-slot="stations-buehne"')
		expect(html).toContain('data-slot="mini-stadtplan"')
		expect(html).toContain('Gangart wechseln')
		expect(html).toContain('frei erkunden')
	})

	it('shows only the Rundgang illustration, no Ort parts, for Erste Annäherung and Besuch in der Umgebung Stationen (issue #121)', async () => {
		for (const rundgangId of [
			'rundgaenge/erste-annaeherung',
			'rundgaenge/besuch-in-der-umgebung',
		]) {
			const rundgang = graph.getRundgang(rundgangId)
			if (!rundgang) throw new Error(`missing ${rundgangId}`)

			for (const station of graph.getStationenByRundgang(rundgang.id)) {
				if (station.ortId !== undefined) {
					throw new Error(`fixture expectation: ${station.id} has no Ort`)
				}

				const html = renderToStaticMarkup(await StationDetail({ station }))

				expect(html).not.toContain('data-slot="mini-stadtplan"')
				expect(html).not.toContain('Gangart wechseln')
				expect(html).not.toContain('frei erkunden')
			}
		}
	})
})
