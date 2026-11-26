import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PlaceBar } from './place-bar'

function classesOf(html: string): string[] {
	return /class="([^"]*)"/.exec(html)?.[1].split(' ') ?? []
}

describe('PlaceBar', () => {
	it('is a row from lg by default, as the Ebenen-Leiste uses it', () => {
		const classes = classesOf(renderToStaticMarkup(<PlaceBar />))

		expect(classes).toEqual(expect.arrayContaining(['flex-col', 'lg:flex-row', 'lg:px-24']))
		expect(classes).not.toContain('xl:flex-row')
	})

	it('stays stacked up to 1279px with switchAt="xl" (issue #110)', () => {
		const classes = classesOf(renderToStaticMarkup(<PlaceBar switchAt="xl" />))

		expect(classes).toEqual(expect.arrayContaining(['flex-col', 'xl:flex-row', 'xl:px-24']))
		expect(classes).not.toContain('lg:flex-row')
		expect(classes).not.toContain('lg:px-24')
	})
})
