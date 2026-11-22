import { evaluateSync } from '@mdx-js/mdx'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useMDXComponents } from './mdx-components'

// Compiles a fixture MDX body through @mdx-js/mdx the way Next's own MDX
// pipeline would (issue #35), rather than rendering ViertelTeaser directly
// from React — this is what proves a body actually resolves the registered
// component set, not just that the component itself works in isolation.
describe('useMDXComponents', () => {
	it('is the map a compiled MDX body resolves ViertelTeaser through, with data from the content graph', () => {
		const body = 'Text.\n\n<ViertelTeaser id="stadt/annaeherung" />\n'

		const { default: Content } = evaluateSync(body, { Fragment, jsx, jsxs, useMDXComponents })
		const html = renderToStaticMarkup(<Content />)

		expect(html).toContain('Annäherung')
		expect(html).toContain('href="/stadt/annaeherung"')
	})
})
