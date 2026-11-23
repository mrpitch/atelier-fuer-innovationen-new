import type { Metadata } from 'next'

// The Open Graph locale of every unprefixed German page (ADR-0001).
const DEFAULT_OPEN_GRAPH_LOCALE = 'de_DE'

// The canonical URL and Open Graph tags every page carries (issue #34), from
// the document alone: one rule for every content type and every route, the
// catch-all's localized ones included (`locale` is the configured locale of a
// prefixed URL). Both URLs resolve to absolute ones via `metadataBase`
// (src/app/layout.tsx).
export function documentMetadata(
	document: { title: string; description: string; url: string },
	siteName: string,
	locale?: string,
): Metadata {
	return {
		title: document.title,
		description: document.description,
		alternates: { canonical: document.url },
		openGraph: {
			type: 'website',
			title: document.title,
			description: document.description,
			url: document.url,
			siteName,
			locale: locale ?? DEFAULT_OPEN_GRAPH_LOCALE,
		},
	}
}
