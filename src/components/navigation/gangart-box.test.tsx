import Link from 'next/link'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GangartBox } from './gangart-box'

describe('GangartBox', () => {
	it('shows its label, titel, text and action, and links the action to its href', () => {
		const html = renderToStaticMarkup(
			<GangartBox
				label="GANGART WECHSELN"
				illustration={<svg data-testid="illustration" />}
				titel="Station 3 im Rundgang"
				text="Das Viertel der Kontexte liegt auch auf diesem Rundgang."
				action={{ label: 'Station 3 ansehen', href: '/test-rundgang/3' }}
			/>,
		)

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).toContain('GANGART WECHSELN')
		expect(html).toContain('Station 3 im Rundgang')
		expect(html).toContain('Das Viertel der Kontexte liegt auch auf diesem Rundgang.')
		expect(html).toContain('href="/test-rundgang/3"')
		expect(html).toContain('Station 3 ansehen')
		expect(html).toContain('data-testid="illustration"')
		// no bookmark line (issue #100 AC) when no hinweis is given
		expect(html).not.toContain('Lesezeichen')
	})

	it('renders the optional hinweis below the action', () => {
		const leitthemaHref = '/test-leitthema'
		const html = renderToStaticMarkup(
			<GangartBox
				label="ZURÜCK ZUM THEMEN-WEG"
				illustration={<svg />}
				titel="Kapitel 1 · Ankunft"
				text="Im Viertel der Annäherung zweigt dieser Themen-Ort vom Leitthema ab."
				action={{ label: 'Kapitel 1 lesen', href: '/test-kapitel' }}
				hinweis={<Link href={leitthemaHref}>Leitthema „Eine Welt für morgen“</Link>}
			/>,
		)

		expect(html).toContain('Leitthema „Eine Welt für morgen“')
		expect(html).toContain(`href="${leitthemaHref}"`)
	})
})
