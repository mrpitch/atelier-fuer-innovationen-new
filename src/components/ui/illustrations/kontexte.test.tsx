import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Kontexte } from './kontexte'

const TOKEN_CLASS =
	/^(?:fill|stroke)-(?:secondary|foreground|card|primary|chart-4|border|primary-foreground)$/

describe('Kontexte', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<Kontexte label="Kontexte" />)

		expect(html).toContain('data-slot="illustration-kontexte"')
		expect(html).toContain('role="img"')
		expect(html).toContain('aria-label="Kontexte"')
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
		const html = renderToStaticMarkup(<Kontexte label="Kontexte" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
