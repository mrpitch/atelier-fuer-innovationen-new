import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ErsteAnnaeherung } from './erste-annaeherung'
import { expectTokenColouredSvg } from './expect-token-coloured-svg'

describe('ErsteAnnaeherung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<ErsteAnnaeherung label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-erste-annaeherung"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<ErsteAnnaeherung label="Beschriftung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
