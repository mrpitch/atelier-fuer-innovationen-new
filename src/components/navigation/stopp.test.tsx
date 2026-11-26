import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { Stopp } from './stopp'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('Stopp', () => {
	it('shows its Nummer, links to its place and marks its status as a data attribute', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		const kontexte = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
		if (!kontexte) throw new Error('fixture missing stadt/kontexte')

		const html = renderToStaticMarkup(
			<Stopp
				href={kontexte.url}
				nummer={kontexte.number}
				illustrationId={kontexte.id}
				illustrationLabel={kontexte.title}
				status="offen"
			/>,
		)

		expect(html).toContain(`href="${kontexte.url}"`)
		expect(html).toContain(`>${kontexte.number}<`)
		expect(html).toContain('data-status="offen"')
		expect(html).not.toContain('aria-current')
	})

	it('marks the current Stopp with aria-current="page"', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')

		const html = renderToStaticMarkup(
			<Stopp
				href={graph.zentrum.url}
				nummer={0}
				illustrationId={graph.zentrum.id}
				illustrationLabel={graph.zentrum.title}
				status="aktuell"
			/>,
		)

		expect(html).toContain('data-status="aktuell"')
		expect(html).toContain('aria-current="page"')
	})

	it('marks a Stopp already passed "gesehen", with no aria-current (issue #120)', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		const kontexte = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
		if (!kontexte) throw new Error('fixture missing stadt/kontexte')

		const html = renderToStaticMarkup(
			<Stopp
				href={kontexte.url}
				nummer={kontexte.number}
				illustrationId={kontexte.id}
				illustrationLabel={kontexte.title}
				status="gesehen"
			/>,
		)

		expect(html).toContain('data-status="gesehen"')
		expect(html).not.toContain('aria-current')
	})

	it('defaults to "offen" when no status is given', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
		const kontexte = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
		if (!kontexte) throw new Error('fixture missing stadt/kontexte')

		const html = renderToStaticMarkup(
			<Stopp
				href={kontexte.url}
				nummer={kontexte.number}
				illustrationId={kontexte.id}
				illustrationLabel={kontexte.title}
			/>,
		)

		expect(html).toContain('data-status="offen"')
	})
})
