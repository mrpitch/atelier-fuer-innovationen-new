import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function graphFor(fixture: string) {
	const fixtureGraph = buildContentGraph(path.join(fixturesDir, fixture))
	// The real getBody resolves MDX through a Vite dynamic import of
	// src/content, which a fixture directory isn't part of; LeitthemaDetail
	// never calls it (its intro is `description`, not the MDX body), but this
	// mirrors the other Thema component tests' own safety net.
	return { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph
}

const validGraph = graphFor('leitthema-detail-valid')
const ohneZitatGraph = graphFor('leitthema-detail-ohne-zitat')

let currentGraph = validGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => currentGraph,
}))

const { LeitthemaDetail } = await import('./leitthema-detail')

async function render(graph: typeof validGraph) {
	currentGraph = graph
	const thema = graph.getThema('themen/eine-welt-fuer-morgen')
	if (!thema) throw new Error('fixture content has no themen/eine-welt-fuer-morgen')
	return renderToStaticMarkup(await LeitthemaDetail({ thema }))
}

describe('LeitthemaDetail', () => {
	it('shows the Ortsleiste breadcrumb with both Themen-Orte as actions', async () => {
		const html = await render(validGraph)
		const netzwerk = validGraph.getThema('themen/netzwerk-der-innovatoren')
		const futursysteme = validGraph.getThema('themen/futursysteme')
		if (!netzwerk || !futursysteme) throw new Error('fixture missing a Themen-Ort')

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).toContain('Themen')
		expect(html).toContain(`href="${netzwerk.url}"`)
		expect(html).toContain(`href="${futursysteme.url}"`)
	})

	it('shows the Bild-Hero eyebrow, title, Leitsatz and intro', async () => {
		const html = await render(validGraph)

		expect(html).toContain('data-slot="bild-hero"')
		expect(html).toContain('LEITTHEMA · 8 KAPITEL IN 8 VIERTELN · 72 ABSCHNITTE')
		expect(html).toContain('Eine Welt für morgen')
		expect(html).toContain('Platzhalter-Leitsatz für Tests.')
		expect(html).toContain('Platzhalter für Tests.')
	})

	it('links "Themen-Weg beginnen" to Kapitel 1', async () => {
		const html = await render(validGraph)
		const kapitelEins = validGraph.getKapitel('leitthema/kapitel-a')
		if (!kapitelEins) throw new Error('fixture missing leitthema/kapitel-a')

		expect(kapitelEins.number).toBe(1)
		expect(html).toContain(`href="${kapitelEins.url}"`)
		expect(html).toContain('Themen-Weg beginnen')
	})

	it('links "Als Rundgang ansehen" to Station 0 of the first Rundgang', async () => {
		const html = await render(validGraph)
		const { zentrum } = validGraph
		if (!zentrum) throw new Error('fixture missing a Zentrum')
		const station = validGraph.getSchauenStation(zentrum.id)
		if (!station) throw new Error('fixture missing a Schauen Station at the Zentrum')

		expect(station.number).toBe(0)
		expect(html).toContain(`href="${station.url}"`)
		expect(html).toContain('Als Rundgang ansehen')
	})

	it('lists the Kapitel in Viertel order, each with its Viertel, Abschnitt count and illustration', async () => {
		const html = await render(validGraph)

		const kapitelA = validGraph.getKapitel('leitthema/kapitel-a')
		const kapitelB = validGraph.getKapitel('leitthema/kapitel-b')
		const kapitelC = validGraph.getKapitel('leitthema/kapitel-c')
		if (!kapitelA || !kapitelB || !kapitelC) throw new Error('fixture missing a Kapitel')

		expect(kapitelA.number).toBe(1)
		expect(kapitelB.number).toBe(2)
		expect(kapitelC.number).toBe(3)

		expect(html).toContain('Kapitel 1 · Kapitel A')
		expect(html).toContain('Viertel 01 · Kontexte · 2 Abschnitte')
		expect(html).toContain('Kapitel 2 · Kapitel B')
		expect(html).toContain('Viertel 02 · Annäherung · 0 Abschnitte')
		expect(html).toContain('Kapitel 3 · Kapitel C')
		expect(html).toContain('Viertel 03 · Inszenierung · 1 Abschnitte')

		// In Viertel/Kapitel number order, not the fixture's own file order
		// (kapitel-a, kapitel-b, kapitel-c already matches it here too, so this
		// also pins down each row's position relative to the others).
		const indexA = html.indexOf('Kapitel 1 · Kapitel A')
		const indexB = html.indexOf('Kapitel 2 · Kapitel B')
		const indexC = html.indexOf('Kapitel 3 · Kapitel C')
		expect(indexA).toBeGreaterThan(-1)
		expect(indexB).toBeGreaterThan(indexA)
		expect(indexC).toBeGreaterThan(indexB)
	})

	it('"Lesen" opens the Kapitel', async () => {
		const html = await render(validGraph)
		const kapitelA = validGraph.getKapitel('leitthema/kapitel-a')
		if (!kapitelA) throw new Error('fixture missing leitthema/kapitel-a')

		expect(html).toContain(`href="${kapitelA.url}"`)
		expect(html).toContain('Lesen')
	})

	it('shows the testimonial when the Leitthema has a Zitat', async () => {
		const html = await render(validGraph)

		expect(html).toContain('data-slot="testimonials-section-1"')
		expect(html).toContain('Platzhalter-Zitat für Tests.')
		expect(html).toContain('Testquelle · Testzusatz')
	})

	it('leaves out the testimonial without a Zitat', async () => {
		const html = await render(ohneZitatGraph)

		expect(html).not.toContain('data-slot="testimonials-section-1"')
	})

	it('shows both Themen-Orte as a Thema-Karte, in branch-Kapitel order', async () => {
		const html = await render(validGraph)

		expect(html.match(/data-slot="thema-karte"/g)).toHaveLength(2)
		expect(html).toContain('Netzwerk der Innovatoren')
		expect(html).toContain('Futursysteme')

		const indexNetzwerk = html.indexOf('Netzwerk der Innovatoren')
		const indexFutursysteme = html.indexOf('Futursysteme')
		expect(indexNetzwerk).toBeGreaterThan(-1)
		expect(indexFutursysteme).toBeGreaterThan(indexNetzwerk)
	})
})
