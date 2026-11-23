import { describe, expect, it } from 'vitest'

import { ContentValidationError } from './errors'
import { resolveReference } from './references'

const referrer = { file: 'doc.mdx', draft: false }
function production(document: { readonly draft: boolean }) {
	return !document.draft
}
function development() {
	return true
}

describe('resolveReference', () => {
	it('returns the matching target', () => {
		const targets = [
			{ id: 'a', draft: false },
			{ id: 'b', draft: false },
		]
		expect(resolveReference(referrer, 'someId', 'b', targets, production)).toBe(targets[1])
	})

	it('fails naming the referring file, the field and the missing ID', () => {
		expect.assertions(4)

		try {
			resolveReference(
				referrer,
				'someId',
				'nichtvorhanden',
				[{ id: 'a', draft: false }],
				production,
			)
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
			readonly draft: boolean
			readonly title: string
		}
		const themen: Thema[] = [
			{ id: 'eine-welt-fuer-morgen', draft: false, title: 'Eine Welt für morgen' },
		]

		expect(resolveReference(referrer, 'themaId', 'eine-welt-fuer-morgen', themen, production)).toBe(
			themen[0],
		)
		expect(() => resolveReference(referrer, 'themaId', 'unbekannt', themen, production)).toThrow(
			ContentValidationError,
		)
	})

	describe('Drafts (issue #33)', () => {
		const targets = [{ id: 'stadt/entwurf', draft: true }]

		it('fails a published referrer naming a Draft, naming both files', () => {
			expect.assertions(3)

			try {
				resolveReference(referrer, 'viertelId', 'stadt/entwurf', targets, production)
			} catch (error) {
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('doc.mdx')
				expect(validationError.field).toBe('viertelId')
				expect(validationError.reason).toContain('stadt/entwurf/index.mdx')
			}
		})

		it('lets a Draft referrer name a Draft', () => {
			expect(
				resolveReference(
					{ file: 'doc.mdx', draft: true },
					'viertelId',
					'stadt/entwurf',
					targets,
					production,
				),
			).toBe(targets[0])
		})

		it('lets any referrer name a Draft when Drafts are visible', () => {
			expect(resolveReference(referrer, 'viertelId', 'stadt/entwurf', targets, development)).toBe(
				targets[0],
			)
		})
	})
})
