import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { AufsaetzeListe } from './aufsaetze-liste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('AufsaetzeListe', () => {
	it("renders a Viertel's Aufsätze as Cards with their type, title and meta", () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'aufsaetze-liste-valid'))
		const aufsaetze = graph.getAufsaetzeByViertel('stadt/erste-viertel')

		const html = renderToStaticMarkup(<AufsaetzeListe aufsaetze={aufsaetze} />)

		expect(html).toContain('data-slot="card"')
		expect(html).toContain('Aufsatz')
		expect(html).toContain('Mein Aufsatz')
		expect(html).toContain('Min.')
		expect(html).toContain(`href="${aufsaetze[0]?.url}"`)
	})

	it('renders nothing when the Viertel has no Aufsätze', () => {
		const html = renderToStaticMarkup(<AufsaetzeListe aufsaetze={[]} />)

		expect(html).toBe('')
	})
})
