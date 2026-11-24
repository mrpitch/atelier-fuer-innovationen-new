import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EineWeltFuerMorgen } from './eine-welt-fuer-morgen'

const TOKEN_CLASS =
	/^(?:fill|stroke)-(?:secondary|foreground|card|primary|chart-4|border|primary-foreground)$/

describe('EineWeltFuerMorgen', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<EineWeltFuerMorgen label="Eine Welt für morgen" />)

		expect(html).toContain('data-slot="illustration-eine-welt-fuer-morgen"')
		expect(html).toContain('role="img"')
		expect(html).toContain('aria-label="Eine Welt für morgen"')
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
			<EineWeltFuerMorgen label="Eine Welt für morgen" data-testid="probe" />,
		)

		expect(html).toContain('data-testid="probe"')
	})
})
