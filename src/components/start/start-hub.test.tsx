import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph, type ContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

let graph: ContentGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { StartHub } = await import('./start-hub')

// Every test picks its own fixture explicitly, rather than relying on
// whatever an earlier test left `graph` set to.
function renderFixture(name: string) {
	graph = buildContentGraph(path.join(fixturesDir, name))
	const seite = graph.getSeite('')
	if (!seite) throw new Error('fixture missing the root Seite')
	return renderToStaticMarkup(<StartHub seite={seite} />)
}

describe('StartHub', () => {
	it('renders the Hero copy and the testimonial, never the MDX body (issue #130)', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('data-slot="hero-section-7"')
		expect(html).toContain('Testtagline der Startseite')
		expect(html).toContain('Testüberschrift der Startseite')
		expect(html).toContain('Testintro der Startseite.')
		expect(html).toContain('data-slot="testimonials-section-1"')
		expect(html).toContain('Ein Zitat für Tests.')
		expect(html).not.toContain('Testinhalt, der nicht gerendert werden darf.')
	})

	it('links the Hero buttons to the first Station of the first Rundgang and the Stadtplan-Hub', () => {
		const html = renderFixture('start-hub-valid')
		const [firstRundgang] = graph.rundgaenge
		if (!firstRundgang) throw new Error('fixture missing a Rundgang')
		const [firstStation] = graph.getStationenByRundgang(firstRundgang.id)
		if (!firstStation) throw new Error('fixture missing a Station')

		expect(html).toContain(`href="${firstStation.url}"`)
		expect(html).toContain('Rundgang starten')
		expect(html).toContain('href="/stadt"')
		expect(html).toContain('Zum Stadtplan')
	})

	it('reuses the Stadt epic’s Stadtplan, whose Zentrum tile opens the Zentrum page', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('data-slot="start-stadtplan-section"')
		expect(html).toContain('data-slot="stadtplan"')
		expect(html).toContain('data-slot="viertel-kachel" data-variant="zentrum"')
		expect(html).toContain('href="/stadt/zentrum"')
	})

	it('renders one Rundgang-Karte per Rundgang, in rundgaenge/meta.json order, under the "Stadtrundgänge" tagline', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('data-slot="start-rundgaenge-section"')
		expect(html).toContain('Stadtrundgänge')
		expect(html.match(/data-slot="rundgang-karte"/g)).toHaveLength(2)
		expect(html.indexOf('>Testrundgang<')).toBeLessThan(html.indexOf('>Zweiter Testrundgang<'))
		expect(html).toContain('>01<')
		expect(html).toContain('>02<')

		const [first, second] = graph.rundgaenge
		if (!first || !second) throw new Error('fixture missing both Rundgänge')
		const [firstStation] = graph.getStationenByRundgang(first.id)
		const [secondStation] = graph.getStationenByRundgang(second.id)
		if (!firstStation || !secondStation) throw new Error('fixture missing a Station')
		expect(html).toContain(`href="${firstStation.url}"`)
		expect(html).toContain(`href="${secondStation.url}"`)
	})

	it('links to the Rundgänge with the dictionary label', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('href="/rundgaenge"')
		expect(html).toContain('Alle Rundgänge →')
	})

	it('shows the Leitthema as a Thema-Karte, Leitthema variant, with the eight — here three — Viertel illustrations in Kapitel order (issue #132)', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('data-slot="thema-karte" data-size="default"')
		expect(html).toMatch(/data-variant="leitthema"/)
		expect(html).toContain('LEITTHEMA · 8 KAPITEL IN 8 VIERTELN')
		expect(html).toContain('Eine Welt für morgen')

		const indexA = html.indexOf('>K1<')
		const indexB = html.indexOf('>K2<')
		const indexC = html.indexOf('>K3<')
		expect(indexA).toBeGreaterThan(-1)
		expect(indexB).toBeGreaterThan(indexA)
		expect(indexC).toBeGreaterThan(indexB)
	})

	it('"Themen-Weg beginnen" opens Kapitel 1; "Als Rundgang ansehen" opens Station 0 of the first Rundgang', () => {
		const html = renderFixture('start-hub-valid')
		const kapitelEins = graph.getKapitel('leitthema/kapitel-a')
		const { zentrum } = graph
		if (!kapitelEins) throw new Error('fixture missing leitthema/kapitel-a')
		if (!zentrum) throw new Error('fixture missing a Zentrum')
		const station = graph.getSchauenStation(zentrum.id)
		if (!station) throw new Error('fixture missing a Schauen Station at the Zentrum')

		expect(kapitelEins.number).toBe(1)
		expect(station.number).toBe(0)
		expect(html).toContain(`href="${kapitelEins.url}"`)
		expect(html).toContain('Themen-Weg beginnen')
		expect(html).toContain(`href="${station.url}"`)
		expect(html).toContain('Als Rundgang ansehen')
	})

	it('shows both Themen-Orte as a Thema-Karte, Themen-Ort variant, each opening its own Viertel', () => {
		const html = renderFixture('start-hub-valid')
		const netzwerk = graph.getThema('themen/netzwerk-der-innovatoren')
		const futursysteme = graph.getThema('themen/futursysteme')
		if (!netzwerk?.kapitelId || !futursysteme?.kapitelId)
			throw new Error('fixture missing a Themen-Ort')
		const netzwerkKapitel = graph.getKapitel(netzwerk.kapitelId)
		const futursystemeKapitel = graph.getKapitel(futursysteme.kapitelId)
		if (!netzwerkKapitel || !futursystemeKapitel) throw new Error('fixture missing a Kapitel')
		const netzwerkViertel = graph.getViertelOfKapitel(netzwerkKapitel)
		const futursystemeViertel = graph.getViertelOfKapitel(futursystemeKapitel)

		expect(html.match(/data-slot="thema-karte" data-size="default"/g)).toHaveLength(3)
		expect(html.match(/data-variant="themen-ort"/g)).toHaveLength(2)
		expect(html).toContain('Netzwerk der Innovatoren')
		expect(html).toContain('Futursysteme')
		expect(html).toContain(`href="${netzwerkViertel.url}"`)
		expect(html).toContain(`href="${futursystemeViertel.url}"`)
		expect(html).toContain(`Ins Viertel der ${netzwerkViertel.title}`)
		expect(html).toContain(`Ins Viertel der ${futursystemeViertel.title}`)
	})

	it('leaves out the Drei Themen section without a Leitthema', () => {
		const html = renderFixture('start-hub-empty')

		expect(html).not.toContain('data-slot="start-themen-section"')
	})

	it('leaves out the tagline, intro, testimonial and Rundgang-starten button a document never sets, falling back to the title for the heading (issue #130)', () => {
		const html = renderFixture('start-hub-empty')
		const heroMatch = /<section data-slot="hero-section-7"[^]*?<\/section>/.exec(html)
		if (!heroMatch) throw new Error('Hero section missing from the render')
		const hero = heroMatch[0]

		expect(hero).not.toContain('data-slot="tagline"')
		expect(hero).toContain('<h1')
		expect(hero).toContain('Start</h1>')
		expect(html).not.toContain('data-slot="testimonials-section-1"')
		expect(html).not.toContain('Rundgang starten')
		expect(html).toContain('href="/stadt"')
	})
})
