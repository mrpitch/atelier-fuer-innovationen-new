import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ThemenWegSheet } from './themen-weg-sheet'

describe('ThemenWegSheet', () => {
	it('shows the "Themen-Weg · N Kapitel" trigger and keeps the Sheet closed by default', () => {
		const html = renderToStaticMarkup(
			<ThemenWegSheet kapitelCount={8}>
				<div data-testid="themen-weg-content">Themen-Weg Inhalt</div>
			</ThemenWegSheet>,
		)

		expect(html).toContain('Themen-Weg · 8 Kapitel')
		// Base UI's Dialog doesn't render its Popup while closed, so the list
		// handed down as children isn't in the initial markup either.
		expect(html).not.toContain('themen-weg-content')
	})
})
