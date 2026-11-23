import { describe, expect, it } from 'vitest'

import { abschnittUrl, kapitelUrl, pathUrl, stationUrl } from './urls'

describe('pathUrl', () => {
	it('is the folder path for German, with the root as /', () => {
		expect(pathUrl('')).toBe('/')
		expect(pathUrl('idee')).toBe('/idee')
		expect(pathUrl('stadt/kontexte')).toBe('/stadt/kontexte')
	})

	it('prefixes a locale and replaces the final segment with the translated slug', () => {
		expect(pathUrl('', { locale: 'xx' })).toBe('/xx')
		expect(pathUrl('', { locale: 'xx' }, 'start')).toBe('/xx/start')
		expect(pathUrl('stadt/kontexte', { locale: 'xx' }, 'contexts')).toBe('/xx/stadt/contexts')
	})

	it("uses an ancestor Seite's translated slug", () => {
		const scope = { locale: 'xx', slugOf: (id: string) => (id === 'stadt' ? 'city' : undefined) }
		expect(pathUrl('stadt/kontexte', scope)).toBe('/xx/city/kontexte')
		expect(pathUrl('stadt/kontexte', scope, 'contexts')).toBe('/xx/city/contexts')
	})
})

describe('derived URLs', () => {
	it('continue the parent URL with the number, or a translated slug', () => {
		expect(kapitelUrl('/stadt/kontexte', 3)).toBe('/stadt/kontexte/kapitel-3')
		expect(abschnittUrl('/stadt/kontexte/kapitel-3', 2)).toBe('/stadt/kontexte/kapitel-3/2')
		expect(stationUrl('/rundgaenge/besuch', 0)).toBe('/rundgaenge/besuch/0')
		expect(stationUrl('/xx/rundgaenge/besuch', 0, 'start')).toBe('/xx/rundgaenge/besuch/start')
	})
})
