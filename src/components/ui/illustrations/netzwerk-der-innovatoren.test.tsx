import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { NetzwerkDerInnovatoren } from './netzwerk-der-innovatoren'

describe('NetzwerkDerInnovatoren', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<NetzwerkDerInnovatoren label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-netzwerk-der-innovatoren"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<NetzwerkDerInnovatoren label="Beschriftung" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
