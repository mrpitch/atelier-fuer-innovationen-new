import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Potenziale } from './potenziale'

describe('Potenziale', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Potenziale label="Potenziale" />)

		expect(html).toContain('data-slot="illustration-potenziale"')
		expect(html).toContain('aria-label="Potenziale"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Potenziale label="Potenziale" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
