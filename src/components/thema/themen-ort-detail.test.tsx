import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'themen-ort-detail-valid'))
// The real getBody resolves MDX through a Vite dynamic import of src/content,
// which a fixture directory isn't part of; the body itself isn't under test.
const graph = { ...fixtureGraph, getBody: async () => () => null } as typeof fixtureGraph

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => graph,
}))

const { ThemenOrtDetail } = await import('./themen-ort-detail')

async function render(themaId: string) {
	const thema = graph.getThema(themaId)
	if (!thema) throw new Error(`fixture content has no ${themaId}`)
	return renderToStaticMarkup(await ThemenOrtDetail({ thema }))
}

describe('ThemenOrtDetail', () => {
	it('shows the Ortsleiste breadcrumb "Themen > Title"', async () => {
		const html = await render('themen/futursysteme')

		expect(html).toContain('data-slot="ortsleiste"')
		expect(html).toContain('Themen')
		expect(html).toContain('href="/themen"')
	})

	it('shows the Bild-Hero content and both of its actions', async () => {
		const html = await render('themen/futursysteme')

		expect(html).toContain('data-slot="bild-hero"')
		expect(html).toContain('THEMEN-ORT · VIERTEL 01 · ANNÄHERUNG')
		expect(html).toContain('zweigt bei Kapitel 1 ab')
		expect(html).toContain('Futursysteme')
		expect(html).toContain('Platzhalter-Leitsatz für den Themen-Ort Futursysteme')
		expect(html).toContain('Ins Viertel der Annäherung')
		expect(html).toContain('href="/stadt/annaeherung"')
		expect(html).toContain('Kapitel 1 lesen')
		expect(html).toContain('href="/stadt/annaeherung/kapitel-1"')
	})

	it('shows the Gangart-Box naming the branch Kapitel, with a link to the Leitthema', async () => {
		const html = await render('themen/futursysteme')

		expect(html).toContain('data-slot="gangart-box"')
		expect(html).toContain('ZURÜCK ZUM THEMEN-WEG')
		expect(html).toContain('Kapitel 1 · Ankunft')
		expect(html).toContain('Im Viertel der Annäherung zweigt dieser Themen-Ort vom Leitthema ab.')
		expect(html).toContain('Leitthema „Eine Welt für morgen“')
		expect(html).toContain('href="/themen/eine-welt-fuer-morgen"')
	})

	it('shows "Weiterführend" when weiterfuehrendIds resolve to Aufsätze', async () => {
		const html = await render('themen/futursysteme')

		expect(html).toContain('WEITERFÜHREND')
		expect(html).toContain('Erster Aufsatz')
		expect(html).toContain('href="/bibliothek/aufsaetze/erster-aufsatz"')
	})

	it('leaves out "Weiterführend" when weiterfuehrendIds is unset', async () => {
		const html = await render('themen/netzwerk-der-innovatoren')

		expect(html).not.toContain('WEITERFÜHREND')
	})

	it('leaves out "Weiterführend" when weiterfuehrendIds is empty', async () => {
		const thema = graph.getThema('themen/futursysteme')
		if (!thema) throw new Error('fixture content has no themen/futursysteme')
		const html = renderToStaticMarkup(
			await ThemenOrtDetail({ thema: { ...thema, weiterfuehrendIds: [], weiterfuehrend: [] } }),
		)

		expect(html).not.toContain('WEITERFÜHREND')
	})

	it('shows the Ortsleiste previous link to the Leitthema for the first Themen-Ort, and no next for the last', async () => {
		const first = await render('themen/futursysteme')
		expect(first).toContain('← Eine Welt für morgen')
		expect(first).toContain('Netzwerk der Innovatoren →')

		const last = await render('themen/netzwerk-der-innovatoren')
		expect(last).toContain('← Futursysteme')
		expect(last).not.toContain(' →')
	})
})
