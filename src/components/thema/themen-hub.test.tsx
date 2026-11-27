import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function graphFor(fixture: string) {
	const fixtureGraph = buildContentGraph(path.join(fixturesDir, fixture))
	// The real getBody resolves MDX through a Vite dynamic import of
	// src/content, which a fixture directory isn't part of; the introduction
	// body itself isn't under test here (prior art: rundgaenge-hub.test.tsx).
	return { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph
}

const graph = graphFor('themen-hub-valid')

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { ThemenHub } = await import('./themen-hub')

async function render() {
	const seite = graph.getSeite('themen')
	if (!seite) throw new Error('fixture missing the Themen Seite')
	return renderToStaticMarkup(await ThemenHub({ seite }))
}

describe('ThemenHub', () => {
	it('shows one Thema-Kachel per Thema, the Leitthema first, then the Themen-Orte in branch-Kapitel order', async () => {
		const html = await render()

		expect(html.match(/data-slot="thema-kachel"/g)).toHaveLength(3)
		expect(html).toContain('data-typ="leitthema"')
		expect(html.match(/data-typ="themen-ort"/g)).toHaveLength(2)

		const indexLeitthema = html.indexOf('Eine Welt für morgen')
		const indexNetzwerk = html.indexOf('Netzwerk der Innovatoren')
		const indexFutursysteme = html.indexOf('Futursysteme')
		expect(indexLeitthema).toBeGreaterThan(-1)
		expect(indexNetzwerk).toBeGreaterThan(indexLeitthema)
		expect(indexFutursysteme).toBeGreaterThan(indexNetzwerk)
	})

	it('switches only the Leitthema tile to a row layout at 768, not the Themen-Ort tiles', async () => {
		const html = await render()

		const leitthemaTile = html.slice(
			html.indexOf('data-typ="leitthema"'),
			html.indexOf('data-typ="themen-ort"'),
		)
		expect(leitthemaTile).toContain('md:flex-row')

		const themenOrtTiles = html.slice(html.indexOf('data-typ="themen-ort"'))
		expect(themenOrtTiles).not.toContain('md:flex-row')
	})

	it("derives the eyebrow's Leitthema (.one) and Themen-Ort (.other) counts from the graph", async () => {
		const html = await render()

		expect(html).toContain('THEMEN · 1 LEITTHEMA · 2 THEMEN-ORTE')
	})

	it('derives each label and meta line from the graph, not hand-typed', async () => {
		const html = await render()

		const kapitelA = graph.getKapitel('leitthema/kapitel-a')
		const kapitelC = graph.getKapitel('leitthema/kapitel-c')
		if (!kapitelA || !kapitelC) throw new Error('fixture missing a Kapitel')
		expect(kapitelA.number).toBe(1)
		expect(kapitelC.number).toBe(3)

		expect(html).toContain('LEITTHEMA · K1–K3')
		expect(html).toContain('3 Kapitel in 3 Vierteln · 3 Abschnitte')
		expect(html).toContain('THEMEN-ORT · VIERTEL 01')
		expect(html).toContain('Zweigt bei Kapitel 1 ab')
		expect(html).toContain('THEMEN-ORT · VIERTEL 03')
		expect(html).toContain('Zweigt bei Kapitel 3 ab')
	})

	it('links "Themen-Weg beginnen" to Kapitel 1, each Themen-Ort action to its own Thema page, and the Hinweis to the Rundgänge-Hub', async () => {
		const html = await render()

		const kapitelEins = graph.getKapitel('leitthema/kapitel-a')
		const netzwerk = graph.getThema('themen/netzwerk-der-innovatoren')
		const futursysteme = graph.getThema('themen/futursysteme')
		const rundgaengeHub = graph.getSeite('rundgaenge')
		if (!kapitelEins || !netzwerk || !futursysteme || !rundgaengeHub) {
			throw new Error('fixture missing an expected document')
		}

		expect(html).toContain(`href="${kapitelEins.url}"`)
		expect(html).toContain('Themen-Weg beginnen')
		expect(html).toContain(`href="${netzwerk.url}"`)
		expect(html).toContain('Netzwerk der Innovatoren öffnen')
		expect(html).toContain(`href="${futursysteme.url}"`)
		expect(html).toContain('Futursysteme öffnen')
		expect(html).toContain(`href="${rundgaengeHub.url}"`)
		expect(html).toContain('Zu den Rundgängen')
	})

	it('shows the Teaser on a tile that has one and omits it on a tile without one', async () => {
		const html = await render()

		expect(html).toContain('Teaser des Leitthemas für Tests.')
		expect(html).toContain('Teaser von Futursysteme für Tests.')

		// Netzwerk der Innovatoren (no teaser) renders first among the two
		// Themen-Orte (branch-Kapitel order); isolate its own tile markup so
		// Futursysteme's Teaser just after it can't produce a false pass.
		const firstThemenOrt = html.indexOf('data-typ="themen-ort"')
		const secondThemenOrt = html.indexOf('data-typ="themen-ort"', firstThemenOrt + 1)
		const netzwerkTile = html.slice(firstThemenOrt, secondThemenOrt)
		expect(netzwerkTile).toContain('Netzwerk der Innovatoren')
		expect(netzwerkTile).not.toContain('Teaser')
	})

	it('names the Triptychon nav "Die drei Themen" and renders the tiles as a list', async () => {
		const html = await render()
		const triptychon = html.slice(html.indexOf('data-slot="themen-triptychon"'))

		expect(triptychon.slice(0, 200)).toContain('aria-label="Die drei Themen"')
		expect(triptychon).toContain('<ol')
		expect(triptychon.match(/<li/g)).toHaveLength(3)
	})

	it('shows the Ortsleiste with the Themen breadcrumb and its Seite neighbours', async () => {
		const html = await render()

		const vorherige = graph.getSeite('vorherige-seite')
		const naechste = graph.getSeite('naechste-seite')
		if (!vorherige || !naechste) throw new Error('fixture missing a sibling Seite')

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).toContain(`href="${vorherige.url}"`)
		expect(html).toContain(`href="${naechste.url}"`)
	})
})
