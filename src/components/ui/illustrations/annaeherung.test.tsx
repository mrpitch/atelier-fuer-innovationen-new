import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Annaeherung } from './annaeherung'
import { expectTokenColouredSvg } from './expect-token-coloured-svg'

describe('Annaeherung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Annaeherung label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-annaeherung"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Annaeherung label="Beschriftung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
