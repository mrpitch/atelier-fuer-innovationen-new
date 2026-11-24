import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Zukunft } from './zukunft'

describe('Zukunft', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Zukunft label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-zukunft"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Zukunft label="Beschriftung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
