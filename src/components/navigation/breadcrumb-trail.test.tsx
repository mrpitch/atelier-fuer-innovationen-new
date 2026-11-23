import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { NavigationLink } from '@/lib/content'

import { BreadcrumbTrail } from './breadcrumb-trail'

// NavigationLink URLs that steer clear of the content-graph URL prefixes
// (restrictions/content-url-literals, content-layer.md): BreadcrumbTrail
// takes plain data, not content IDs, so this test writes its own.
const trail: readonly NavigationLink[] = [
	{ id: '', url: '/', title: 'Start' },
	{ id: 'uebersicht', url: '/uebersicht', title: 'Übersicht' },
	{ id: 'uebersicht/eintrag', url: '/uebersicht/eintrag', title: 'Eintrag' },
]

describe('BreadcrumbTrail', () => {
	it('drops the root Seite and links every item but the last', () => {
		const html = renderToStaticMarkup(<BreadcrumbTrail breadcrumbs={trail} />)

		expect(html).not.toContain('Start')
		expect(html).toContain('href="/uebersicht"')
		expect(html).toContain('Übersicht')
		expect(html).not.toContain('href="/uebersicht/eintrag"')
		expect(html).toContain('Eintrag')
		expect(html).toContain('aria-current="page"')
	})

	it('falls back to the "Sie sind hier" aria-label when none is given', () => {
		const html = renderToStaticMarkup(<BreadcrumbTrail breadcrumbs={trail} />)

		expect(html).toContain('aria-label="Sie sind hier"')
	})

	it('lets a caller override the aria-label', () => {
		const html = renderToStaticMarkup(
			<BreadcrumbTrail breadcrumbs={trail} aria-label="Eigenes Label" />,
		)

		expect(html).toContain('aria-label="Eigenes Label"')
		expect(html).not.toContain('aria-label="Sie sind hier"')
	})
})
