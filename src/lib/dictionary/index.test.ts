import { describe, expect, it } from 'vitest'

import { t } from './index'

describe('t', () => {
	it('looks up a dictionary key', () => {
		expect(t('navigation.youAreHere')).toBe('Sie sind hier')
		expect(t('layout.headerMenu')).toBe('Hauptnavigation')
	})

	it('runs params through interpolate, leaving a template with no placeholders unchanged', () => {
		expect(t('navigation.youAreHere', { unused: 'param' })).toBe('Sie sind hier')
	})

	it('fills a key whose separator lives in the dictionary', () => {
		expect(t('navigation.previousLink', { title: 'Idee' })).toBe('Vorherige Seite: Idee')
		expect(t('kapitel.numberedTitle', { n: 2, title: 'Märkte' })).toBe('Kapitel 2: Märkte')
		expect(t('rundgang.summary', { stationen: '3 Stationen', duration: 'ca. 20 Min.' })).toBe(
			'3 Stationen · ca. 20 Min.',
		)
	})
})
