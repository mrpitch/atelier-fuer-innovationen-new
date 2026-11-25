import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BildHero } from './bild-hero'

function render() {
	return renderToStaticMarkup(
		<BildHero eyebrow="THEMEN-ORT" title="Futursysteme" illustration={<span />}>
			Intro
		</BildHero>,
	)
}

describe('BildHero', () => {
	it('stays stacked up to 1279px and puts the illustration beside the text at xl (issue #110)', () => {
		const html = render()

		expect(html).toContain('xl:flex-row xl:items-center xl:justify-between xl:gap-20 xl:px-24')
		expect(html).not.toContain('lg:flex-row')
	})

	it('hyphenates the title and sets it at 88px from xl', () => {
		const html = render()

		expect(html).toMatch(/<h1 class="[^"]*hyphens-auto[^"]*xl:text-\[88px\]/)
	})
})
