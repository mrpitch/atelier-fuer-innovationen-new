import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { NetzwerkDerInnovatoren } from './netzwerk-der-innovatoren'

describe('NetzwerkDerInnovatoren', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<NetzwerkDerInnovatoren label="Netzwerk der Innovatoren" />)

		expect(html).toContain('data-slot="illustration-netzwerk-der-innovatoren"')
		expect(html).toContain('aria-label="Netzwerk der Innovatoren"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<NetzwerkDerInnovatoren label="Netzwerk der Innovatoren" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
