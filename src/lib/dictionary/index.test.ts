import { describe, expect, it } from 'vitest'

import { t } from './index'

describe('t', () => {
	it('looks up a dictionary key', () => {
		expect(t('navigation.previous')).toBe('Vorherige Seite')
		expect(t('navigation.next')).toBe('Nächste Seite')
		expect(t('navigation.youAreHere')).toBe('Sie sind hier')
	})

	it('runs params through interpolate, leaving a template with no placeholders unchanged', () => {
		expect(t('navigation.previous', { unused: 'param' })).toBe('Vorherige Seite')
	})
})
