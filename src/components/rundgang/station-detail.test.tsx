import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'station-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { StationDetail } = await import('./station-detail')

async function render(stationId: string) {
	const station = graph.getStation(stationId)
	if (!station) throw new Error(`fixture content has no ${stationId}`)
	return renderToStaticMarkup(await StationDetail({ station }))
}

describe('StationDetail', () => {
	it('renders the Rundgang-Leiste, the Stadtführer text and the Stationsnavigation', async () => {
		const html = await render('rundgaenge/besuch-im-zentrum/im-ersten-viertel')

		expect(html).toContain('data-slot="station-detail"')
		expect(html).toContain('data-slot="rundgang-leiste"')
		expect(html).toContain('data-slot="stationsnavigation"')
		expect(html).toContain('Im ersten Viertel')
		expect(html).toContain('aus dem Stadtführer')
	})

	it('marks the Stopps before, at and after the current Station "gesehen", "aktuell" and "offen"', async () => {
		const html = await render('rundgaenge/besuch-im-zentrum/im-ersten-viertel')
		const nav = html.slice(html.indexOf('data-slot="stationsnavigation"'))

		expect(nav.match(/data-status="gesehen"/g)).toHaveLength(1)
		expect(nav.match(/data-status="aktuell"/g)).toHaveLength(1)
		expect(nav.match(/data-status="offen"/g)).toHaveLength(2)
	})

	it('shows a Stopp for a Station at an Ort and a Routen-Stopp for one without', async () => {
		const html = await render('rundgaenge/besuch-im-zentrum/ohne-ort-eins')
		const nav = html.slice(html.indexOf('data-slot="stationsnavigation"'))

		expect(nav.match(/data-slot="stopp"/g)).toHaveLength(2)
		expect(nav.match(/data-slot="routen-stopp"/g)).toHaveLength(2)
	})

	it('has no previous Station at the start of the Rundgang and no next at its end', async () => {
		const first = await render('rundgaenge/besuch-im-zentrum/am-zentrum')
		const last = await render('rundgaenge/besuch-im-zentrum/ohne-ort-zwei')

		expect(
			first.slice(first.indexOf('data-slot="stationsnavigation"')).match(/data-slot="item"/g),
		).toHaveLength(1)
		expect(
			last.slice(last.indexOf('data-slot="stationsnavigation"')).match(/data-slot="item"/g),
		).toHaveLength(1)
	})
})
