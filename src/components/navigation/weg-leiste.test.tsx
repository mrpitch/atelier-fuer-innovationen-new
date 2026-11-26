import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { WegLeiste } from './weg-leiste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('WegLeiste', () => {
	describe('Stadt mode', () => {
		it('marks only the current place "aktuell" and every other Stopp, the Zentrum included, "offen"', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			const aktuell = graph.viertel.find((viertel) => viertel.id === 'stadt/kontexte')
			if (!aktuell) throw new Error('fixture missing stadt/kontexte')

			const html = renderToStaticMarkup(
				<WegLeiste viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={aktuell.id} />,
			)

			expect(html.match(/data-status="aktuell"/g)).toHaveLength(1)
			expect(html.match(/data-status="offen"/g)).toHaveLength(2)
			expect(html).toContain('aria-current="page"')
		})

		it('marks the Zentrum "aktuell" at Stopp 0 and derives "Sie stehen bei 0" from its ID alone (issue #118)', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			if (!graph.zentrum) throw new Error('fixture missing the Zentrum')

			const html = renderToStaticMarkup(
				<WegLeiste viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={graph.zentrum.id} />,
			)

			expect(html.match(/data-status="aktuell"/g)).toHaveLength(1)
			expect(html.match(/data-status="offen"/g)).toHaveLength(2)
			expect(html).toContain('Sie stehen bei 0')
		})

		it('keeps every Stopp in one un-wrapped row from its own rendered width, not the viewport (issue #112, #118)', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			const aktuell = graph.viertel[0]
			if (!aktuell) throw new Error('fixture missing a Viertel')

			const html = renderToStaticMarkup(
				<WegLeiste viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={aktuell.id} />,
			)

			expect(html).toContain('@container')
			expect(html).toContain('@xl:flex-nowrap')
		})

		it('links every Stopp to its own place', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			const aktuell = graph.viertel[0]
			if (!aktuell || !graph.zentrum) throw new Error('fixture missing a Viertel or the Zentrum')

			const html = renderToStaticMarkup(
				<WegLeiste viertel={graph.viertel} zentrum={graph.zentrum} aktuellId={aktuell.id} />,
			)

			expect(html).toContain(`href="${graph.zentrum.url}"`)
			for (const viertel of graph.viertel) {
				expect(html).toContain(`href="${viertel.url}"`)
			}
		})
	})

	describe('Rundgang mode', () => {
		it('renders a Stopp for a Station at an Ort and a Routen-Stopp for one without, Label/Titel from the Rundgang, no Hinweis', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
			if (!rundgang) throw new Error('fixture missing rundgaenge/besuch-im-zentrum')
			const stationen = graph.getStationenByRundgang(rundgang.id)

			const html = renderToStaticMarkup(
				<WegLeiste mode="rundgang" rundgang={rundgang} stationen={stationen} />,
			)

			expect(html.match(/data-slot="stopp"/g)).toHaveLength(1)
			expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(1)
			expect(html).not.toContain('data-status="aktuell"')
			expect(html).toContain(rundgang.title)
			expect(html).toContain(rundgang.description)
			expect(html).not.toContain('Sie stehen bei')
		})

		it('links every Station to its own page', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'weg-leiste-valid'))
			const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
			if (!rundgang) throw new Error('fixture missing rundgaenge/besuch-im-zentrum')
			const stationen = graph.getStationenByRundgang(rundgang.id)

			const html = renderToStaticMarkup(
				<WegLeiste mode="rundgang" rundgang={rundgang} stationen={stationen} />,
			)

			for (const station of stationen) {
				expect(html).toContain(`href="${station.url}"`)
			}
		})
	})
})
