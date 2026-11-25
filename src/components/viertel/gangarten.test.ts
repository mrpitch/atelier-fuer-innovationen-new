import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { buildLesenGangart, buildSchauenGangart } from './gangarten'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildSchauenGangart', () => {
	it('builds the Schauen Gangart-Karte for a Viertel on a Schauen Rundgang', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'gangarten-valid'))
		const viertel = graph.viertel.find((item) => item.id === 'stadt/mit-allem')
		if (!viertel) throw new Error('fixture missing stadt/mit-allem')

		const gangart = buildSchauenGangart(graph, viertel)
		const station = graph.getStation('rundgaenge/rundgang-a/station-mit-allem')
		const erste = graph.getStation('rundgaenge/rundgang-a/station-zentrum')

		expect(gangart?.badge).toContain('Testrundgang A')
		// "Station n · <Viertel>" names the Viertel ("Mit Allem"), not the
		// Station's own narrative title ("Station bei Mit Allem").
		expect(gangart?.title).toBe('Station 1 · Mit Allem')
		expect(gangart?.primary.href).toBe(station?.url)
		expect(gangart?.secondary.href).toBe(erste?.url)
		expect(gangart?.previous?.href).toBe(erste?.url)
		expect(gangart?.previous?.label).toBe('Station 0 · Testzentrum')
		expect(gangart?.next).toBeUndefined()
	})

	it('drops out when no Rundgang visits the Viertel', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'gangarten-valid'))
		const viertel = graph.viertel.find((item) => item.id === 'stadt/ohne-beides')
		if (!viertel) throw new Error('fixture missing stadt/ohne-beides')

		expect(buildSchauenGangart(graph, viertel)).toBeUndefined()
	})
})

describe('buildLesenGangart', () => {
	it('builds the Lesen Gangart-Karte for a Viertel with a Kapitel', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'gangarten-valid'))
		const viertel = graph.viertel.find((item) => item.id === 'stadt/mit-allem')
		if (!viertel) throw new Error('fixture missing stadt/mit-allem')

		const gangart = buildLesenGangart(graph, viertel)
		const kapitel = graph.getKapitelByViertel(viertel.id)

		expect(gangart?.badge).toContain('Testleitthema')
		expect(gangart?.title).toContain('Kapitel 1')
		expect(gangart?.primary.href).toBe(kapitel?.url)
		expect(gangart?.secondary.href).toBe(graph.leitthema?.url)
		expect(gangart?.previous).toBeUndefined()
		expect(gangart?.next).toBeUndefined()
	})

	it('drops out when the Viertel has no Kapitel', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'gangarten-valid'))
		const viertel = graph.viertel.find((item) => item.id === 'stadt/ohne-beides')
		if (!viertel) throw new Error('fixture missing stadt/ohne-beides')

		expect(buildLesenGangart(graph, viertel)).toBeUndefined()
	})
})
