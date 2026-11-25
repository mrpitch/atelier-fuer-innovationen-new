import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { KapitelHero } from './kapitel-hero'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'kapitel-hero-valid'))

describe('KapitelHero', () => {
	it('shows the overline, title, untertitel, Ort and the hero actions', () => {
		const kapitel = graph.getKapitel('leitthema/erstes-kapitel')
		if (!kapitel) throw new Error('fixture content has no leitthema/erstes-kapitel')
		const viertel = graph.getViertel(kapitel.viertelId)
		if (!viertel) throw new Error(`fixture content has no ${kapitel.viertelId}`)
		const abschnitte = graph.getAbschnitteByKapitel(kapitel.id)

		const html = renderToStaticMarkup(
			<KapitelHero
				kapitel={kapitel}
				viertel={viertel}
				leitthema={graph.leitthema}
				viertelCount={graph.viertel.length}
				firstAbschnitt={abschnitte[0]}
			/>,
		)

		expect(html).toContain(`HIER SPIELT KAPITEL ${kapitel.number} VON ${graph.viertel.length}`)
		expect(html).toContain('Testleitthema')
		expect(html).toContain(kapitel.title)
		expect(html).toContain(kapitel.untertitel!)
		expect(html).toContain(viertel.title)
		expect(html).toContain(`href="${abschnitte[0]!.url}"`)
		expect(html).toContain(`href="${graph.leitthema!.url}"`)
	})

	it('leaves out the Leitthema action and overline name when there is no Leitthema', () => {
		const kapitel = graph.getKapitel('leitthema/erstes-kapitel')
		if (!kapitel) throw new Error('fixture content has no leitthema/erstes-kapitel')
		const viertel = graph.getViertel(kapitel.viertelId)
		if (!viertel) throw new Error(`fixture content has no ${kapitel.viertelId}`)

		const html = renderToStaticMarkup(
			<KapitelHero
				kapitel={kapitel}
				viertel={viertel}
				leitthema={undefined}
				viertelCount={graph.viertel.length}
				firstAbschnitt={undefined}
			/>,
		)

		expect(html).not.toContain('Testleitthema')
		expect(html).not.toContain('Alle')
	})
})
