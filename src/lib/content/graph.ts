import { buildAbschnittNavigation, orderAbschnitte } from './abschnitt'
import { resolveAufsaetze } from './aufsatz'
import { resolveKapitel } from './kapitel'
import type {
	Abschnitt,
	Aufsatz,
	Kapitel,
	Rundgang,
	Seite,
	Site,
	Station,
	Thema,
	Viertel,
	Zentrum,
} from './loader'
import {
	loadAbschnittDocuments,
	loadAbschnittOrder,
	loadAufsatzDocuments,
	loadKapitelDocuments,
	loadMenus,
	loadMeta,
	loadRundgangDocuments,
	loadSeiten,
	loadSite,
	loadStationDocuments,
	loadStationOrder,
	loadThemaDocuments,
	loadViertelDocuments,
	loadViertelOrder,
	loadZentrum,
} from './loader'
import type { MenuLink } from './menu'
import { resolveMenus } from './menu'
import type { NavigationLink, NavigationNode } from './navigation'
import { buildNavigation, listSitemap } from './navigation'
import { summarizeRundgang } from './rundgang'
import { buildStationNavigation, orderStationen } from './station'
import { resolveThemen } from './thema'
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
	// Every Kapitel of the Leitthema (issue #30), in Kapitel number order
	// (ADR-0003: "Kapitel n = Viertel n"). A Viertel has at most one.
	readonly kapitel: readonly Kapitel[]
	getKapitel(id: string): Kapitel | undefined
	getKapitelByViertel(viertelId: string): Kapitel | undefined
	// A Kapitel's Abschnitte, ordered by its own meta.json — never listed by
	// hand on the Kapitel itself; "N Abschnitte" is this list's length.
	getAbschnitteByKapitel(kapitelId: string): readonly Abschnitt[]
	// Previous/next across every Abschnitt, crossing from the last of one
	// Kapitel to the first of the next in Kapitel number order.
	getPreviousAbschnitt(id: string): NavigationLink | undefined
	getNextAbschnitt(id: string): NavigationLink | undefined
	// Every Rundgang (issue #32), each with its Stationen count and duration
	// derived from its own Stationen — never written by hand.
	readonly rundgaenge: readonly Rundgang[]
	getRundgang(id: string): Rundgang | undefined
	// A Rundgang's Stationen, ordered by its own meta.json; "N Stationen" is
	// this list's length.
	getStationenByRundgang(rundgangId: string): readonly Station[]
	// The Stationen set at a Viertel or the Zentrum — derived here from each
	// Station's Ort reference, never listed by hand on the Viertel/Zentrum.
	getStationenByOrt(ortId: string): readonly Station[]
	// Previous/next within one Rundgang; a Station's neighbours never cross
	// into another Rundgang.
	getPreviousStation(id: string): NavigationLink | undefined
	getNextStation(id: string): NavigationLink | undefined
	// The three Themen (issue #31, ADR-0003): the Leitthema and each
	// Themen-Ort, both documents at src/content/themen/<slug>/. The Leitthema
	// has no kapitelId and lists every Kapitel on its own landing page; a
	// Themen-Ort's kapitelId names the one Kapitel it branches off from.
	readonly themen: readonly Thema[]
	getThema(id: string): Thema | undefined
	// A Kapitel's Themen-Ort(e), derived from each Thema's Kapitel reference
	// — never listed by hand on the Kapitel itself, the same derivation
	// getAufsaetzeByViertel uses.
	getThemenByKapitel(kapitelId: string): readonly Thema[]
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

	const kapitel = resolveKapitel(loadKapitelDocuments(contentDir), viertel)
	const abschnittDocuments = loadAbschnittDocuments(contentDir)
	const abschnitteByKapitel = new Map(
		kapitel.map((item) => [
			item.id,
			orderAbschnitte(
				item,
				loadAbschnittOrder(contentDir, item.id),
				abschnittDocuments.filter((document) => document.kapitelId === item.id),
			),
		]),
	)
	const abschnittNavigation = buildAbschnittNavigation(kapitel, abschnitteByKapitel)
	const themen = resolveThemen(loadThemaDocuments(contentDir), kapitel)

	const rundgangDocuments = loadRundgangDocuments(contentDir)
	const stationDocuments = loadStationDocuments(contentDir)
	const orte = [...viertel, zentrum]
	const stationenByRundgang = new Map(
		rundgangDocuments.map((document) => [
			document.id,
			orderStationen(
				document,
				loadStationOrder(contentDir, document.id),
				stationDocuments.filter((station) => station.rundgangId === document.id),
				orte,
				zentrum.id,
			),
		]),
	)
	const rundgaenge = rundgangDocuments.map((document) =>
		summarizeRundgang(document, stationenByRundgang.get(document.id) ?? []),
	)
	const stationen = [...stationenByRundgang.values()].flat()
	const stationNavigation = buildStationNavigation(stationenByRundgang)

	return {
		seiten,
		getSeite(id) {
			return seiten.find((seite) => seite.id === id)
		},
		getBody: importBody,
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
		kapitel,
		getKapitel(id) {
			return kapitel.find((item) => item.id === id)
		},
		getKapitelByViertel(viertelId) {
			return kapitel.find((item) => item.viertelId === viertelId)
		},
		getAbschnitteByKapitel(kapitelId) {
			return abschnitteByKapitel.get(kapitelId) ?? []
		},
		getPreviousAbschnitt: abschnittNavigation.getPreviousAbschnitt,
		getNextAbschnitt: abschnittNavigation.getNextAbschnitt,
		rundgaenge,
		getRundgang(id) {
			return rundgaenge.find((item) => item.id === id)
		},
		getStationenByRundgang(rundgangId) {
			return stationenByRundgang.get(rundgangId) ?? []
		},
		getStationenByOrt(ortId) {
			return stationen.filter((station) => station.ortId === ortId)
		},
		getPreviousStation: stationNavigation.getPreviousStation,
		getNextStation: stationNavigation.getNextStation,
		themen,
		getThema(id) {
			return themen.find((item) => item.id === id)
		},
		getThemenByKapitel(kapitelId) {
			return themen.filter((item) => item.kapitelId === kapitelId)
		},
	}
}
