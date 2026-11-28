import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ViertelTeaser } from './viertel-teaser'

describe('ViertelTeaser', () => {
	it('is the component mdx-components.tsx registers, resolving its own ID against the content graph', () => {
		// stadt/annaeherung is a real Viertel (src/content), not a fixture:
		// unlike ViertelTeaserCard, ViertelTeaser is the component content
		// actually uses in a body — it reads the real content graph itself
		// (content-layer.md), so it can't be pointed at a fixture directory.
		const html = renderToStaticMarkup(<ViertelTeaser id="stadt/annaeherung" />)

		expect(html).toContain('Annäherung')
		expect(html).toContain('href="/stadt/annaeherung"')
	})

	it('throws naming the ID when given an unknown Viertel', () => {
		expect(() => renderToStaticMarkup(<ViertelTeaser id="stadt/nichtvorhanden" />)).toThrow(
			/stadt\/nichtvorhanden/,
		)
	})
})
