import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Inszenierung } from './inszenierung'

describe('Inszenierung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Inszenierung label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-inszenierung"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Inszenierung label="Beschriftung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
