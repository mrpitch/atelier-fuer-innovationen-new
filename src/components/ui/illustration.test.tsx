import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from '@/components/ui/illustrations/expect-token-coloured-svg'
import { contentGraph } from '@/lib/content'

import { Illustration } from './illustration'

// One entry per Viertel, the Zentrum, every Thema and every Rundgang with
// content (issue #88, #89, #90, #91). rundgaenge/besuch-in-der-umgebung has
// no content yet, so it's covered by name below instead of a table entry.
const EXPORTED_DRAWINGS: ReadonlyArray<{
	id: string
	resolve: (graph: ReturnType<typeof contentGraph>) => { id: string; title: string } | undefined
}> = [
	{ id: 'stadt/annaeherung', resolve: (graph) => graph.getViertel('stadt/annaeherung') },
	{
		id: 'stadt/maerkte-kooperation',
		resolve: (graph) => graph.getViertel('stadt/maerkte-kooperation'),
	},
	{ id: 'stadt/kontexte', resolve: (graph) => graph.getViertel('stadt/kontexte') },
	{ id: 'stadt/inszenierung', resolve: (graph) => graph.getViertel('stadt/inszenierung') },
	{ id: 'stadt/zukunft', resolve: (graph) => graph.getViertel('stadt/zukunft') },
	{ id: 'stadt/wertschoepfung', resolve: (graph) => graph.getViertel('stadt/wertschoepfung') },
	{ id: 'stadt/potenziale', resolve: (graph) => graph.getViertel('stadt/potenziale') },
	{ id: 'stadt/fuehrung', resolve: (graph) => graph.getViertel('stadt/fuehrung') },
	{ id: 'stadt/zentrum', resolve: (graph) => graph.zentrum },
	{
		id: 'themen/eine-welt-fuer-morgen',
		resolve: (graph) => graph.getThema('themen/eine-welt-fuer-morgen'),
	},
	{ id: 'themen/futursysteme', resolve: (graph) => graph.getThema('themen/futursysteme') },
	{
		id: 'themen/netzwerk-der-innovatoren',
		resolve: (graph) => graph.getThema('themen/netzwerk-der-innovatoren'),
	},
	{
		id: 'rundgaenge/erste-annaeherung',
		resolve: (graph) => graph.getRundgang('rundgaenge/erste-annaeherung'),
	},
	{
		id: 'rundgaenge/besuch-im-zentrum',
		resolve: (graph) => graph.getRundgang('rundgaenge/besuch-im-zentrum'),
	},
]

describe('Illustration registry', () => {
	it.each(EXPORTED_DRAWINGS)('renders the real drawing for $id', ({ id, resolve }) => {
		const document = resolve(contentGraph())
		if (!document) throw new Error(`fixture gap: "${id}" is missing from the real content graph`)

		const html = renderToStaticMarkup(<Illustration id={document.id} label={document.title} />)

		expect(html).toContain(`aria-label="${document.title.replaceAll('&', '&amp;')}"`)
		expectTokenColouredSvg(html)
	})

	it('renders the real drawing for rundgaenge/besuch-in-der-umgebung, which has no content yet', () => {
		const html = renderToStaticMarkup(
			<Illustration id="rundgaenge/besuch-in-der-umgebung" label="Besuch in der Umgebung" />,
		)

		expect(html).toContain('data-slot="illustration-besuch-in-der-umgebung"')
		expect(html).toContain('aria-label="Besuch in der Umgebung"')
		expectTokenColouredSvg(html)
	})

	it('throws naming the ID when nothing is registered for it', () => {
		expect(() =>
			renderToStaticMarkup(<Illustration id="stadt/nichtvorhanden" label="Nichtvorhanden" />),
		).toThrow(/stadt\/nichtvorhanden/)
	})
})
