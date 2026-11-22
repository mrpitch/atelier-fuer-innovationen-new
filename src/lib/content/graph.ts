import { resolveAufsaetze } from './aufsatz'
import type { Aufsatz, Seite, Site, Viertel, Zentrum } from './loader'
import {
	loadAufsatzDocuments,
	loadMenus,
	loadMeta,
	loadSeiten,
	loadSite,
	loadViertelDocuments,
	loadViertelOrder,
	loadZentrum,
} from './loader'
import type { MenuLink } from './menu'
import { resolveMenus } from './menu'
import type { NavigationLink, NavigationNode } from './navigation'
import { buildNavigation, listSitemap } from './navigation'
import { orderViertel } from './viertel'

export interface ContentGraph {
	readonly seiten: readonly Seite[]
	getSeite(id: string): Seite | undefined
	readonly navigation: NavigationNode
	// The Sitemap page and sitemap.xml both read this instead of re-deriving
	// it: the whole Navigation tree, flattened and published-only (issue #34).
	readonly sitemap: readonly NavigationLink[]
	getBreadcrumbs(id: string): readonly NavigationLink[]
	getPrevious(id: string): NavigationLink | undefined
	getNext(id: string): NavigationLink | undefined
	readonly site: Site
	// name is the Menu file's basename (header, footer, …). Unknown to an
	// unlisted Menu returns an empty list rather than throwing.
	getMenu(name: string): readonly MenuLink[]
	// The 8 Viertel (glossary), ordered and numbered by the Viertel order
	// file (loader.ts, viertel.ts).
	readonly viertel: readonly Viertel[]
	getViertel(id: string): Viertel | undefined
	// The Zentrum (glossary): its own type, not a Viertel, exactly one per
	// site.
	readonly zentrum: Zentrum
	// Every Aufsatz (glossary), each resolved to its Viertel (issue #29).
	readonly aufsaetze: readonly Aufsatz[]
	getAufsatz(id: string): Aufsatz | undefined
	// A Viertel's related Aufsätze ("Mehr aus dem Viertel") — derived here
	// from each Aufsatz's Viertel reference, never listed by hand.
	getAufsaetzeByViertel(viertelId: string): readonly Aufsatz[]
}

// The one public interface for content (ADR-0002): built from loader output,
// and able to load any content directory so tests can point it at fixtures.
export function buildContentGraph(contentDir: string): ContentGraph {
	const seiten = loadSeiten(contentDir)
	const navigation = buildNavigation(seiten, loadMeta(contentDir))
	const site = loadSite(contentDir)
	const menus = resolveMenus(seiten, loadMenus(contentDir))
	const viertel = orderViertel(loadViertelOrder(contentDir), loadViertelDocuments(contentDir))
	const zentrum = loadZentrum(contentDir)
	const aufsaetze = resolveAufsaetze(loadAufsatzDocuments(contentDir), viertel)

	return {
		seiten,
		getSeite(id) {
			return seiten.find((seite) => seite.id === id)
		},
		navigation: navigation.tree,
		sitemap: listSitemap(navigation.tree, seiten),
		getBreadcrumbs: navigation.getBreadcrumbs,
		getPrevious: navigation.getPrevious,
		getNext: navigation.getNext,
		site,
		getMenu(name) {
			return menus.get(name) ?? []
		},
		viertel,
		getViertel(id) {
			return viertel.find((item) => item.id === id)
		},
		zentrum,
		aufsaetze,
		getAufsatz(id) {
			return aufsaetze.find((aufsatz) => aufsatz.id === id)
		},
		getAufsaetzeByViertel(viertelId) {
			return aufsaetze.filter((aufsatz) => aufsatz.viertelId === viertelId)
		},
	}
}
