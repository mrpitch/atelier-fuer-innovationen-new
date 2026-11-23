import { describe, expect, it } from 'vitest'

import { formatTwoDigits } from './format-two-digits'

describe('formatTwoDigits', () => {
	it('pads a single digit with a leading zero', () => {
		expect(formatTwoDigits(1)).toBe('01')
	})

	it('leaves two digits as they are', () => {
		expect(formatTwoDigits(8)).toBe('08')
		expect(formatTwoDigits(12)).toBe('12')
	})
})
