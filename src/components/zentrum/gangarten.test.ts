import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildContentGraph } from '@/lib/content'

import { buildZentrumLesenGangart } from './gangarten'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildZentrumLesenGangart', () => {
	it('builds the Lesen Gangart-Karte as the Leitthema\'s own "Einführung"', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'zentrum-gangarten-valid'))

		const gangart = buildZentrumLesenGangart(graph)

		expect(gangart?.badge).toContain('Testleitthema')
		expect(gangart?.title).toBe('Einführung')
		expect(gangart?.primary.href).toBe(graph.leitthema?.url)
		expect(gangart?.secondary.href).toBe(graph.leitthema?.url)
	})

	it('drops out when the graph has no Leitthema', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'zentrum-ohne-leitthema'))

		expect(buildZentrumLesenGangart(graph)).toBeUndefined()
	})
})
