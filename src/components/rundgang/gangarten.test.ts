import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { buildStationGangart, resolveOrt } from './gangarten'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'station-detail-valid'))

describe('resolveOrt', () => {
	it('resolves a Viertel ortId to that Viertel', () => {
		const ort = resolveOrt(graph, 'stadt/kontexte')

		expect(ort?.id).toBe('stadt/kontexte')
	})

	it("resolves the Zentrum's own ortId to the Zentrum", () => {
		const ort = resolveOrt(graph, graph.zentrum?.id)

		expect(ort?.id).toBe(graph.zentrum?.id)
	})

	it('is undefined for an undefined ortId', () => {
		expect(resolveOrt(graph, undefined)).toBeUndefined()
	})
})

describe('buildStationGangart', () => {
	it('builds "Kapitel n lesen" into the Viertel\'s own Kapitel, naming the Leitthema\'s illustration', () => {
		const viertel = graph.viertel.find((item) => item.id === 'stadt/kontexte')
		if (!viertel) throw new Error('fixture missing stadt/kontexte')
		const kapitel = graph.getKapitelByViertel(viertel.id)

		const gangart = buildStationGangart(graph, viertel)

		expect(gangart.aktion?.illustrationId).toBe(graph.leitthema?.id)
		expect(gangart.aktion?.illustrationLabel).toBe(graph.leitthema?.title)
		expect(gangart.aktion?.aktionLabel).toBe('Kapitel 1 lesen')
		expect(gangart.aktion?.aktionHref).toBe(kapitel?.url)
		expect(gangart.erkundenLabel).toBe('oder Viertel 01 frei erkunden')
		expect(gangart.erkundenHref).toBe(viertel.url)
	})

	it('builds "Einführung lesen" for the Zentrum instead, with its own Zentrum wording', () => {
		if (!graph.zentrum) throw new Error('fixture missing the Zentrum')

		const gangart = buildStationGangart(graph, graph.zentrum)

		expect(gangart.aktion?.aktionLabel).toBe('Einführung lesen')
		expect(gangart.erkundenLabel).toBe('oder das Zentrum frei erkunden')
		expect(gangart.erkundenHref).toBe(graph.zentrum.url)
	})

	it('omits only the aktion, not the Viertel link, for a Viertel with no Kapitel of its own', () => {
		const viertel = graph.viertel.find((item) => item.id === 'stadt/fuehrung')
		if (!viertel) throw new Error('fixture missing stadt/fuehrung')
		expect(graph.getKapitelByViertel(viertel.id)).toBeUndefined()

		const gangart = buildStationGangart(graph, viertel)

		expect(gangart.aktion).toBeUndefined()
		expect(gangart.erkundenLabel).toBe('oder Viertel 02 frei erkunden')
		expect(gangart.erkundenHref).toBe(viertel.url)
	})
})
