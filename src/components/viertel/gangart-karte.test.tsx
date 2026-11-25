import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GangartKarte } from './gangart-karte'

describe('GangartKarte', () => {
	it('shows its badge, title and both actions', () => {
		const html = renderToStaticMarkup(
			<GangartKarte
				badge="Schauen · Rundgang „Testrundgang“"
				title="Station 3 · Testviertel"
				primary={{ label: 'Station 3 ansehen', href: '/test-rundgang/3' }}
				secondary={{ label: 'Von vorn · Station 0', href: '/test-rundgang/0' }}
			/>,
		)

		expect(html).toContain('Schauen · Rundgang „Testrundgang“')
		expect(html).toContain('Station 3 · Testviertel')
		expect(html).toContain('href="/test-rundgang/3"')
		expect(html).toContain('href="/test-rundgang/0"')
	})

	it('leaves out the previous/next row when neither is given', () => {
		const html = renderToStaticMarkup(
			<GangartKarte
				badge="Lesen · Themen-Weg „Testthema“"
				title="Kapitel 1 · Testviertel"
				primary={{ label: 'Kapitel 1 lesen', href: '/leitthema/kapitel-1' }}
				secondary={{ label: 'Alle 8 Kapitel', href: '/test-thema' }}
			/>,
		)

		expect(html).not.toContain('data-icon="inline-start"')
	})

	it('shows the previous and next Station or Kapitel when given', () => {
		const html = renderToStaticMarkup(
			<GangartKarte
				badge="Schauen · Rundgang „Testrundgang“"
				title="Station 3 · Testviertel"
				primary={{ label: 'Station 3 ansehen', href: '/test-rundgang/3' }}
				secondary={{ label: 'Von vorn · Station 0', href: '/test-rundgang/0' }}
				previous={{ label: 'Station 2 · Davor', href: '/test-rundgang/2' }}
				next={{ label: 'Station 4 · Danach', href: '/test-rundgang/4' }}
			/>,
		)

		expect(html).toContain('Station 2 · Davor')
		expect(html).toContain('Station 4 · Danach')
	})
})
