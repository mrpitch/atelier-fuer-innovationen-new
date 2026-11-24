import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BesuchInDerUmgebung } from './besuch-in-der-umgebung'
import { expectTokenColouredSvg } from './expect-token-coloured-svg'

describe('BesuchInDerUmgebung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<BesuchInDerUmgebung label="Besuch in der Umgebung" />)

		expect(html).toContain('data-slot="illustration-besuch-in-der-umgebung"')
		expect(html).toContain('aria-label="Besuch in der Umgebung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<BesuchInDerUmgebung label="Besuch in der Umgebung" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
