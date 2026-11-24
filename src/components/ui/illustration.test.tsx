import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from '@/components/ui/illustrations/expect-token-coloured-svg'
import { contentGraph } from '@/lib/content'

import { Illustration } from './illustration'

const graph = contentGraph()

// Every Viertel, the Zentrum, every Thema and every Rundgang in the content
// graph, so a new document is covered without a test edit (issues #88-#91).
// rundgaenge/besuch-in-der-umgebung has no content yet, so it's covered by
// name below.
const DOCUMENTS = [
	...graph.viertel,
	...(graph.zentrum ? [graph.zentrum] : []),
	...graph.themen,
	...graph.rundgaenge,
].map(({ id, title }) => ({ id, title }))

describe('Illustration registry', () => {
	it.each(DOCUMENTS)('renders the real drawing for $id', ({ id, title }) => {
		const html = renderToStaticMarkup(<Illustration id={id} label={title} />)

		expect(html).toContain(`aria-label="${title.replaceAll('&', '&amp;')}"`)
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
