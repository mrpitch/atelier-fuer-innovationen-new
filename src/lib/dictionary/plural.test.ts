import { describe, expect, it } from 'vitest'

import { pluralForm } from './plural'

describe('pluralForm', () => {
	it('returns "one" for a count of 1', () => {
		expect(pluralForm(1)).toBe('one')
	})

	it('returns "other" for a count of 0', () => {
		expect(pluralForm(0)).toBe('other')
	})

	it('returns "other" for a count greater than 1', () => {
		expect(pluralForm(2)).toBe('other')
		expect(pluralForm(8)).toBe('other')
	})
})
