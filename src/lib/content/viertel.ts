import path from 'node:path'

import { ContentValidationError, ZENTRUM_FIELD } from './errors'
import type { Loaded } from './loader'
import { STADT_DIR } from './locations'
import type { Meta } from './order'
import { reconcileOrder } from './order'
import { shortTitleOrTitle } from './presentation'
import type { AnyTargets } from './references'
import { resolveAnyReference } from './references'
import type { Hinweis, Viertel, Visibility, Zentrum } from './types'
import { pathUrl } from './urls'

// A Viertel's number is its 1-based position in stadt/meta.json (issue #28),
// and never comes from frontmatter. The order is reconciled strictly against
// every Viertel document, Drafts included; only then are Drafts left out
// (issue #33), so the numbers of the published Viertel run 1..n without
// gaps in production. A Draft Viertel shows up, numbered in place, only in
// development.
export function orderViertel(
	meta: Meta,
	documents: readonly Loaded<'viertel'>[],
	isVisible: Visibility,
): Viertel[] {
	return reconcileOrder(meta, documents, 'Viertel')
		.filter(isVisible)
		.map(({ file: _file, ...document }, index) => ({
			...document,
			url: pathUrl(document.id),
			number: index + 1,
		}))
}

const HINWEIS_ID_FIELD = 'hinweisId'

// Resolves each Viertel's optional Hinweis reference (issue #93) against a
// document of any type — the same any-type reference Menus use
// (references.ts's resolveAnyReference). Every Viertel document is checked,
// Drafts included (issue #33's "Draft is still a real file, so it must be
// valid"); only a visible Viertel's Hinweis resolves to a value a page can
// show, keyed by the Viertel's ID.
export function resolveHinweise(
	documents: readonly Loaded<'viertel'>[],
	targets: AnyTargets,
	isVisible: Visibility,
): ReadonlyMap<string, Hinweis> {
	const resolved = new Map<string, Hinweis>()

	for (const document of documents) {
		if (document.hinweisId === undefined) continue
		const target = resolveAnyReference(
			document.file,
			HINWEIS_ID_FIELD,
			document.hinweisId,
			targets,
			isVisible(document),
		)
		if (target) {
			resolved.set(document.id, {
				shortTitle: shortTitleOrTitle(target.document),
				url: target.document.url,
			})
		}
	}

	return resolved
}

// The Zentrum (issue #28): its own type, exactly one document at the
// location rule — missing is an error — or none exposed in a production
// graph while it is a Draft.
export function resolveZentrum(
	documents: readonly Loaded<'zentrum'>[],
	isVisible: Visibility,
): Zentrum | undefined {
	if (documents.length === 0) {
		const file = path.join(STADT_DIR, 'zentrum', 'index.mdx')
		throw new ContentValidationError(file, ZENTRUM_FIELD, 'file not found')
	}
	return documents
		.filter(isVisible)
		.map(({ file: _file, ...document }) => ({ ...document, url: pathUrl(document.id) }))[0]
}
