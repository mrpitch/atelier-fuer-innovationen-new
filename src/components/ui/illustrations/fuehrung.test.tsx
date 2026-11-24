import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Fuehrung } from './fuehrung'

describe('Fuehrung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Fuehrung label="Führung" />)

		expect(html).toContain('data-slot="illustration-fuehrung"')
		expect(html).toContain('aria-label="Führung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Fuehrung label="Führung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
