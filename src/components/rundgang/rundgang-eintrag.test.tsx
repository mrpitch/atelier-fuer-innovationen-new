import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { RundgangEintrag } from './rundgang-eintrag'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-eintrag-valid'))

function render(rundgangId: string) {
	const rundgang = graph.getRundgang(rundgangId)
	if (!rundgang) throw new Error(`fixture content has no ${rundgangId}`)
	const stationen = graph.getStationenByRundgang(rundgang.id)
	return renderToStaticMarkup(<RundgangEintrag rundgang={rundgang} stationen={stationen} />)
}

describe('RundgangEintrag', () => {
	it('shows the Kennzeichen badge when the Rundgang has one', () => {
		const html = render('rundgaenge/erste-annaeherung')

		expect(html).toContain('data-slot="badge"')
		expect(html).toContain('Einstieg')
	})

	it('omits the Kennzeichen badge when the Rundgang has none', () => {
		const html = render('rundgaenge/besuch-im-zentrum')

		expect(html).not.toContain('Einstieg')
	})

	it('renders a Stopp for a Station at an Ort and a Routen-Stopp for one without, both "offen"', () => {
		const html = render('rundgaenge/erste-annaeherung')

		expect(html.match(/data-slot="stopp"/g)).toHaveLength(1)
		expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(1)
		expect(html).not.toContain('data-status="aktuell"')
		expect(html.match(/data-status="offen"/g)).toHaveLength(2)
	})

	it('renders only a Routen-Stopp for a Rundgang whose only Station has no Ort', () => {
		const html = render('rundgaenge/besuch-im-zentrum')

		expect(html).not.toContain('data-slot="stopp"')
		expect(html.match(/data-slot="routen-stopp"/g)).toHaveLength(1)
	})

	it('links "Rundgang starten" to the first Station and "Route ansehen" to the Rundgang itself', () => {
		const rundgang = graph.getRundgang('rundgaenge/erste-annaeherung')
		if (!rundgang) throw new Error('fixture missing rundgaenge/erste-annaeherung')
		const [firstStation] = graph.getStationenByRundgang(rundgang.id)
		if (!firstStation) throw new Error('fixture missing a Station')

		const html = render('rundgaenge/erste-annaeherung')

		expect(html).toContain(`href="${firstStation.url}"`)
		expect(html).toContain(`href="${rundgang.url}"`)
		expect(html).toContain('Rundgang starten')
		expect(html).toContain('Route ansehen')
	})

	it('shows each Station as its own "n · Name" badge', () => {
		const html = render('rundgaenge/erste-annaeherung')

		expect(html).toContain('0 · Am Zentrum')
		expect(html).toContain('1 · Stätten der Begegnung')
	})
})
