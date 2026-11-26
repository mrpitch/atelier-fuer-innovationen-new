import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'zentrum-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
function withBody(g: typeof fixtureGraph) {
	return { ...g, getBody: async () => () => null } as typeof fixtureGraph
}
const graph = withBody(fixtureGraph)
// A Zentrum no Rundgang visits and without a Leitthema: no Gangart-Karte.
const graphOhneGangarten = withBody(
	buildContentGraph(path.join(fixturesDir, 'zentrum-ohne-leitthema')),
)
let current = graph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => current,
}))

const { ZentrumDetail } = await import('./zentrum-detail')

describe('ZentrumDetail', () => {
	it('renders the Bild-Hero with the Zentrum title, the Stadtplatz illustration, no badge and no Kapitel button', async () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')
		const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: graph.zentrum }))
		const heroEnd = html.indexOf('</section>')
		const hero = html.slice(html.indexOf('<section data-slot="bild-hero"'), heroEnd)

		expect(hero).toContain('Testzentrum')
		expect(hero).toContain('data-slot="illustration-zentrum"')
		expect(hero).not.toContain('data-slot="badge"')
		expect(hero).not.toContain('Kapitel')
	})

	it('puts the Zentrum at Stopp 0 "aktuell" on the Weg-Leiste', async () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')
		const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: graph.zentrum }))

		expect(html).toContain('Sie stehen bei 0')
		expect(html).toContain('aria-current="page"')
	})

	it('shows a Schauen card for Station 0 and a Lesen card linking "Einführung" to the Leitthema', async () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')
		const station = graph.getStation('rundgaenge/rundgang-a/station-zentrum')
		const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: graph.zentrum }))

		expect(html).toContain(`href="${station?.url}"`)
		expect(html).toContain('Einführung')
		expect(html).toContain(`href="${graph.leitthema?.url}"`)
	})

	it('marks Plan-Feld 0 "aktuell" on the Mini-Stadtplan, with Items to the first and last Viertel', async () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')
		const [erste] = graph.viertel
		const letzte = graph.viertel.at(-1)
		if (!erste || !letzte) throw new Error('fixture missing a Viertel')
		const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: graph.zentrum }))

		expect(html).toContain(`href="${erste.url}"`)
		expect(html).toContain(`href="${letzte.url}"`)
	})

	it('has no Steckbrief and no "Mehr aus dem Viertel" section', async () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')
		const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: graph.zentrum }))

		expect(html).not.toContain('data-slot="steckbrief-section"')
		expect(html).not.toContain('Mehr aus dem Viertel')
	})

	it('keeps the Weg-Leiste and the Wege anchor when neither Gangart-Karte exists', async () => {
		current = graphOhneGangarten
		try {
			if (!current.zentrum) throw new Error('fixture missing the Zentrum')
			const html = renderToStaticMarkup(await ZentrumDetail({ zentrum: current.zentrum }))

			expect(html).toContain('data-slot="weg-leiste"')
			expect(html).toContain('id="wege-vom-zentrum-aus"')
			expect(html).toContain('href="#wege-vom-zentrum-aus"')
			expect(html).not.toContain('data-slot="gangart-karte"')
		} finally {
			current = graph
		}
	})
})
