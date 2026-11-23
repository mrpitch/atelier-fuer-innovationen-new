import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { EbenenLeiste } from './ebenen-leiste'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'ebenen-leiste-valid'))

describe('EbenenLeiste', () => {
	it('renders the current place, the breadcrumb and the Kapitel position for a Kapitel page', () => {
		const kapitel = graph.getKapitel('leitthema/erstes-kapitel')
		if (!kapitel) throw new Error('fixture is missing leitthema/erstes-kapitel')
		const ort = graph.getViertel(kapitel.viertelId)
		if (!ort) throw new Error('fixture is missing its Viertel')

		const html = renderToStaticMarkup(
			<EbenenLeiste
				ort={ort}
				illustration={<svg data-testid="illustration" />}
				breadcrumbs={graph.getBreadcrumbs(kapitel.id)}
				kapitel={{ number: kapitel.number, total: graph.viertel.length }}
			/>,
		)

		expect(html).toContain('data-slot="ebenen-leiste"')
		expect(html).toContain('data-testid="illustration"')
		expect(html).toContain('Viertel 01 · Erste')
		expect(html).toContain('Sie sind hier')
		expect(html).toContain('Stadtplan')
		expect(html).toContain('href="/stadt"')
		expect(html).toContain('href="/stadt/erste-viertel"')
		expect(html).toContain('Erstes Kapitel')
		expect(html).toContain('THEMA · KAPITEL 1 VON 2')
	})

	it('renders the Kapitel and the Abschnitt position for an Abschnitt page', () => {
		const abschnitt = graph.getAbschnitt('leitthema/zweites-kapitel/zweiter-abschnitt')
		if (!abschnitt) throw new Error('fixture is missing its Abschnitt')
		const kapitel = graph.getKapitel(abschnitt.kapitelId)
		if (!kapitel) throw new Error('fixture is missing its Kapitel')
		const ort = graph.getViertel(kapitel.viertelId)
		if (!ort) throw new Error('fixture is missing its Viertel')
		const total = graph.getAbschnitteByKapitel(kapitel.id).length

		const html = renderToStaticMarkup(
			<EbenenLeiste
				ort={ort}
				illustration={<svg data-testid="illustration" />}
				breadcrumbs={graph.getBreadcrumbs(abschnitt.id)}
				kapitel={{ number: kapitel.number, total: graph.viertel.length }}
				abschnitt={{ position: abschnitt.position, total }}
			/>,
		)

		expect(html).toContain('Viertel 02 · Zweite')
		expect(html).toContain('Zweites Kapitel')
		expect(html).toContain('Zweiter Abschnitt')
		expect(html).toContain('KAPITEL 2 · 2 VON 2')
	})
})
