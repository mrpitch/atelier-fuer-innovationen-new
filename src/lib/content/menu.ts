import { ContentValidationError, MENU_FIELD } from './errors'
import type { RawMenu } from './loader'
import { documentFile } from './locations'
import { shortTitleOrTitle } from './presentation'
import type { MenuEntry, MenuGroup, MenuItem } from './schemas'
import { isMenuEntry, isMenuGroup } from './schemas'
import type { ContentDocument } from './types'

// A resolved Menu entry (glossary: Menu): a label is always resolved here,
// never restated by the Menu file for a content entry.
export interface MenuLink {
	readonly url: string
	readonly label: string
}

// A resolved Menu group (glossary: Menu group): a label with its entries
// resolved the same way a flat Menu's are.
export interface MenuGroupLink {
	readonly label: string
	readonly links: readonly MenuLink[]
}

// The resolved shape of a Menu (glossary: Menu): a flat list of links, or —
// when the Menu file groups its entries — a list of labelled groups of
// links. A Menu never mixes the two; schemas.ts validates that.
export type ResolvedMenu = readonly MenuLink[] | readonly MenuGroupLink[]

export function isGroupedMenu(menu: ResolvedMenu): menu is readonly MenuGroupLink[] {
	return menu.length > 0 && 'links' in menu[0]
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

function resolveGroup(file: string, group: MenuGroup, targets: MenuTargets): MenuGroupLink {
	return {
		label: group.label,
		links: group.entries.map((entry) => resolveEntry(file, entry, targets)),
	}
}

// schemas.ts's menuSchema already rejects a Menu that mixes entries and
// groups, so a Menu with any group holds only groups.
function resolveItems(
	file: string,
	items: readonly MenuItem[],
	targets: MenuTargets,
): ResolvedMenu {
	const groups = items.filter(isMenuGroup)
	if (groups.length > 0) return groups.map((group) => resolveGroup(file, group, targets))
	return items.filter(isMenuEntry).map((entry) => resolveEntry(file, entry, targets))
}

// RootLayout's own convention (not something the Menu schema can see, since
// a Menu file alone never states its expected shape): header and
// footer-legal must resolve flat, footer grouped (glossary: Menu group).
// Checked here, during graph building, so a Menu file edited into the wrong
// shape fails `content:check` instead of only crashing the Next.js build.
export const FLAT_MENU_NAMES = ['header', 'footer-legal'] as const
export const GROUPED_MENU_NAMES = ['footer'] as const
export type FlatMenuName = (typeof FLAT_MENU_NAMES)[number]
export type GroupedMenuName = (typeof GROUPED_MENU_NAMES)[number]

function isIn(names: readonly string[], name: string): boolean {
	return names.includes(name)
}

function assertKnownMenuShape(name: string, file: string, resolved: ResolvedMenu): void {
	if (resolved.length === 0) return
	const grouped = isGroupedMenu(resolved)
	if (isIn(FLAT_MENU_NAMES, name) && grouped) {
		throw new ContentValidationError(file, MENU_FIELD, `menu "${name}" must be flat, not grouped`)
	}
	if (isIn(GROUPED_MENU_NAMES, name) && !grouped) {
		throw new ContentValidationError(file, MENU_FIELD, `menu "${name}" must be grouped, not flat`)
	}
}

export function resolveMenus(
	rawMenus: ReadonlyMap<string, RawMenu>,
	targets: MenuTargets,
): ReadonlyMap<string, ResolvedMenu> {
	const resolved = new Map<string, ResolvedMenu>()

	for (const [name, menu] of rawMenus) {
		const resolvedMenu = resolveItems(menu.file, menu.items, targets)
		assertKnownMenuShape(name, menu.file, resolvedMenu)
		resolved.set(name, resolvedMenu)
	}

	return resolved
}
