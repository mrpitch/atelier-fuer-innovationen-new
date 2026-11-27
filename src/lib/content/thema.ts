import type { Loaded } from './loader'
import { shortTitleOrTitle } from './presentation'
import { resolveReference } from './references'
import type { Thema, Visibility, Weiterfuehrend } from './types'
import { pathUrl } from './urls'

const KAPITEL_ID_FIELD = 'kapitelId'
const WEITERFUEHREND_IDS_FIELD = 'weiterfuehrendIds'

function toWeiterfuehrend(aufsatz: Loaded<'aufsatz'>): Weiterfuehrend {
	return {
		label: shortTitleOrTitle(aufsatz),
		description: aufsatz.description,
		url: pathUrl(aufsatz.id),
	}
}

// Resolves each Themen-Ort's Kapitel reference (issue #31) and its optional
// `weiterfuehrendIds` (issue #124) against every Kapitel and Aufsatz
// document, Drafts included; a published Themen-Ort naming a missing or
// Draft target of either fails (issue #33). The Leitthema carries no
// `kapitelId`, so it's simply not checked — a Thema without one lists every
// Kapitel on its own landing page instead of branching off a single one. A
// Thema's URL is its folder path, `/themen/{slug}` (ADR-0003).
export function resolveThemen(
	documents: readonly Loaded<'thema'>[],
	kapitel: readonly Loaded<'kapitel'>[],
	aufsaetze: readonly Loaded<'aufsatz'>[],
	isVisible: Visibility,
): Thema[] {
	const aufsatzById = new Map(aufsaetze.map((aufsatz) => [aufsatz.id, aufsatz]))

	return documents
		.map((document) => {
			if (document.kapitelId !== undefined) {
				resolveReference(document, KAPITEL_ID_FIELD, document.kapitelId, kapitel, isVisible)
			}
			for (const id of document.weiterfuehrendIds ?? []) {
				resolveReference(document, WEITERFUEHREND_IDS_FIELD, id, aufsaetze, isVisible)
			}
			return document
		})
		.filter(isVisible)
		.map(({ file: _file, ...document }) => ({
			...document,
			url: pathUrl(document.id),
			weiterfuehrend: document.weiterfuehrendIds?.flatMap((id) => {
				const target = aufsatzById.get(id)
				return target ? [toWeiterfuehrend(target)] : []
			}),
		}))
}
