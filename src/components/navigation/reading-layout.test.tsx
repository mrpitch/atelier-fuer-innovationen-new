import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ReadingLayout } from './reading-layout'

describe('ReadingLayout', () => {
	it('renders the content column, the desktop Themen-Weg column and the Randspalte', () => {
		const html = renderToStaticMarkup(
			<ReadingLayout
				themenWeg={<div data-testid="themen-weg">Themen-Weg</div>}
				themenWegKapitelCount={8}
				randspalte={<div data-testid="randspalte-content">Randspalte Inhalt</div>}
			>
				<p data-testid="content">Kapitelinhalt</p>
			</ReadingLayout>,
		)

		expect(html).toContain('data-testid="content"')
		expect(html).toContain('data-slot="randspalte"')
		expect(html).toContain('randspalte-content')
		// The desktop column renders the Themen-Weg once; the mobile Sheet's
		// copy stays out of the static markup while closed (ThemenWegSheet).
		expect(html.match(/data-testid="themen-weg"/g)).toHaveLength(1)
		expect(html).toContain('data-slot="themen-weg-column"')
		expect(html).toContain('Themen-Weg · 8 Kapitel')
	})

	it('renders an empty Randspalte slot when none is given', () => {
		const html = renderToStaticMarkup(
			<ReadingLayout themenWeg={<div />} themenWegKapitelCount={8}>
				<p>Kapitelinhalt</p>
			</ReadingLayout>,
		)

		expect(html).toContain('data-slot="randspalte"')
	})
})
