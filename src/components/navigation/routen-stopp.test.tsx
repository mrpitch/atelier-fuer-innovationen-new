import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { RoutenStopp } from './routen-stopp'

describe('RoutenStopp', () => {
	it('shows its own Nummer and Name instead of an illustration, and links to its Station', () => {
		const href = '/test-rundgang/1'
		const html = renderToStaticMarkup(
			<RoutenStopp href={href} nummer={1} name="Stätten der Begegnung" />,
		)

		expect(html).toContain(`href="${href}"`)
		expect(html).toContain('data-slot="routen-stopp"')
		expect(html).toContain('>1<')
		expect(html).toContain('Stätten der Begegnung')
	})

	it('defaults to "offen" when no status is given', () => {
		const href = '/test-rundgang/1'
		const html = renderToStaticMarkup(<RoutenStopp href={href} nummer={1} name="Test" />)

		expect(html).toContain('data-status="offen"')
		expect(html).not.toContain('aria-current')
	})

	it('marks the current Routen-Stopp with aria-current="page" (issue #120)', () => {
		const href = '/test-rundgang/1'
		const html = renderToStaticMarkup(
			<RoutenStopp href={href} nummer={1} name="Test" status="aktuell" />,
		)

		expect(html).toContain('data-status="aktuell"')
		expect(html).toContain('aria-current="page"')
	})

	it('marks a Routen-Stopp already passed "gesehen", with no aria-current', () => {
		const href = '/test-rundgang/1'
		const html = renderToStaticMarkup(
			<RoutenStopp href={href} nummer={1} name="Test" status="gesehen" />,
		)

		expect(html).toContain('data-status="gesehen"')
		expect(html).not.toContain('aria-current')
	})
})
