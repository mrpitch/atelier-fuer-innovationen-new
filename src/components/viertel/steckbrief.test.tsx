import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { t } from '@/lib/dictionary'

import { Steckbrief } from './steckbrief'

const steckbrief = {
	prozessansatz: 'Ansatz A',
	bauform: 'Bauform B',
	prozessdokument: 'Dokument C',
	imStadtzentrum: 'Zentrum D',
}

describe('Steckbrief', () => {
	it('renders the four Fakten as label/value pairs in a description list', () => {
		const html = renderToStaticMarkup(<Steckbrief steckbrief={steckbrief} />)

		expect(html).toMatch(/^<dl/)
		expect(html.match(/data-slot="steckbrief-fakt"/g)).toHaveLength(4)
		for (const [key, wert] of [
			['prozessansatz', steckbrief.prozessansatz],
			['bauform', steckbrief.bauform],
			['prozessdokument', steckbrief.prozessdokument],
			['imStadtzentrum', steckbrief.imStadtzentrum],
		] as const) {
			expect(html).toContain(t(`viertel.steckbrief.${key}`))
			expect(html).toContain(wert)
		}
	})

	it('sets the values in the display serif, not the body serif', () => {
		const html = renderToStaticMarkup(<Steckbrief steckbrief={steckbrief} />)

		expect(html).toContain('font-heading')
		expect(html).not.toContain('font-serif')
	})
})
