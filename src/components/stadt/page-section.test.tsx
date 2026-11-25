import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PageSection } from './page-section'

describe('PageSection', () => {
	it('renders a section with the shared padding and merges a caller class', () => {
		const html = renderToStaticMarkup(<PageSection className="bg-muted">x</PageSection>)

		expect(html).toMatch(/^<section/)
		expect(html).toContain('px-5 py-14 md:px-24 md:py-16')
		expect(html).toContain('bg-muted')
	})

	it('renders as another element via render, keeping its attributes', () => {
		const html = renderToStaticMarkup(
			<PageSection render={<nav />} aria-label="Liste">
				x
			</PageSection>,
		)

		expect(html).toMatch(/^<nav/)
		expect(html).toContain('aria-label="Liste"')
		expect(html).toContain('px-5 py-14')
	})

	it('lets a caller name its own data-slot', () => {
		const html = renderToStaticMarkup(<PageSection data-slot="steckbrief-section">x</PageSection>)

		expect(html).toContain('data-slot="steckbrief-section"')
		expect(html).not.toContain('data-slot="page-section"')
	})
})
