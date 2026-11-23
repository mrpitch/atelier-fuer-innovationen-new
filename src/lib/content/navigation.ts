import { parentId } from './locations'
import type { Meta } from './order'
import { reconcileOrder } from './order'
import { toLink } from './presentation'
import type { NavigationLink, NavigationNode, Seite, Visibility } from './types'

export interface Navigation {
	readonly tree: NavigationNode
	// The visible siblings of a Seite in Navigation order, itself included —
	// the sequence its previous/next walk (trail.ts). Undefined for an ID
	// that isn't a visible Seite.
	getSiblings(id: string): readonly NavigationLink[] | undefined
}

// A folder's natural key, used when it has no meta.json: date first (once a
// later content type carries one), then title.
function compareByNaturalKey(a: Seite, b: Seite): number {
	return a.title.localeCompare(b.title, 'de')
}

// The Navigation tree (glossary: Navigation) from the Seite folder hierarchy
// plus each folder's meta.json order (issue #26): a Seite's parent is the
// folder it sits in, and `''` (the root Seite) is the tree's root. Only Seite
// is part of this tree; the other types' hierarchy lives in trail.ts and
// sitemap.ts.
//
// A Draft (glossary, issue #33) stays a structurally real child for
// meta.json's own reconciliation — it is still an actual file on disk — but
// every exposed view hides it when `isVisible` says so. Its own children, if
// any, reparent to its nearest visible ancestor, the same rule the Sitemap
// uses.
export function buildNavigation(
	seiten: readonly Seite[],
	metaByFolder: ReadonlyMap<string, Meta>,
	isVisible: Visibility,
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
		const meta = metaByFolder.get(folderId)
		const children = childrenByParent.get(folderId) ?? []
		orderedChildrenByParent.set(
			folderId,
			meta ? reconcileOrder(meta, children, 'Seite') : [...children].sort(compareByNaturalKey),
		)
	}

	const root = byId.get('')
	if (!root) {
		throw new Error('buildNavigation: no Seite with id "" to use as the Navigation tree root')
	}

	// A hidden child's own children reparent to its nearest visible ancestor
	// instead of disappearing with it.
	function visibleDescendants(seite: Seite): NavigationNode[] {
		const children = orderedChildrenByParent.get(seite.id) ?? []
		return children.flatMap((child) =>
			isVisible(child) ? [buildNode(child)] : visibleDescendants(child),
		)
	}

	function buildNode(seite: Seite): NavigationNode {
		return { ...toLink(seite), children: visibleDescendants(seite) }
	}

	// Previous/next walk the same reparented tree `buildNode` returns, so a
	// Draft's published children are siblings of its own visible siblings.
	const tree = buildNode(root)
	const siblingsById = new Map<string, readonly NavigationLink[]>()
	function indexSiblings(node: NavigationNode) {
		const siblings = node.children.map(({ children: _children, ...link }) => link)
		for (const child of node.children) siblingsById.set(child.id, siblings)
		node.children.forEach(indexSiblings)
	}
	indexSiblings(tree)

	return {
		tree,
		getSiblings(id) {
			return siblingsById.get(id)
		},
	}
}
