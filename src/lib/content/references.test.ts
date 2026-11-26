import { describe, expect, it } from 'vitest'

import { ContentValidationError } from './errors'
import { resolveAnyReference, resolveReference } from './references'
import type { ContentDocument } from './types'

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

function seite(id: string, url: string): ContentDocument {
	return {
		kind: 'seite',
		document: { id, url, title: id, description: 'Platzhalter.', body: '', draft: false },
	}
}

// The any-type reference mechanism a Menu entry (issue #27) and a Viertel's
// Hinweis (issue #93) both reuse, as opposed to resolveReference's single
// same-type collection.
describe('resolveAnyReference', () => {
	const idee = seite('idee', '/idee')
	// entwurf is known but never put in `visible` — a Draft, the same shape a
	// production graph gives a Draft target.
	const targets = {
		known: new Set(['idee', 'entwurf']),
		visible: new Map([['idee', idee]]),
	}

	it('returns the matching visible target', () => {
		expect(resolveAnyReference('doc.mdx', 'hinweisId', 'idee', targets, true)).toBe(idee)
		expect(resolveAnyReference('doc.mdx', 'hinweisId', 'idee', targets, false)).toBe(idee)
	})

	it('fails naming the referring file, the field and an unknown ID, strict or not', () => {
		expect.assertions(8)

		for (const strict of [true, false]) {
			try {
				resolveAnyReference('doc.mdx', 'hinweisId', 'nichtvorhanden', targets, strict)
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('doc.mdx')
				expect(validationError.field).toBe('hinweisId')
				expect(validationError.reason).toContain('nichtvorhanden')
			}
		}
	})

	it('fails a strict caller naming a Draft, naming the Draft file', () => {
		expect.assertions(3)

		try {
			resolveAnyReference('doc.mdx', 'hinweisId', 'entwurf', targets, true)
		} catch (error) {
			expect(error).toBeInstanceOf(ContentValidationError)
			const validationError = error as ContentValidationError
			expect(validationError.field).toBe('hinweisId')
			expect(validationError.reason).toContain('entwurf/index.mdx')
		}
	})

	it('resolves a Draft to undefined for a non-strict caller, instead of failing', () => {
		expect(resolveAnyReference('doc.mdx', 'hinweisId', 'entwurf', targets, false)).toBeUndefined()
	})
})
