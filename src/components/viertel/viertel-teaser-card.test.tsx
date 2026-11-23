import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { ViertelTeaserCard } from './viertel-teaser-card'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('ViertelTeaserCard', () => {
	it('renders a Viertel teaser with data resolved from the content graph', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'viertel-valid'))
		const viertel = graph.getViertel('stadt/erste-viertel')
		if (!viertel) throw new Error('fixture is missing stadt/erste-viertel')

		const html = renderToStaticMarkup(<ViertelTeaserCard viertel={viertel} />)

		expect(html).toContain('data-slot="viertel-teaser-card"')
		expect(html).toContain(viertel.title)
		expect(html).toContain(viertel.leitsatz)
		expect(html).toContain(`href="${viertel.url}"`)
		expect(html).toContain('01')
	})
})
