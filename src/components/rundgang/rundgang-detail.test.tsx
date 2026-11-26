import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'rundgang-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { RundgangDetail } = await import('./rundgang-detail')

async function render(rundgangId: string) {
	const rundgang = graph.getRundgang(rundgangId)
	if (!rundgang) throw new Error(`fixture content has no ${rundgangId}`)
	return renderToStaticMarkup(await RundgangDetail({ rundgang }))
}

describe('RundgangDetail', () => {
	it('renders a Stopp for a Station at an Ort, its Thema and its next Rundgang in "Nach dem Rundgang"', async () => {
		const html = await render('rundgaenge/besuch-im-zentrum')

		expect(html).toContain('data-slot="rundgang-detail"')
		expect(html).toContain('data-slot="bild-hero"')
		expect(html.match(/data-slot="stopp"/g)).toHaveLength(1)
		expect(html).not.toContain('data-slot="routen-stopp"')
		expect(html).toContain('Besuch im Zentrum')
		expect(html).toContain('Platzhalter-Leitsatz')
		expect(html).toContain('Eine Welt für morgen')
		expect(html).toContain('Erste Annäherung')
		expect(html).toContain('Hier einsteigen')
	})

	it('renders a Routen-Stopp for a Station without an Ort, and omits the next Rundgang and the Thema when unset', async () => {
		const html = await render('rundgaenge/erste-annaeherung')

		expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(1)
		expect(html).not.toContain('data-slot="stopp"')
		expect(html).not.toContain('Nach dem Rundgang')
	})

	it('links the "Rundgang starten" action to the first Station', async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
		if (!rundgang) throw new Error('fixture missing rundgaenge/besuch-im-zentrum')
		const [firstStation] = graph.getStationenByRundgang(rundgang.id)
		if (!firstStation) throw new Error('fixture missing a Station')

		const html = await render('rundgaenge/besuch-im-zentrum')

		expect(html).toContain(`href="${firstStation.url}"`)
	})

	it('shows each Station\'s two-digit number and reading time in "Stationen im Detail"', async () => {
		const html = await render('rundgaenge/besuch-im-zentrum')
		const section = html.slice(html.indexOf('data-slot="stationen-section"'))

		expect(section).toContain('>00<')
		expect(section).toContain('ca. 1 Min.')
	})
})
