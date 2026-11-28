import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SectionTitle } from './section-title'

describe('SectionTitle', () => {
	it('renders the tagline and an h2 title at the sm size by default', () => {
		const html = renderToStaticMarkup(<SectionTitle tagline="Eine Tagline" title="Ein Titel" />)

		expect(html).toContain('Eine Tagline')
		expect(html).toContain('heading-sm')
		expect(html).toContain('<h2')
		expect(html).toContain('>Ein Titel</h2>')
	})

	it('renders no title element when title is omitted', () => {
		const html = renderToStaticMarkup(<SectionTitle tagline="Eine Tagline" />)

		expect(html).not.toContain('<h2')
	})

	it('renders the xl size as the page\'s own h1 when titleAs is "h1" (issue #135)', () => {
		const html = renderToStaticMarkup(
			<SectionTitle tagline="Rechtliches" title="Impressum" titleAs="h1" size="xl" />,
		)

		expect(html).toContain('heading-xl')
		expect(html).toContain('<h1')
		expect(html).toContain('>Impressum</h1>')
		expect(html).not.toContain('<h2')
	})
})
