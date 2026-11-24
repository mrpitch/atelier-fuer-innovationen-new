import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BesuchImZentrum } from './besuch-im-zentrum'
import { expectTokenColouredSvg } from './expect-token-coloured-svg'

describe('BesuchImZentrum', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<BesuchImZentrum label="Besuch im Zentrum" />)

		expect(html).toContain('data-slot="illustration-besuch-im-zentrum"')
		expect(html).toContain('aria-label="Besuch im Zentrum"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<BesuchImZentrum label="Besuch im Zentrum" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
