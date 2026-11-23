import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { ViertelTeaser } from './viertel-teaser'
import { ViertelTeaserCard } from './viertel-teaser-card'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('ViertelTeaserCard', () => {
	it('renders a Viertel teaser with data resolved from the content graph', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'viertel-valid'))
		const viertel = graph.getViertel('stadt/erste-viertel')
		if (!viertel) throw new Error('fixture is missing stadt/erste-viertel')

		const html = renderToStaticMarkup(<ViertelTeaserCard viertel={viertel} />)

		expect(html).toContain(viertel.title)
		expect(html).toContain(viertel.leitsatz)
		expect(html).toContain(`href="${viertel.url}"`)
		expect(html).toContain('01')
	})
})

describe('ViertelTeaser', () => {
	it('is the component mdx-components.tsx registers, resolving its own ID against the content graph', () => {
		// stadt/annaeherung is a real Viertel (src/content), not a fixture:
		// unlike ViertelTeaserCard, ViertelTeaser is the component content
		// actually uses in a body — it reads the real content graph itself
		// (content-layer.md), the same way SitemapList does, so it can't be
		// pointed at a fixture directory.
		const html = renderToStaticMarkup(<ViertelTeaser id="stadt/annaeherung" />)

		expect(html).toContain('Annäherung')
		expect(html).toContain('href="/stadt/annaeherung"')
	})

	it('throws naming the ID when given an unknown Viertel', () => {
		expect(() => renderToStaticMarkup(<ViertelTeaser id="stadt/nichtvorhanden" />)).toThrow(
			/stadt\/nichtvorhanden/,
		)
	})
})
