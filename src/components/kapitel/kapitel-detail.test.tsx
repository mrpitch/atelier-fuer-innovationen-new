import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'kapitel-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { KapitelDetail } = await import('./kapitel-detail')

async function render(kapitelId: string) {
	const kapitel = graph.getKapitel(kapitelId)
	if (!kapitel) throw new Error(`fixture content has no ${kapitelId}`)
	return renderToStaticMarkup(await KapitelDetail({ kapitel }))
}

describe('KapitelDetail', () => {
	it('shows the next-Kapitel link and marks the first Abschnitt "Hier beginnen"', async () => {
		const html = await render('leitthema/erstes-kapitel')

		expect(html).toContain(`href="${graph.getKapitel('leitthema/zweites-kapitel')!.url}"`)
		expect(html).toContain('Zweites Kapitel')
		expect(html).toContain('Weiter')
		expect(html.match(/Hier beginnen/g)).toHaveLength(1)
	})

	it("shows the next Kapitel's Viertel illustration in its Item", async () => {
		const html = await render('leitthema/erstes-kapitel')
		const title = html.indexOf('Kapitel 2 · Zweites Kapitel')
		const nextItem = html.slice(html.lastIndexOf('<a data-slot="item"', title), title)

		expect(nextItem).toContain('data-slot="item-media"')
		expect(nextItem).toContain('data-slot="illustration-kontexte"')
	})

	it('leaves out the next-Kapitel link on the last Kapitel, and "Hier beginnen" without Abschnitte', async () => {
		const html = await render('leitthema/zweites-kapitel')

		expect(html).not.toContain('Weiter')
		expect(html).not.toContain('Hier beginnen')
	})

	it('throws when the Kapitel names an unknown Viertel', async () => {
		const kapitel = {
			...graph.getKapitel('leitthema/erstes-kapitel')!,
			viertelId: 'stadt/gibt-es-nicht',
		}

		await expect(KapitelDetail({ kapitel })).rejects.toThrow('unknown Viertel ID')
	})
})
