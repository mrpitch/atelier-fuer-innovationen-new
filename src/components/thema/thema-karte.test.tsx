import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Illustration } from '@/components/ui/illustration'
import { buildContentGraph } from '@/lib/content'

import { ThemaKarte } from './thema-karte'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'themen-ort-detail-valid'))
const thema = graph.getThema('themen/futursysteme')
if (!thema) throw new Error('fixture content has no themen/futursysteme')

describe('ThemaKarte', () => {
	it('shows its label, title, text and action, linking the action to its href', () => {
		const html = renderToStaticMarkup(
			<ThemaKarte
				label="Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab"
				illustration={<Illustration id={thema.id} label={thema.title} />}
				titel={thema.title}
				text="Den Wandel wollen: Der Weg ist das Ziel."
				action={{ label: 'Futursysteme öffnen', href: thema.url }}
			/>,
		)

		expect(html).toContain('data-slot="thema-karte"')
		expect(html).toContain('Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab')
		expect(html).toContain(thema.title)
		expect(html).toContain('Den Wandel wollen: Der Weg ist das Ziel.')
		expect(html).toContain(`href="${thema.url}"`)
		expect(html).toContain('Futursysteme öffnen')
	})

	it('does not force-capitalize its mixed-case label (kartei-design-system.md, Open deviations)', () => {
		const html = renderToStaticMarkup(
			<ThemaKarte
				label="Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab"
				illustration={<Illustration id={thema.id} label={thema.title} />}
				titel={thema.title}
				text="Den Wandel wollen: Der Weg ist das Ziel."
				action={{ label: 'Futursysteme öffnen', href: thema.url }}
			/>,
		)

		const label = /<p class="([^"]*)">Themen-Ort/.exec(html)
		expect(label?.[1]).not.toContain('uppercase')
	})
})
