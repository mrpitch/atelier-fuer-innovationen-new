import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Kontexte } from './kontexte'

describe('Kontexte', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Kontexte label="Kontexte" />)

		expect(html).toContain('data-slot="illustration-kontexte"')
		expect(html).toContain('aria-label="Kontexte"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Kontexte label="Kontexte" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
