import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { evaluateSync } from '@mdx-js/mdx'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ViertelTeaserCard } from '@/components/viertel/viertel-teaser-card'
import { buildContentGraph } from '@/lib/content'

import { useMDXComponents } from './mdx-components'

const fixturesDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'lib/content/__fixtures__',
)

// Compiles an MDX body through @mdx-js/mdx the way Next's own MDX pipeline
// would (issue #35), rather than rendering ViertelTeaser directly from React —
// this is what proves a body actually resolves components through the map, not
// just that the component itself works in isolation.
describe('useMDXComponents', () => {
	it('is the map a compiled MDX body resolves ViertelTeaser through, with data from the content graph', () => {
		const body = 'Text.\n\n<ViertelTeaser id="stadt/annaeherung" />\n'

		const { default: Content } = evaluateSync(body, { Fragment, jsx, jsxs, useMDXComponents })
		const html = renderToStaticMarkup(<Content />)

		expect(html).toContain('Annäherung')
		expect(html).toContain('href="/stadt/annaeherung"')
	})

	it('renders a fixture MDX body with the Viertel teaser resolved from the fixture graph', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'body-valid'))
		const start = graph.getSeite('')
		if (!start) throw new Error('fixture is missing the root Seite')

		// ViertelTeaser itself reads the real content directory, so the fixture
		// body gets a map whose teaser resolves against the fixture graph and
		// renders the same card.
		const components = {
			ViertelTeaser({ id }: { id: string }) {
				const viertel = graph.getViertel(id)
				if (!viertel) throw new Error(`fixture is missing Viertel ${id}`)
				return <ViertelTeaserCard viertel={viertel} />
			},
		}
		const { default: Content } = evaluateSync(start.body, {
			Fragment,
			jsx,
			jsxs,
			useMDXComponents: () => components,
		})
		const html = renderToStaticMarkup(<Content />)

		expect(html).toContain('data-slot="viertel-teaser"')
		expect(html).toContain('Platzhalter-Leitsatz.')
		expect(html).toContain('href="/stadt/erste-viertel"')
	})
})
