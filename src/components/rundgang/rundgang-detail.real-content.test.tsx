import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// The real `src/content` Rundgänge (issue #116's placeholder content), not a
// fixture: the acceptance criterion names these three Rundgänge by their own
// route shape, so it's this content the test exercises (Testing
// conventions' own precedent: illustration.test.tsx covers the real content
// graph the same way). `getBody` is still stubbed — Vitest's dynamic import
// can't resolve a multi-segment id like a Next/Turbopack build can (the same
// reason every other Detail test stubs it against a fixture graph) — but the
// Rundgänge, Stationen, Themen and their order all come from the real graph.
vi.mock('@/lib/content', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/content')>()
	const realGraph = actual.contentGraph()
	const graph = { ...realGraph, getBody: async () => () => null }
	return { ...actual, contentGraph: () => graph }
})

const { contentGraph } = await import('@/lib/content')
const { RundgangDetail } = await import('./rundgang-detail')

const graph = contentGraph()

describe('RundgangDetail against the real content graph (issue #118)', () => {
	it("shows Besuch im Zentrum's route as nine Stopps with their Orte's illustrations", async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-im-zentrum')
		if (!rundgang) throw new Error('missing rundgaenge/besuch-im-zentrum')

		const html = renderToStaticMarkup(await RundgangDetail({ rundgang }))

		expect(html.match(/data-slot="stopp"/g)).toHaveLength(9)
		expect(html).not.toContain('data-slot="routen-stopp"')
	})

	it("shows Erste Annäherung's route as five Routen-Stopps", async () => {
		const rundgang = graph.getRundgang('rundgaenge/erste-annaeherung')
		if (!rundgang) throw new Error('missing rundgaenge/erste-annaeherung')

		const html = renderToStaticMarkup(await RundgangDetail({ rundgang }))

		expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(5)
		expect(html).not.toContain('data-slot="stopp"')
	})

	it('omits "Nach dem Rundgang" entirely on the last Rundgang with no Thema', async () => {
		const rundgang = graph.getRundgang('rundgaenge/besuch-in-der-umgebung')
		if (!rundgang) throw new Error('missing rundgaenge/besuch-in-der-umgebung')

		const html = renderToStaticMarkup(await RundgangDetail({ rundgang }))

		expect(html).not.toContain('data-slot="nach-dem-rundgang-section"')
	})
})
