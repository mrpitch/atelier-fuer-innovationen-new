import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'abschnitt-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { AbschnittDetail } = await import('./abschnitt-detail')

const abschnitte = graph.getAbschnitteByKapitel('leitthema/mein-kapitel')
const [erster, zweiter, dritter] = abschnitte
const [ersterDesZweitenKapitels] = graph.getAbschnitteByKapitel('leitthema/zweites-kapitel')

async function render(abschnitt: (typeof abschnitte)[number]) {
	return renderToStaticMarkup(await AbschnittDetail({ abschnitt }))
}

describe('AbschnittDetail', () => {
	it('shows the Tagline with the year when the Abschnitt has one', async () => {
		const html = await render(zweiter!)

		expect(html).toContain(`Abschnitt ${zweiter!.number}`)
		expect(html).toContain('Text von 1996')
		// CSS `capitalize` would show "Text Von 1996"; label text stays as typed.
		expect(html).not.toMatch(/data-slot="tagline" class="[^"]*\bcapitalize\b/)
	})

	it('leaves the year out of the Tagline without one', async () => {
		const html = await render(erster!)

		expect(html).toContain(`Abschnitt ${erster!.number}`)
		expect(html).not.toContain('Text von')
	})

	it('shows only the next Item on the first Abschnitt', async () => {
		const html = await render(erster!)

		expect(html).not.toContain('Vorheriger Abschnitt')
		expect(html).toContain('Nächster Abschnitt')
		expect(html).toContain(`href="${zweiter!.url}"`)
	})

	it('shows only the previous Item on the last Abschnitt overall', async () => {
		const html = await render(ersterDesZweitenKapitels!)

		expect(html).toContain('Vorheriger Abschnitt')
		expect(html).not.toContain('Nächster Abschnitt')
		expect(html).toContain(`href="${dritter!.url}"`)
	})

	it('shows both Items on a middle Abschnitt', async () => {
		const html = await render(zweiter!)

		expect(html).toContain('Vorheriger Abschnitt')
		expect(html).toContain('Nächster Abschnitt')
		expect(html).toContain(`href="${erster!.url}"`)
		expect(html).toContain(`href="${dritter!.url}"`)
	})

	it("crosses into the next Kapitel's first Abschnitt for a Kapitel's own last Abschnitt", async () => {
		const html = await render(dritter!)

		expect(html).toContain('Nächster Abschnitt')
		expect(html).toContain(`href="${ersterDesZweitenKapitels!.url}"`)
	})

	it("reuses the Kapitel page's Randspalte for the Abschnitt's own Viertel", async () => {
		const html = await render(zweiter!)

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).toContain('IM VIERTEL AUSSERDEM')
	})
})
