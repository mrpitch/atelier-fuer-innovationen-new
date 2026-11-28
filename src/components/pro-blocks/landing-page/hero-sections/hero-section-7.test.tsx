import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HeroSection7 } from './hero-section-7'

describe('HeroSection7', () => {
	it('renders the tagline, heading, intro and actions', () => {
		const html = renderToStaticMarkup(
			<HeroSection7
				tagline="Testtagline"
				heading="Testüberschrift"
				intro="Testintro."
				actions={<button type="button">Testaktion</button>}
			/>,
		)

		expect(html).toContain('data-slot="hero-section-7"')
		expect(html).toContain('data-slot="tagline"')
		expect(html).toContain('Testtagline')
		expect(html).toMatch(/<h1[^>]*>Testüberschrift<\/h1>/)
		expect(html).toContain('Testintro.')
		expect(html).toContain('<button type="button">Testaktion</button>')
	})

	it('leaves out every part that is not set', () => {
		const html = renderToStaticMarkup(<HeroSection7 heading="Nur Überschrift" />)

		expect(html).toContain('Nur Überschrift')
		expect(html).not.toContain('data-slot="tagline"')
		expect(html).not.toContain('<p')
		expect(html).not.toContain('Testaktion')
	})
})
