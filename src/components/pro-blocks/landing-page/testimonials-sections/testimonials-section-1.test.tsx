import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Zitat } from '@/lib/content'

import { TestimonialsSection1 } from './testimonials-section-1'

const zitatMitZusatz: Zitat = {
	text: 'Ein Zitat über die Stadt.',
	quelle: 'Testquelle',
	zusatz: 'Testzusatz',
}

const zitatOhneZusatz: Zitat = {
	text: 'Ein weiteres Zitat.',
	quelle: 'Testquelle',
}

describe('TestimonialsSection1', () => {
	it('renders the quote and the quelle · zusatz attribution', () => {
		const html = renderToStaticMarkup(<TestimonialsSection1 zitat={zitatMitZusatz} />)

		expect(html).toContain('data-slot="testimonials-section-1"')
		expect(html).toContain('Ein Zitat über die Stadt.')
		expect(html).toContain('Testquelle · Testzusatz')
	})

	it('falls back to the quelle alone without a zusatz', () => {
		const html = renderToStaticMarkup(<TestimonialsSection1 zitat={zitatOhneZusatz} />)

		expect(html).toContain('Ein weiteres Zitat.')
		expect(html).toContain('Testquelle')
		expect(html).not.toContain('·')
	})
})
