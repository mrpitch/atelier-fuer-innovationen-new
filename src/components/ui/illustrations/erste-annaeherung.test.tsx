import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ErsteAnnaeherung } from './erste-annaeherung'

const TOKEN_CLASS =
	/^(?:fill|stroke)-(?:secondary|foreground|card|primary|chart-4|border|primary-foreground)$/

describe('ErsteAnnaeherung', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<ErsteAnnaeherung label="Erste Annäherung" />)

		expect(html).toContain('data-slot="illustration-erste-annaeherung"')
		expect(html).toContain('role="img"')
		expect(html).toContain('aria-label="Erste Annäherung"')
		expect(html).toContain('viewBox="0 0 240 240"')
		expect(html).not.toMatch(/\sid="/)
		expect(html).not.toMatch(/(?:fill|stroke)="(?:#|white)/i)

		const classAttributes = [...html.matchAll(/class="([^"]+)"/g)]
		expect(classAttributes.length).toBeGreaterThan(0)
		for (const [, classValue] of classAttributes) {
			for (const className of classValue!.split(' ')) {
				expect(className).toMatch(TOKEN_CLASS)
			}
		}
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(
			<ErsteAnnaeherung label="Erste Annäherung" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
