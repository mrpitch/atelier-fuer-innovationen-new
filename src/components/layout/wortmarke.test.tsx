import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Site } from '@/lib/content'

import { Wortmarke } from './wortmarke'

const site: Site = {
	name: 'Xenia',
	tagline: 'Ein Stadtführer',
	baseUrl: 'https://example.com',
	copyright: '© Xenia',
}

describe('Wortmarke', () => {
	it('links to the homeUrl and shows the site name and tagline', () => {
		const html = renderToStaticMarkup(<Wortmarke site={site} homeUrl="/" />)

		expect(html).toContain('href="/"')
		expect(html).toContain(site.name)
		expect(html).toContain(site.tagline)
		expect(html).toContain('data-slot="wortmarke"')
	})

	it('omits the tagline when showTagline is false (the Rundgang-Leiste, issue #120)', () => {
		const html = renderToStaticMarkup(<Wortmarke site={site} homeUrl="/" showTagline={false} />)

		expect(html).toContain(site.name)
		expect(html).not.toContain(site.tagline)
	})
})
