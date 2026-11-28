import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SectionTitleXl } from './section-title-xl'

describe('SectionTitleXl', () => {
	it('renders the kicker through MonoLabel, the title as the page h1, and the description', () => {
		const html = renderToStaticMarkup(
			<SectionTitleXl kicker="Übersicht" title="Sitemap" description="Alle Bereiche." />,
		)

		expect(html).toMatch(/<p[^>]*data-slot="mono-label"[^>]*>Übersicht<\/p>/)
		expect(html).toMatch(/<h1[^>]*class="[^"]*heading-xl[^"]*">Sitemap<\/h1>/)
		expect(html).toContain('Alle Bereiche.')
	})

	it('leaves out the description paragraph when none is given', () => {
		const html = renderToStaticMarkup(<SectionTitleXl kicker="Übersicht" title="Sitemap" />)

		expect(html).not.toContain('<p class="text-lg')
	})
})
