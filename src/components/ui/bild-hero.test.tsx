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

		const classes = /<section[^>]* class="([^"]*)"/.exec(html)?.[1].split(' ') ?? []

		expect(classes).toEqual(expect.arrayContaining(['xl:flex-row', 'xl:items-center', 'xl:px-24']))
		expect(classes).not.toContain('lg:flex-row')
	})

	it('hyphenates the title and sets it at 88px from xl', () => {
		const html = render()

		expect(html).toMatch(/<h1 class="[^"]*hyphens-auto[^"]*xl:text-\[88px\]/)
	})

	it('leaves out the intro block when no children are given (issue #125)', () => {
		const html = renderToStaticMarkup(
			<BildHero eyebrow="THEMEN-ORT" title="Futursysteme" illustration={<span />} />,
		)

		expect(html).not.toContain('class="text-lg text-muted-foreground"')
	})

	it('sets the Leitsatz in italic display serif and the eyebrow in Petrol on request (issues #144, #145)', () => {
		const html = renderToStaticMarkup(
			<BildHero
				eyebrow="THEMEN-ORT"
				title="Futursysteme"
				zitat="Der Weg ist das Ziel."
				zitatItalic
				eyebrowTone="primary"
				illustration={<span />}
			/>,
		)

		expect(html).toMatch(/<p class="[^"]*font-heading[^"]*italic[^"]*">Der Weg ist das Ziel\./)
		expect(html).toContain('data-tone="primary"')
	})

	it('keeps the upright Zitat and muted eyebrow by default', () => {
		const html = renderToStaticMarkup(
			<BildHero eyebrow="X" title="T" zitat="Zitat" illustration={<span />} />,
		)

		expect(html).toMatch(/<p class="[^"]*font-serif[^"]*">Zitat/)
		expect(html).toContain('data-tone="muted"')
	})
})
