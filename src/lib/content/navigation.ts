import { ContentValidationError } from './errors'
import type {
	Abschnitt,
	Aufsatz,
	Kapitel,
	Meta,
	Rundgang,
	Seite,
	ShortTitled,
	Station,
	Thema,
	Viertel,
	Zentrum,
} from './loader'
import { shortTitleOrTitle } from './loader'

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

// Every content type's resolved shape carries an id, a url and a (Short)
// title — Seite included — so one function builds a NavigationLink for any
// of them.
function toLink(
	document: { readonly id: string; readonly url: string } & ShortTitled,
): NavigationLink {
	return { id: document.id, url: document.url, title: shortTitleOrTitle(document) }
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

// Every content type the Sitemap lists, grouped the way listSitemap below
// composes them. Seite is the Navigation tree itself (issue #34); every
// other type has no Seite node of its own to hang off (Bibliothek and
// Leitthema have no landing Seite in real content today), so each one is its
// own contiguous block instead of being spliced into the tree.
export interface SitemapInput {
	readonly tree: NavigationNode
	readonly seiten: readonly Seite[]
	// Stadt (issue #28): the Zentrum, then every Viertel in number order — the
	// same order the Stadt landing Seite's own Viertel list uses.
	readonly zentrum: Zentrum
	readonly viertel: readonly Viertel[]
	// Bibliothek (issue #29): every Aufsatz, in its own derivation's order.
	readonly aufsaetze: readonly Aufsatz[]
	// Leitthema (issue #30): each Kapitel, already in Kapitel number order,
	// immediately followed by its own Abschnitte.
	readonly kapitel: readonly Kapitel[]
	readonly abschnitteByKapitel: ReadonlyMap<string, readonly Abschnitt[]>
	// Themen (issue #31): the Leitthema and every Themen-Ort, in their own
	// derivation's order.
	readonly themen: readonly Thema[]
	// Rundgänge (issue #32): each Rundgang, immediately followed by its own
	// Stationen in Station number order.
	readonly rundgaenge: readonly Rundgang[]
	readonly stationenByRundgang: ReadonlyMap<string, readonly Station[]>
}

// The Sitemap (glossary: Sitemap): a flat, published-only list of every
// content type, each type's own block in the order documented on
// SitemapInput above (issue #60). A Draft Seite's own entry is left out of
// the Navigation tree part; its published children, if any, still appear —
// the other content types carry no Draft concept of their own, so nothing
// else is filtered.
export function listSitemap(input: SitemapInput): readonly NavigationLink[] {
	const draftIds = new Set(input.seiten.filter((seite) => seite.draft).map((seite) => seite.id))

	function walk(node: NavigationNode): NavigationLink[] {
		const { children, ...link } = node
		const descendants = children.flatMap(walk)
		return draftIds.has(link.id) ? descendants : [link, ...descendants]
	}

	return [
		...walk(input.tree),
		toLink(input.zentrum),
		...input.viertel.map(toLink),
		...input.aufsaetze.map(toLink),
		...input.kapitel.flatMap((item) => [
			toLink(item),
			...(input.abschnitteByKapitel.get(item.id) ?? []).map(toLink),
		]),
		...input.themen.map(toLink),
		...input.rundgaenge.flatMap((item) => [
			toLink(item),
			...(input.stationenByRundgang.get(item.id) ?? []).map(toLink),
		]),
	]
}

// A Draft (glossary, issue #33) stays a structurally real child for
// meta.json's own reconciliation below — it is still an actual file on disk —
// but every exposed Navigation view hides it when `isVisible` says so. Its
// own children, if any, reparent to its nearest visible ancestor, the same
// rule `listSitemap` uses for its flat list.
export function buildNavigation(
	seiten: readonly Seite[],
	metaByFolder: ReadonlyMap<string, Meta>,
	isVisible: (seite: Seite) => boolean = () => true,
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
	const siblingsById = new Map<string, readonly NavigationNode[]>()
	function indexSiblings(node: NavigationNode) {
		for (const child of node.children) siblingsById.set(child.id, node.children)
		node.children.forEach(indexSiblings)
	}
	indexSiblings(tree)

	function siblingsAndIndex(id: string) {
		const siblings = siblingsById.get(id)
		return siblings && { siblings, index: siblings.findIndex((sibling) => sibling.id === id) }
	}

	function withoutChildren({ children: _children, ...link }: NavigationNode): NavigationLink {
		return link
	}

	return {
		tree,

		getBreadcrumbs(id) {
			const trail: NavigationLink[] = []
			let current: string | undefined = id
			while (current !== undefined) {
				const seite = byId.get(current)
				if (!seite) break
				if (isVisible(seite)) trail.unshift(toLink(seite))
				current = parentId(current)
			}
			return trail
		},

		getPrevious(id) {
			const found = siblingsAndIndex(id)
			if (!found || found.index === 0) return undefined
			return withoutChildren(found.siblings[found.index - 1])
		},

		getNext(id) {
			const found = siblingsAndIndex(id)
			if (!found || found.index === found.siblings.length - 1) return undefined
			return withoutChildren(found.siblings[found.index + 1])
		},
	}
}
