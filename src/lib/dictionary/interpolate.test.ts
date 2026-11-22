import { describe, expect, it } from 'vitest'

import { interpolate } from './interpolate'

describe('interpolate', () => {
	it('replaces a {placeholder} with the matching param', () => {
		expect(interpolate('Station {current} von {total}', { current: 3, total: 8 })).toBe(
			'Station 3 von 8',
		)
	})

	it('leaves a placeholder untouched when no matching param is given', () => {
		expect(interpolate('Station {current} von {total}', { current: 3 })).toBe(
			'Station 3 von {total}',
		)
	})

	it('returns the template unchanged when it has no placeholders', () => {
		expect(interpolate('Sie sind hier', {})).toBe('Sie sind hier')
	})
})
