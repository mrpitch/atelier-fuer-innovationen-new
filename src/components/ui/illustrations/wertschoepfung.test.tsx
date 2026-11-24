import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { Wertschoepfung } from './wertschoepfung'

describe('Wertschoepfung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Wertschoepfung label="Wertschöpfung" />)

		expect(html).toContain('data-slot="illustration-wertschoepfung"')
		expect(html).toContain('aria-label="Wertschöpfung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<Wertschoepfung label="Wertschöpfung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
