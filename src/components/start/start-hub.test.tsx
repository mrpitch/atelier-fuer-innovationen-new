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

	it('links to the Rundgänge and the Themen with the dictionary labels', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('href="/rundgaenge"')
		expect(html).toContain('Alle Rundgänge →')
		expect(html).toContain('href="/themen"')
		expect(html).toContain('Alle Themen →')
	})

	it('leaves out the tagline, heading, intro, testimonial and Rundgang-starten button a document never sets (issue #130)', () => {
		const html = renderFixture('start-hub-empty')
		const heroMatch = /<section data-slot="hero-section-7"[^]*?<\/section>/.exec(html)
		if (!heroMatch) throw new Error('Hero section missing from the render')
		const hero = heroMatch[0]

		expect(hero).not.toContain('data-slot="tagline"')
		expect(hero).not.toContain('<h1')
		expect(html).not.toContain('data-slot="testimonials-section-1"')
		expect(html).not.toContain('Rundgang starten')
		expect(html).toContain('href="/stadt"')
	})
})
