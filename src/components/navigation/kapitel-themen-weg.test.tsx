import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph, shortTitleOrTitle } from '@/lib/content'

import { KapitelThemenWeg } from './kapitel-themen-weg'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'themen-weg-valid'))
const [firstKapitel, secondKapitel] = graph.kapitel

describe('KapitelThemenWeg', () => {
	it('marks the given Kapitel active and leaves the others collapsed, on a Kapitel page', () => {
		const html = renderToStaticMarkup(<KapitelThemenWeg graph={graph} kapitel={firstKapitel} />)

		expect(html).toContain(`href="${firstKapitel.url}"`)
		expect(html.match(new RegExp(`<a[^>]*href="${firstKapitel.url}"[^>]*>`))?.[0]).toContain(
			'data-active=""',
		)
		expect(html.match(new RegExp(`<a[^>]*href="${secondKapitel.url}"[^>]*>`))?.[0]).not.toContain(
			'data-active=""',
		)
		expect(html).not.toContain('data-slot="sidebar-menu-sub"')
	})

	it('expands only the current Kapitel to its Abschnitte, with the current Abschnitt marked, on an Abschnitt page', () => {
		const abschnitte = graph.getAbschnitteByKapitel(firstKapitel.id)
		const [firstAbschnitt, secondAbschnitt] = abschnitte
		expect(secondAbschnitt).toBeDefined()

		const html = renderToStaticMarkup(
			<KapitelThemenWeg graph={graph} kapitel={firstKapitel} abschnitt={firstAbschnitt} />,
		)

		expect(html).toContain(`href="${firstAbschnitt.url}"`)
		expect(html).toContain(`href="${secondAbschnitt.url}"`)
		expect(html.match(new RegExp(`<a[^>]*href="${firstAbschnitt.url}"[^>]*>`))?.[0]).toContain(
			'data-active=""',
		)
		expect(html.match(new RegExp(`<a[^>]*href="${secondAbschnitt.url}"[^>]*>`))?.[0]).not.toContain(
			'data-active=""',
		)
		// The expanded Kapitel's own row stays non-active; only the nested
		// Abschnitt is marked (Figma 36590:9190, State=Default vs. Active).
		expect(html.match(new RegExp(`<a[^>]*href="${firstKapitel.url}"[^>]*>`))?.[0]).not.toContain(
			'data-active=""',
		)
	})

	it('names the Leitthema in the heading', () => {
		const leitthema = graph.themen.find((thema) => thema.kapitelId === undefined)
		if (!leitthema) throw new Error('fixture content has no Leitthema')

		const html = renderToStaticMarkup(<KapitelThemenWeg graph={graph} kapitel={firstKapitel} />)

		expect(html).toContain(shortTitleOrTitle(leitthema))
	})
})
