import { describe, expect, it } from 'vitest'

import { documentMetadata } from './document-metadata'

const document = { title: 'Idee', description: 'Worum es geht', url: '/idee' }

describe('documentMetadata', () => {
	it('sets the canonical URL and the Open Graph tags from the document', () => {
		expect(documentMetadata(document, 'Xenia')).toEqual({
			title: 'Idee',
			description: 'Worum es geht',
			alternates: { canonical: '/idee' },
			openGraph: {
				type: 'website',
				title: 'Idee',
				description: 'Worum es geht',
				url: '/idee',
				siteName: 'Xenia',
				locale: 'de_DE',
			},
		})
	})

	it("uses a configured locale's own tag for a prefixed page", () => {
		expect(
			documentMetadata({ ...document, url: '/xx/idee' }, 'Xenia', 'xx').openGraph,
		).toMatchObject({
			url: '/xx/idee',
			locale: 'xx',
		})
	})
})
