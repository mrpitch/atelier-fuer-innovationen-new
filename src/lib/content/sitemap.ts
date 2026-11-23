import { parentId } from './locations'
import { toLink } from './presentation'
import type {
	Abschnitt,
	Aufsatz,
	Kapitel,
	NavigationLink,
	NavigationNode,
	Rundgang,
	Station,
	Thema,
	Viertel,
	Zentrum,
} from './types'

// Every content type the Sitemap lists besides Seite, with its published
// documents only (issue #60). Seite is the Navigation tree itself (issue
// #34); each other type hangs off the Seite of its own area.
export interface SitemapInput {
	readonly tree: NavigationNode
	// A Seite that is a Draft is left out of the list, its published children
	// kept — only a development graph's tree contains one.
	readonly draftSeitenIds: ReadonlySet<string>
	// Stadt: the Zentrum, then every Viertel in number order.
	readonly zentrum: Zentrum | undefined
	readonly viertel: readonly Viertel[]
	// Bibliothek: every Aufsatz.
	readonly aufsaetze: readonly Aufsatz[]
	// Leitthema: each Kapitel in Kapitel number order, with its own Abschnitte.
	readonly kapitel: readonly Kapitel[]
	readonly abschnitte: readonly Abschnitt[]
	// Themen: the Leitthema and every Themen-Ort.
	readonly themen: readonly Thema[]
	// Rundgänge: each Rundgang, with its own Stationen in Station number order.
	readonly rundgaenge: readonly Rundgang[]
	readonly stationen: readonly Station[]
}

// Children are built before the node is returned, so a node's list is
// mutable only while listSitemap assembles it.
type MutableNode = { -readonly [K in keyof NavigationNode]: NavigationNode[K] } & {
	children: MutableNode[]
}

function node(document: Parameters<typeof toLink>[0], children: MutableNode[] = []): MutableNode {
	return { ...toLink(document), children }
}

// The Sitemap (glossary: Sitemap): a published-only tree of every content
// type, nested by area (issue #60). The Sitemap page renders it nested;
// sitemap.xml flattens it depth-first with `flattenNavigation`:
//
//   Seite tree (Navigation order), where each area's Seite is followed by —
//   after its own Seite children — its type's documents:
//     Stadt       → Zentrum, then Viertel (number order)
//     Bibliothek  → Aufsätze
//     Leitthema   → Kapitel (number order), each followed by its Abschnitte
//     Themen      → Themen
//     Rundgänge   → Rundgänge, each followed by its Stationen (number order)
//
// An area is the folder its type's documents sit in (stadt, bibliothek,
// leitthema, themen, rundgaenge). With no published Seite at that folder —
// real content has none for Bibliothek or Leitthema — the documents attach
// to the nearest published ancestor folder's Seite, the root at worst.
export function listSitemap(input: SitemapInput): NavigationNode {
	const nodesById = new Map<string, MutableNode>()

	// A Draft Seite's own entry is left out; its published children, if any,
	// attach to its parent instead.
	function fromTree(treeNode: NavigationNode): MutableNode[] {
		const { children, ...link } = treeNode
		const descendants = children.flatMap(fromTree)
		if (input.draftSeitenIds.has(link.id)) return descendants

		const sitemapNode: MutableNode = { ...link, children: descendants }
		nodesById.set(link.id, sitemapNode)
		return [sitemapNode]
	}

	const { children: rootChildren, ...rootLink } = input.tree
	const root: MutableNode = { ...rootLink, children: rootChildren.flatMap(fromTree) }
	nodesById.set(rootLink.id, root)

	// Attaches an area's documents to the Seite at the area's folder, or, when
	// none is published there, to the nearest published ancestor folder's.
	function attach(areaId: string, children: MutableNode[]) {
		let current: string | undefined = areaId
		while (current !== undefined) {
			const target = nodesById.get(current)
			if (target) {
				target.children.push(...children)
				return
			}
			current = parentId(current)
		}
		root.children.push(...children)
	}

	attach('stadt', [
		...(input.zentrum ? [node(input.zentrum)] : []),
		...input.viertel.map((item) => node(item)),
	])
	attach(
		'bibliothek',
		input.aufsaetze.map((item) => node(item)),
	)
	attach(
		'leitthema',
		input.kapitel.map((kapitel) =>
			node(
				kapitel,
				input.abschnitte
					.filter((abschnitt) => abschnitt.kapitelId === kapitel.id)
					.map((abschnitt) => node(abschnitt)),
			),
		),
	)
	attach(
		'themen',
		input.themen.map((item) => node(item)),
	)
	attach(
		'rundgaenge',
		input.rundgaenge.map((rundgang) =>
			node(
				rundgang,
				input.stationen
					.filter((station) => station.rundgangId === rundgang.id)
					.map((station) => node(station)),
			),
		),
	)

	return root
}

// A navigation tree as one list, depth-first and parent before children —
// the order sitemap.xml lists it in.
export function flattenNavigation(root: NavigationNode): readonly NavigationLink[] {
	const { children, ...link } = root
	return [link, ...children.flatMap(flattenNavigation)]
}
