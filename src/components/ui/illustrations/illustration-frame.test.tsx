import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { IllustrationFrame } from './illustration-frame'

describe('IllustrationFrame', () => {
	it('draws the token-coloured outer ring and the ground line', () => {
		const html = renderToStaticMarkup(
			<svg>
				<IllustrationFrame />
			</svg>,
		)

		expect(html).toContain('class="fill-secondary"')
		expect(html).toContain('d="M28 196H212"')
		expect(html).toContain('class="stroke-foreground"')
		expect(html).not.toMatch(/\sid="/)
	})
})
