import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { ReadingLayout } from './reading-layout'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'themen-weg-valid'))
const [kapitel] = graph.kapitel

describe('ReadingLayout', () => {
	it('renders the content column, the desktop Themen-Weg column and the Randspalte', () => {
		const html = renderToStaticMarkup(
			<ReadingLayout
				graph={graph}
				kapitel={kapitel}
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
		expect(html.match(/data-slot="themen-weg"/g)).toHaveLength(1)
		expect(html).toContain('data-slot="themen-weg-column"')
		expect(html).toContain(`Themen-Weg · ${graph.kapitel.length} Kapitel`)
	})

	it('renders an empty Randspalte slot when none is given', () => {
		const html = renderToStaticMarkup(
			<ReadingLayout graph={graph} kapitel={kapitel}>
				<p>Kapitelinhalt</p>
			</ReadingLayout>,
		)

		expect(html).toContain('data-slot="randspalte"')
	})
})
