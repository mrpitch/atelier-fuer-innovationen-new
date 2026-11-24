import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { contentGraph } from '@/lib/content'

import { Illustration } from './illustration'

const TOKEN_CLASS =
	/^(?:fill|stroke)-(?:secondary|foreground|card|primary|chart-4|border|primary-foreground)$/

// One entry per exported drawing (issue #88, #89) — stadt/annaeherung is the
// first. A later slice that exports another illustration adds its own
// resolver here rather than a new test file.
const EXPORTED_DRAWINGS: ReadonlyArray<{
	id: string
	resolve: (graph: ReturnType<typeof contentGraph>) => { id: string; title: string } | undefined
}> = [
	{ id: 'stadt/annaeherung', resolve: (graph) => graph.getViertel('stadt/annaeherung') },
	{ id: 'stadt/kontexte', resolve: (graph) => graph.getViertel('stadt/kontexte') },
	{ id: 'stadt/inszenierung', resolve: (graph) => graph.getViertel('stadt/inszenierung') },
	{ id: 'stadt/zukunft', resolve: (graph) => graph.getViertel('stadt/zukunft') },
	{ id: 'stadt/wertschoepfung', resolve: (graph) => graph.getViertel('stadt/wertschoepfung') },
	{ id: 'stadt/potenziale', resolve: (graph) => graph.getViertel('stadt/potenziale') },
	{ id: 'stadt/fuehrung', resolve: (graph) => graph.getViertel('stadt/fuehrung') },
	{ id: 'stadt/zentrum', resolve: (graph) => graph.zentrum },
]

describe('Illustration registry', () => {
	it.each(EXPORTED_DRAWINGS)('renders the real drawing for $id', ({ id, resolve }) => {
		const document = resolve(contentGraph())
		if (!document) throw new Error(`fixture gap: "${id}" is missing from the real content graph`)

		const html = renderToStaticMarkup(<Illustration id={document.id} label={document.title} />)

		expect(html).toContain('role="img"')
		expect(html).toContain(`aria-label="${document.title}"`)
		expect(html).toContain('viewBox="0 0 240 240"')
		expect(html).not.toMatch(/\sid="/)
		expect(html).not.toMatch(/(?:fill|stroke)="(?:#|white)/i)

		const classAttributes = [...html.matchAll(/class="([^"]+)"/g)]
		expect(classAttributes.length).toBeGreaterThan(0)
		for (const [, classValue] of classAttributes) {
			for (const className of classValue!.split(' ')) {
				expect(className).toMatch(TOKEN_CLASS)
			}
		}
	})

	it('still renders the placeholder for an ID with no exported drawing yet', () => {
		const viertel = contentGraph().getViertel('stadt/maerkte-kooperation')
		if (!viertel)
			throw new Error(
				'fixture gap: stadt/maerkte-kooperation is missing from the real content graph',
			)

		const html = renderToStaticMarkup(<Illustration id={viertel.id} label={viertel.title} />)

		expect(html).toContain('data-slot="illustration-placeholder"')
	})

	it('throws naming the ID when nothing is registered for it', () => {
		expect(() =>
			renderToStaticMarkup(<Illustration id="stadt/nichtvorhanden" label="Nichtvorhanden" />),
		).toThrow(/stadt\/nichtvorhanden/)
	})
})
