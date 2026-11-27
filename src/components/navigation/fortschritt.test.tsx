import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Fortschritt } from './fortschritt'

describe('Fortschritt', () => {
	it('fills the segments up to "current" and leaves the rest unfilled', () => {
		const html = renderToStaticMarkup(<Fortschritt total={8} current={3} />)

		expect(html.match(/bg-primary/g)).toHaveLength(3)
		expect(html.match(/bg-border/g)).toHaveLength(5)
	})

	it('renders one segment per "total", at either end', () => {
		expect(
			renderToStaticMarkup(<Fortschritt total={4} current={0} />).match(/bg-border/g),
		).toHaveLength(4)
		expect(
			renderToStaticMarkup(<Fortschritt total={4} current={4} />).match(/bg-primary/g),
		).toHaveLength(4)
	})

	it('is decorative: the surrounding text already states the same position', () => {
		const html = renderToStaticMarkup(<Fortschritt total={8} current={3} />)

		expect(html).toContain('aria-hidden="true"')
	})
})
