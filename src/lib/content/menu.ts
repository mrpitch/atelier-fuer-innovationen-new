import { ContentValidationError } from './errors'
import type { RawMenu, Seite } from './loader'
import { seiteFile, shortTitleOrTitle } from './loader'
import type { MenuEntry } from './schemas'

// A resolved Menu entry (glossary: Menu): a label is always resolved here,
// never restated by the Menu file for a content entry.
export interface MenuLink {
	readonly url: string
	readonly label: string
}

// A content entry's label is the target's Short title, else its title — the
// same rule Navigation uses. An external entry's label is written in the
// Menu file itself. In production a Draft target fails the same way a
// missing one does (issue #33: a Menu entry can't publish a link to an
// unpublished Draft) — `development` lifts that one restriction, the only
// difference between the two modes.
function resolveEntry(
	file: string,
	entry: MenuEntry,
	byId: ReadonlyMap<string, Seite>,
	development: boolean,
): MenuLink {
	if ('url' in entry) return { url: entry.url, label: entry.label }

	const seite = byId.get(entry.id)
	if (!seite) {
		throw new ContentValidationError(file, entry.id, 'menu lists an ID with no matching Seite')
	}
	if (seite.draft && !development) {
		throw new ContentValidationError(
			file,
			entry.id,
			`menu references a Draft: ${seiteFile(seite.id)}`,
		)
	}
	return { url: seite.url, label: shortTitleOrTitle(seite) }
}

export function resolveMenus(
	seiten: readonly Seite[],
	rawMenus: ReadonlyMap<string, RawMenu>,
	development: boolean,
): ReadonlyMap<string, readonly MenuLink[]> {
	const byId = new Map(seiten.map((seite) => [seite.id, seite]))
	const resolved = new Map<string, readonly MenuLink[]>()

	for (const [name, menu] of rawMenus) {
		resolved.set(
			name,
			menu.entries.map((entry) => resolveEntry(menu.file, entry, byId, development)),
		)
	}

	return resolved
}
