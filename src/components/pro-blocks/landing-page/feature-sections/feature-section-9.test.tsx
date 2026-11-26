import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FeatureSection9 } from './feature-section-9'

const steps = [
	{ title: 'Erster Schritt', description: 'Beschreibung eins' },
	{ title: 'Zweiter Schritt', description: 'Beschreibung zwei' },
	{ title: 'Dritter Schritt', description: 'Beschreibung drei' },
] as const

function render() {
	return renderToStaticMarkup(
		<FeatureSection9 tagline="ABLAUF" heading="So funktioniert es" steps={steps} />,
	)
}

describe('FeatureSection9', () => {
	it('renders the tagline, heading and all steps in order', () => {
		const html = render()

		expect(html).toContain('data-slot="feature-section-9"')
		expect(html).toContain('ABLAUF')
		expect(html).toContain('So funktioniert es')
		expect(html.indexOf('Erster Schritt')).toBeLessThan(html.indexOf('Zweiter Schritt'))
		expect(html.indexOf('Zweiter Schritt')).toBeLessThan(html.indexOf('Dritter Schritt'))
	})

	it('uses the Secondary background token, not the registry default Background', () => {
		const html = render()

		expect(html).toMatch(/<section[^>]*class="[^"]*\bbg-secondary\b/)
	})
})
