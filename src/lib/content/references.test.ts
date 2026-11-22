import { describe, expect, it } from 'vitest'

import { ContentValidationError } from './errors'
import { resolveReference } from './references'

describe('resolveReference', () => {
	it('returns the matching target', () => {
		const targets = [{ id: 'a' }, { id: 'b' }]
		expect(resolveReference('doc.mdx', 'someId', 'b', targets)).toBe(targets[1])
	})

	it('fails naming the referring file, the field and the missing ID', () => {
		expect.assertions(4)

		try {
			resolveReference('doc.mdx', 'someId', 'nichtvorhanden', [{ id: 'a' }])
		} catch (error) {
			expect(error).toBeInstanceOf(ContentValidationError)
			const validationError = error as ContentValidationError
			expect(validationError.file).toBe('doc.mdx')
			expect(validationError.field).toBe('someId')
			expect(validationError.reason).toContain('nichtvorhanden')
		}
	})

	// The same function resolves a reference against any target collection —
	// here a second, unrelated shape (not Viertel) — proving the mechanism is
	// generic (issue #29): a later reference field reuses this call, not a
	// new resolution function.
	it('resolves against a second, unrelated target collection with no changes of its own', () => {
		interface Thema {
			readonly id: string
			readonly title: string
		}
		const themen: Thema[] = [{ id: 'eine-welt-fuer-morgen', title: 'Eine Welt für morgen' }]

		expect(resolveReference('doc.mdx', 'themaId', 'eine-welt-fuer-morgen', themen)).toBe(themen[0])
		expect(() => resolveReference('doc.mdx', 'themaId', 'unbekannt', themen)).toThrow(
			ContentValidationError,
		)
	})
})
