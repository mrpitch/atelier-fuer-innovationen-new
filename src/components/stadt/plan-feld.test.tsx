import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PlanFeld } from './plan-feld'

describe('PlanFeld', () => {
	it('shows its Nummer and status as a data attribute', () => {
		const html = renderToStaticMarkup(<PlanFeld nummer="3" status="aktuell" />)

		expect(html).toContain('>3<')
		expect(html).toContain('data-status="aktuell"')
	})

	it('defaults to "offen" when no status is given', () => {
		const html = renderToStaticMarkup(<PlanFeld nummer="5" />)

		expect(html).toContain('data-status="offen"')
	})
})
