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
	it('renders the Hero copy and the testimonial, never the MDX body (issue #129)', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('Testtagline der Startseite')
		expect(html).toContain('Testüberschrift der Startseite')
		expect(html).toContain('Testintro der Startseite.')
		expect(html).toContain('Ein Zitat für Tests.')
		expect(html).not.toContain('Testinhalt, der nicht gerendert werden darf.')
	})

	it('links to the Stadtplan, the Rundgänge and the Themen with the dictionary labels', () => {
		const html = renderFixture('start-hub-valid')

		expect(html).toContain('href="/stadt"')
		expect(html).toContain('Zum Stadtplan →')
		expect(html).toContain('href="/rundgaenge"')
		expect(html).toContain('Alle Rundgänge →')
		expect(html).toContain('href="/themen"')
		expect(html).toContain('Alle Themen →')
	})

	it('leaves out the tagline, intro and testimonial a document never sets, falling back to the title as its heading (issue #129)', () => {
		const html = renderFixture('start-hub-empty')

		expect(html).not.toContain('data-slot="tagline"')
		expect(html).not.toContain('data-slot="testimonials-section-1"')
		expect(html).not.toContain('<p')
		expect(html).toContain(
			'<h1 class="font-heading text-[48px] leading-none tracking-[-0.02em] hyphens-auto text-foreground xl:text-[88px]">Start</h1>',
		)
	})
})
