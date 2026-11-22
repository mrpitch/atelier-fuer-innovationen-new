import { describe, expect, it } from 'vitest'

import {
	extractRelativeImages,
	resolveBodyAssetPath,
	validateViertelTeaserReferences,
} from './body'
import { ContentValidationError } from './errors'

describe('validateViertelTeaserReferences', () => {
	const viertel = [{ id: 'stadt/annaeherung' }, { id: 'stadt/zukunft' }]

	it('passes every <ViertelTeaser id> that matches the Viertel list', () => {
		const body = `Text.\n\n<ViertelTeaser id="stadt/annaeherung" />\n\n<ViertelTeaser id='stadt/zukunft' />`
		expect(() => validateViertelTeaserReferences('idee/index.mdx', body, viertel)).not.toThrow()
	})

	it('ignores prose that merely mentions the component name', () => {
		const body = 'Der ViertelTeaser zeigt ein Viertel.'
		expect(() => validateViertelTeaserReferences('idee/index.mdx', body, viertel)).not.toThrow()
	})

	it('fails on an unknown ID, naming the file and the ID', () => {
		const body = '<ViertelTeaser id="stadt/nichtvorhanden" />'

		expect.assertions(4)
		try {
			validateViertelTeaserReferences('idee/index.mdx', body, viertel)
		} catch (error) {
			expect(error).toBeInstanceOf(ContentValidationError)
			const validationError = error as ContentValidationError
			expect(validationError.file).toBe('idee/index.mdx')
			expect(validationError.field).toBe('ViertelTeaser.id')
			expect(validationError.reason).toMatch(/unknown ID: stadt\/nichtvorhanden/)
		}
	})
})

describe('extractRelativeImages', () => {
	it('collects a relative markdown image path', () => {
		expect(extractRelativeImages('Text ![Alt](./foto.jpg) mehr Text')).toEqual(['./foto.jpg'])
	})

	it('ignores an absolute path, an external URL and a data URI', () => {
		const body = [
			'![Alt](/foto.jpg)',
			'![Alt](https://example.com/foto.jpg)',
			'![Alt](data:image/png;base64,AAAA)',
		].join('\n')
		expect(extractRelativeImages(body)).toEqual([])
	})

	it('collects more than one relative image, in order', () => {
		const body = '![Eins](eins.jpg) und ![Zwei](./unterordner/zwei.jpg)'
		expect(extractRelativeImages(body)).toEqual(['eins.jpg', './unterordner/zwei.jpg'])
	})
})

describe('resolveBodyAssetPath', () => {
	it("resolves against the document's own folder", () => {
		expect(resolveBodyAssetPath('idee', './foto.jpg')).toBe('idee/foto.jpg')
		expect(resolveBodyAssetPath('stadt/annaeherung', 'unterordner/foto.jpg')).toBe(
			'stadt/annaeherung/unterordner/foto.jpg',
		)
	})

	it('resolves the root Seite against the content directory itself', () => {
		expect(resolveBodyAssetPath('', 'foto.jpg')).toBe('foto.jpg')
	})
})
