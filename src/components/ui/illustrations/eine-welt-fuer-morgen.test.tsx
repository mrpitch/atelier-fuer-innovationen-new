import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EineWeltFuerMorgen } from './eine-welt-fuer-morgen'
import { expectTokenColouredSvg } from './expect-token-coloured-svg'

describe('EineWeltFuerMorgen', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<EineWeltFuerMorgen label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-eine-welt-fuer-morgen"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<EineWeltFuerMorgen label="Beschriftung" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
