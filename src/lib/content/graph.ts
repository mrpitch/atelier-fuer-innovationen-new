import type { Seite, Site, Viertel, Zentrum } from './loader'
import {
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
import { buildNavigation } from './navigation'
import { orderViertel } from './viertel'

// Compiles a Seite's, Viertel's or the Zentrum's MDX body through Next's MDX
// pipeline (ADR-0002) — the one place in the module that imports `@/content`
// dynamically, so pages never do (issue #55). `id === ''` needs its own
// literal import: `@/content//index.mdx` has no matching file, so the
// general pattern below can't resolve the root Seite (issue #25).
async function importBody(id: string) {
	return id === ''
		? (await import('@/content/index.mdx')).default
		: (await import(`@/content/${id}/index.mdx`)).default
}

export interface ContentGraph {
	readonly seiten: readonly Seite[]
	getSeite(id: string): Seite | undefined
	getBody(id: string): ReturnType<typeof importBody>
	readonly navigation: NavigationNode
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

	return {
		seiten,
		getSeite(id) {
			return seiten.find((seite) => seite.id === id)
		},
		getBody: importBody,
		navigation: navigation.tree,
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
	}
}
