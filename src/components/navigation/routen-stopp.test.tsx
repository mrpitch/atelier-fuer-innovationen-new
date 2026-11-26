import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { RoutenStopp } from './routen-stopp'

describe('RoutenStopp', () => {
	it('shows its own Nummer and Name instead of an illustration, and links to its Station', () => {
		const href = '/test-rundgang/1'
		const html = renderToStaticMarkup(
			<RoutenStopp href={href} nummer={1} name="Stätten der Begegnung" />,
		)

		expect(html).toContain(`href="${href}"`)
		expect(html).toContain('data-slot="routen-stopp"')
		expect(html).toContain('>1<')
		expect(html).toContain('Stätten der Begegnung')
	})
})
