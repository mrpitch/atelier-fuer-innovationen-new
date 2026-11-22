import type { Kapitel, Thema, ThemaDocument } from './loader'
import { resolveReference } from './references'

const KAPITEL_ID_FIELD = 'kapitelId'

// A Thema's URL segment is its own slug under the fixed `/themen` prefix
// (ADR-0003) — never its folder path generically, the same way Kapitel's URL
// is derived rather than read off the file path.
function themaUrl(id: string): string {
	const slug = id.split('/').at(-1)
	return `/themen/${slug}`
}

// Resolves each Themen-Ort's Kapitel reference (issue #31). The Leitthema
// carries no `kapitelId`, so it's simply not checked — a Thema without one
// lists every Kapitel on its own landing page instead of branching off a
// single one. The reference check reuses references.ts's one generic
// resolver, the same call Aufsatz's and Kapitel's own reference fields make.
export function resolveThemen(
	documents: readonly ThemaDocument[],
	kapitel: readonly Kapitel[],
): Thema[] {
	return documents.map(({ file, ...document }) => {
		if (document.kapitelId !== undefined) {
			resolveReference(file, KAPITEL_ID_FIELD, document.kapitelId, kapitel)
		}
		return { ...document, url: themaUrl(document.id) }
	})
}
