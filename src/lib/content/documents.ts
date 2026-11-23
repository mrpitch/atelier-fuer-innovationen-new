import type { ContentDocument, ContentKind, ContentSet, KindMap } from './types'

// The order a set's kinds are listed in wherever one list spans every type:
// the localized documents, the document index.
export const CONTENT_KINDS = [
	'seite',
	'viertel',
	'zentrum',
	'aufsatz',
	'kapitel',
	'abschnitt',
	'thema',
	'rundgang',
	'station',
] as const satisfies readonly ContentKind[]

// Every document of a set as one list of tagged documents, kind by kind.
export function flattenSet(set: ContentSet): ContentDocument[] {
	return CONTENT_KINDS.flatMap((kind) =>
		(set[kind] as readonly KindMap[ContentKind][]).map(
			(document) => ({ kind, document }) as ContentDocument,
		),
	)
}

// A set's documents found by ID, one lookup per kind.
export type KindLookup = { readonly [K in ContentKind]: ReadonlyMap<string, KindMap[K]> }

export function lookupSet(set: ContentSet): KindLookup {
	const entries = CONTENT_KINDS.map((kind) => [
		kind,
		new Map(
			(set[kind] as readonly KindMap[ContentKind][]).map((document) => [document.id, document]),
		),
	])
	return Object.fromEntries(entries) as unknown as KindLookup
}
