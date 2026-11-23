import type { Loaded } from './loader'
import { resolveReference } from './references'
import type { Thema, Visibility } from './types'
import { pathUrl } from './urls'

const KAPITEL_ID_FIELD = 'kapitelId'

// Resolves each Themen-Ort's Kapitel reference (issue #31) against every
// Kapitel document, Drafts included; a published Themen-Ort naming a Draft
// Kapitel fails (issue #33). The Leitthema carries no `kapitelId`, so it's
// simply not checked — a Thema without one lists every Kapitel on its own
// landing page instead of branching off a single one. A Thema's URL is its
// folder path, `/themen/{slug}` (ADR-0003).
export function resolveThemen(
	documents: readonly Loaded<'thema'>[],
	kapitel: readonly Loaded<'kapitel'>[],
	isVisible: Visibility,
): Thema[] {
	return documents
		.map((document) => {
			if (document.kapitelId !== undefined) {
				resolveReference(document, KAPITEL_ID_FIELD, document.kapitelId, kapitel, isVisible)
			}
			return document
		})
		.filter(isVisible)
		.map(({ file: _file, ...document }) => ({ ...document, url: pathUrl(document.id) }))
}
