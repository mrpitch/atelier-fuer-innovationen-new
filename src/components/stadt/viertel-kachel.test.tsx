import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { ViertelKachel } from './viertel-kachel'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function graph() {
	return buildContentGraph(path.join(fixturesDir, 'stadtplan-valid'))
}

describe('ViertelKachel', () => {
	it('links to the Viertel page and shows the Hinweis when one is set', () => {
		const viertel = graph().getViertel('stadt/annaeherung')
		if (!viertel) throw new Error('fixture is missing stadt/annaeherung')

		const html = renderToStaticMarkup(
			<ViertelKachel
				href={viertel.url}
				nummer="VIERTEL 01"
				pointer="→ Idee"
				title={viertel.title}
				untertitel="Was ist und bietet Xenia?"
				illustrationId={viertel.id}
				illustrationLabel={viertel.title}
			/>,
		)

		expect(html).toContain('data-slot="viertel-kachel"')
		expect(html).toContain('data-variant="viertel"')
		expect(html).toContain(`href="${viertel.url}"`)
		expect(html).toContain('VIERTEL 01')
		expect(html).toContain('→ Idee')
		expect(html).toContain(viertel.title)
		expect(html).toContain('Was ist und bietet Xenia?')
	})

	it('hides the Hinweis when none is set', () => {
		const viertel = graph().getViertel('stadt/maerkte-kooperation')
		if (!viertel) throw new Error('fixture is missing stadt/maerkte-kooperation')

		const html = renderToStaticMarkup(
			<ViertelKachel
				href={viertel.url}
				nummer="VIERTEL 02"
				title={viertel.title}
				untertitel="Ideen, Kontakte, Begegnung"
				illustrationId={viertel.id}
				illustrationLabel={viertel.title}
			/>,
		)

		expect(html).not.toContain('→')
	})

	it('links to the Zentrum page for the Zentrum variant, with no Hinweis', () => {
		const zentrum = graph().zentrum
		if (!zentrum) throw new Error('fixture is missing its Zentrum')

		const html = renderToStaticMarkup(
			<ViertelKachel
				href={zentrum.url}
				nummer="ZENTRUM"
				pointer="↗"
				title={zentrum.title}
				illustrationId={zentrum.id}
				illustrationLabel={zentrum.title}
				variant="zentrum"
			/>,
		)

		expect(html).toContain('data-variant="zentrum"')
		expect(html).toContain(`href="${zentrum.url}"`)
		expect(html).toContain('ZENTRUM')
		expect(html).toContain('↗')
	})
})
