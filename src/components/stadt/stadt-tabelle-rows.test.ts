import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { buildStadtTabelle } from './stadt-tabelle-rows'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function graph() {
	return buildContentGraph(path.join(fixturesDir, 'stadt-tabelle-valid'))
}

describe('buildStadtTabelle', () => {
	it("names the Zentrum's Schauen Rundgang and the Leitthema in the headings", () => {
		const current = graph()
		const { headings } = buildStadtTabelle(current, current.viertel, current.zentrum)

		expect(headings.station).toBe('Rundgang „Testrundgang A“')
		expect(headings.kapitel).toBe('Themen-Weg „Testleitthema“')
	})

	it('builds the Zentrum row with "Einführung" linking to the Leitthema, and no Themen-Ort', () => {
		const current = graph()
		const leitthema = current.getThema('themen/thema-leit')
		if (!leitthema || !current.zentrum)
			throw new Error('fixture is missing the Leitthema or Zentrum')

		const { rows } = buildStadtTabelle(current, current.viertel, current.zentrum)
		const zentrumRow = rows[0]

		expect(zentrumRow.ort).toEqual({ label: 'Testzentrum', href: current.zentrum.url })
		expect(zentrumRow.station.label).toBe('Station 0 · Station am Zentrum')
		expect(zentrumRow.kapitel).toEqual({ label: 'Einführung', href: leitthema.url })
		expect(zentrumRow.themenOrt).toEqual({ label: '–' })
	})

	it('builds a Viertel row with its Kapitel and the Themen-Ort branching off it', () => {
		const current = graph()
		const mitAllem = current.getViertel('stadt/mit-allem')
		const kapitel = current.getKapitel('leitthema/kapitel-mit-allem')
		const themenOrt = current.getThema('themen/thema-ort')
		if (!mitAllem || !kapitel || !themenOrt)
			throw new Error('fixture is missing expected documents')

		const { rows } = buildStadtTabelle(current, current.viertel, current.zentrum)
		const mitAllemRow = rows[1]

		expect(mitAllemRow.ort).toEqual({ label: 'Viertel 01 · Mit Allem', href: mitAllem.url })
		expect(mitAllemRow.station.label).toBe('Station 1 · Station bei Mit Allem')
		expect(mitAllemRow.kapitel).toEqual({
			label: 'Kapitel 1 · Kapitel mit Allem',
			href: kapitel.url,
		})
		expect(mitAllemRow.themenOrt).toEqual({
			label: 'Testthemenort – zweigt bei Kapitel 1 ab',
			href: themenOrt.url,
		})
	})

	it('uses "–" for a Viertel with no Kapitel or Themen-Ort, and whose only Station is in a Rundgang the header does not name', () => {
		const current = graph()
		const ohneKapitel = current.getViertel('stadt/ohne-kapitel')
		if (!ohneKapitel) throw new Error('fixture is missing stadt/ohne-kapitel')

		const { rows } = buildStadtTabelle(current, current.viertel, current.zentrum)
		const ohneKapitelRow = rows[2]

		expect(ohneKapitelRow.ort).toEqual({
			label: 'Viertel 02 · Ohne Kapitel',
			href: ohneKapitel.url,
		})
		expect(ohneKapitelRow.station).toEqual({ label: '–' })
		expect(ohneKapitelRow.kapitel).toEqual({ label: '–' })
		expect(ohneKapitelRow.themenOrt).toEqual({ label: '–' })
	})
})
