import { ContentValidationError } from './errors'
import type { RawMenu } from './loader'
import { documentFile } from './locations'
import { shortTitleOrTitle } from './presentation'
import type { MenuEntry } from './schemas'
import type { ContentDocument } from './types'

// A resolved Menu entry (glossary: Menu): a label is always resolved here,
// never restated by the Menu file for a content entry.
export interface MenuLink {
	readonly url: string
	readonly label: string
}

// Every document a Menu entry may name, by ID (issue #23): any content type's
// published document resolves, with its URL and label. `known` holds the ID of
// every document that exists, Draft or not; `visible` only those the graph
// exposes. An ID in `known` but not in `visible` is a Draft in a production
// graph, which fails the same way a missing one does, with its own reason
// (issue #33: a Menu entry can't publish a link to an unpublished Draft).
export interface MenuTargets {
	readonly known: ReadonlySet<string>
	readonly visible: ReadonlyMap<string, ContentDocument>
}

// A content entry's label is the target's Short title, else its title — the
// same rule Navigation uses. An external entry's label is written in the
// Menu file itself.
function resolveEntry(file: string, entry: MenuEntry, targets: MenuTargets): MenuLink {
	if ('url' in entry) return { url: entry.url, label: entry.label }

	const target = targets.visible.get(entry.id)
	if (!target) {
		if (targets.known.has(entry.id)) {
			throw new ContentValidationError(
				file,
				entry.id,
				`menu references a Draft: ${documentFile(entry.id)}`,
			)
		}
		throw new ContentValidationError(file, entry.id, 'menu lists an ID with no matching document')
	}
	return { url: target.document.url, label: shortTitleOrTitle(target.document) }
}

export function resolveMenus(
	rawMenus: ReadonlyMap<string, RawMenu>,
	targets: MenuTargets,
): ReadonlyMap<string, readonly MenuLink[]> {
	const resolved = new Map<string, readonly MenuLink[]>()

	for (const [name, menu] of rawMenus) {
		resolved.set(
			name,
			menu.entries.map((entry) => resolveEntry(menu.file, entry, targets)),
		)
	}

	return resolved
}
