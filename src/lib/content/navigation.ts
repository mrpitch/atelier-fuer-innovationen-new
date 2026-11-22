import { ContentValidationError } from './errors'
import type { Meta, Seite } from './loader'

// The hierarchy of content as it sits in the site (glossary: Navigation).
// Breadcrumbs and previous/next are views of this tree, not written down
// separately.
export interface NavigationLink {
	readonly id: string
	readonly url: string
	readonly title: string
}

export interface NavigationNode extends NavigationLink {
	readonly children: readonly NavigationNode[]
}

export interface Navigation {
	readonly tree: NavigationNode
	getBreadcrumbs(id: string): readonly NavigationLink[]
	getPrevious(id: string): NavigationLink | undefined
	getNext(id: string): NavigationLink | undefined
}

// The glossary's Short title, when a document has one, is what Navigation,
// breadcrumbs and previous/next show; the title otherwise.
function navigationTitle(seite: Seite): string {
	return seite.shortTitle ?? seite.title
}

function toLink(seite: Seite): NavigationLink {
	return { id: seite.id, url: seite.url, title: navigationTitle(seite) }
}

// A document's parent is the folder that contains it; the root ('') has none.
function parentId(id: string): string | undefined {
	if (id === '') return undefined
	const segments = id.split('/')
	segments.pop()
	return segments.join('/')
}

// A folder's natural key, used when it has no meta.json: date first (once a
// later content type carries one), then title.
function compareByNaturalKey(a: Seite, b: Seite): number {
	return a.title.localeCompare(b.title, 'de')
}

// meta.json is strict (issue #26): every actual child appears exactly once.
// An unknown ID or an unlisted child throws, naming the meta.json file and
// the ID.
function orderChildren(meta: Meta | undefined, children: readonly Seite[]): Seite[] {
	if (!meta) return [...children].sort(compareByNaturalKey)

	const byId = new Map(children.map((child) => [child.id, child]))
	const seen = new Set<string>()
	const ordered: Seite[] = []

	for (const id of meta.order) {
		if (seen.has(id)) {
			throw new ContentValidationError(meta.file, id, 'is listed more than once in meta.json')
		}
		seen.add(id)

		const child = byId.get(id)
		if (!child) {
			throw new ContentValidationError(
				meta.file,
				id,
				'meta.json lists an ID with no matching child',
			)
		}
		ordered.push(child)
	}

	for (const child of children) {
		if (!seen.has(child.id)) {
			throw new ContentValidationError(meta.file, child.id, 'is missing from meta.json')
		}
	}

	return ordered
}

export function buildNavigation(
	seiten: readonly Seite[],
	metaByFolder: ReadonlyMap<string, Meta>,
): Navigation {
	const byId = new Map(seiten.map((seite) => [seite.id, seite]))

	const childrenByParent = new Map<string, Seite[]>()
	for (const seite of seiten) {
		const parent = parentId(seite.id)
		if (parent === undefined) continue
		const siblings = childrenByParent.get(parent) ?? []
		siblings.push(seite)
		childrenByParent.set(parent, siblings)
	}

	// A meta.json with zero actual children still needs validating: every one
	// of its listed IDs is unknown.
	const folderIds = new Set<string>([...childrenByParent.keys(), ...metaByFolder.keys()])
	const orderedChildrenByParent = new Map<string, Seite[]>()
	for (const folderId of folderIds) {
		orderedChildrenByParent.set(
			folderId,
			orderChildren(metaByFolder.get(folderId), childrenByParent.get(folderId) ?? []),
		)
	}

	const root = byId.get('')
	if (!root) {
		throw new Error('buildNavigation: no Seite with id "" to use as the Navigation tree root')
	}

	function buildNode(seite: Seite): NavigationNode {
		const children = orderedChildrenByParent.get(seite.id) ?? []
		return { ...toLink(seite), children: children.map(buildNode) }
	}

	function siblingsAndIndex(id: string): { siblings: Seite[]; index: number } | undefined {
		const parent = parentId(id)
		if (parent === undefined) return undefined
		const siblings = orderedChildrenByParent.get(parent) ?? []
		const index = siblings.findIndex((sibling) => sibling.id === id)
		return index === -1 ? undefined : { siblings, index }
	}

	return {
		tree: buildNode(root),

		getBreadcrumbs(id) {
			const trail: NavigationLink[] = []
			let current: string | undefined = id
			while (current !== undefined) {
				const seite = byId.get(current)
				if (!seite) break
				trail.unshift(toLink(seite))
				current = parentId(current)
			}
			return trail
		},

		getPrevious(id) {
			const found = siblingsAndIndex(id)
			if (!found || found.index === 0) return undefined
			return toLink(found.siblings[found.index - 1])
		},

		getNext(id) {
			const found = siblingsAndIndex(id)
			if (!found || found.index === found.siblings.length - 1) return undefined
			return toLink(found.siblings[found.index + 1])
		},
	}
}
