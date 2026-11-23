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
	loadSeiteTranslation,
	loadSite,
	loadStationDocuments,
	loadStationOrder,
	loadThemaDocuments,
	loadViertelDocuments,
	loadViertelOrder,
	loadViertelTranslation,
	loadZentrum,
} from './loader'
import type { MenuLink } from './menu'
import { resolveMenus } from './menu'
import type { NavigationLink, NavigationNode } from './navigation'
import { buildNavigation, listSitemap } from './navigation'
import { summarizeRundgang } from './rundgang'
import { buildStationNavigation, orderStationen } from './station'
import { resolveThemen } from './thema'
import { localizeSeite, localizeViertel } from './translation'
import { orderViertel } from './viertel'

// Every configured locale's resolved documents, keyed by locale then by
// document ID (issue #36) — buildContentGraph's one shared pattern for
// translating any document list, so Seite and Viertel don't each write their
// own lookup map.
function localizeAll<T extends { readonly id: string }>(
	locales: readonly string[],
	documents: readonly T[],
	localize: (document: T, locale: string) => T,
): ReadonlyMap<string, ReadonlyMap<string, T>> {
	return new Map(
		locales.map((locale) => [
			locale,
			new Map(documents.map((document) => [document.id, localize(document, locale)])),
		]),
	)
}

// A locale's localized documents as a list, the shared shape behind every
// getLocalized*() accessor and resolveUrl's own locale loop (issue #36).
function localizedList<T>(byLocale: ReadonlyMap<string, ReadonlyMap<string, T>>, locale: string) {
	return [...(byLocale.get(locale)?.values() ?? [])]
}

// resolveUrl's one lookup shape, shared between the German list and each
// configured locale's own localized list (issue #36).
function findByUrl<T extends { readonly url: string }>(
	documents: readonly T[],
	url: string,
): T | undefined {
	return documents.find((document) => document.url === url)
}

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
	// Without `locale`, the German document. With a configured locale
	// (issue #36, below), that locale's translated view: translatable fields
	// from its translation file when one sets them, the German document's
	// otherwise, and a `/<locale>`-prefixed URL (ADR-0001) — undefined for an
	// unconfigured locale, the same as an unknown `id`.
	getSeite(id: string, locale?: string): Seite | undefined
	getBody(id: string): ReturnType<typeof importBody>
	// The extra locales configured for translation (issue #36, ADR-0001):
	// empty by default, since no extra locale ships — buildContentGraph's
	// caller passes a non-empty list only to exercise this plumbing (real
	// callers never do, so prefixed routes only exist once a locale is
	// configured here).
	readonly locales: readonly string[]
	// Every Seite translated into `locale`, the source for a prefixed route
	// per Seite once a locale is configured — empty for an unconfigured one.
	getLocalizedSeiten(locale: string): readonly Seite[]
	// Resolves a URL (the catch-all route's own joined `slug` param) back to
	// the Seite or Viertel it names and, for a locale's own prefixed URL,
	// that locale — the one place a URL is parsed instead of built, so a
	// route asks the graph rather than parsing a locale prefix by hand
	// (ADR-0001, ADR-0003). A Viertel's own unprefixed German URL also
	// resolves here, even though its dedicated route
	// (src/app/stadt/[viertel]/page.tsx) is the one Next.js actually serves
	// it from — this stays the graph's one complete URL→document mapping.
	resolveUrl(
		url: string,
	):
		| { readonly kind: 'seite'; readonly seite: Seite; readonly locale?: string }
		| { readonly kind: 'viertel'; readonly viertel: Viertel; readonly locale?: string }
		| undefined
	readonly navigation: NavigationNode
	// The Sitemap page and sitemap.xml both read this instead of re-deriving
	// it: every content type's published documents, flattened into one list
	// (issue #34, extended to every type in issue #60).
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
	// Without `locale`, the German document; with a configured locale, that
	// locale's translated view (issue #36) — the same rule getSeite's own
	// `locale` parameter follows, above.
	getViertel(id: string, locale?: string): Viertel | undefined
	// Every Viertel translated into `locale` (issue #36) — the Viertel
	// counterpart of getLocalizedSeiten, above; empty for an unconfigured
	// locale.
	getLocalizedViertel(locale: string): readonly Viertel[]
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

export interface ContentGraphOptions {
	// Next assigns NODE_ENV 'development' only for `next dev`, 'production'
	// for every other command (`next build` included) — the exact dev/build
	// split issue #33 wants: in dev a Draft (glossary) renders like any other
	// Seite, including in Navigation and Menus; by default (every other
	// caller, content:check included) it's hidden from both, has no page, and
	// a Menu entry referencing it fails instead of resolving.
	readonly development?: boolean
	readonly locales?: readonly string[]
}

// The one public interface for content (ADR-0002): built from loader output,
// and able to load any content directory so tests can point it at fixtures.
// `locales` (issue #36, ADR-0001) is the extra locales configured for
// translation beyond German, the default: empty for every real caller, so
// production never attempts a translation lookup at all; a test passes a
// non-empty list to exercise this plumbing with a test-only locale.
export function buildContentGraph(
	contentDir: string,
	options: ContentGraphOptions = {},
): ContentGraph {
	const { development = false, locales = [] } = options

	// The full set, Draft included, is what meta.json and a Menu file are
	// reconciled against — a Draft is still a real file on disk, so hiding it
	// from the exposed graph below is `isVisible`'s job, not loadSeiten's.
	const allSeiten = loadSeiten(contentDir)
	const isVisible = (seite: Seite) => development || !seite.draft
	const seiten = allSeiten.filter(isVisible)
	const seitenByLocale = localizeAll(locales, seiten, (seite, locale) =>
		localizeSeite(seite, locale, loadSeiteTranslation(contentDir, seite.id, locale)),
	)

	const navigation = buildNavigation(allSeiten, loadMeta(contentDir), isVisible)
	const site = loadSite(contentDir)
	const menus = resolveMenus(allSeiten, loadMenus(contentDir), isVisible)
	const viertel = orderViertel(loadViertelOrder(contentDir), loadViertelDocuments(contentDir))
	const viertelByLocale = localizeAll(locales, viertel, (item, locale) =>
		localizeViertel(item, locale, loadViertelTranslation(contentDir, item.id, locale)),
	)
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
		getSeite(id, locale) {
			if (locale !== undefined) return seitenByLocale.get(locale)?.get(id)
			return seiten.find((seite) => seite.id === id)
		},
		getBody: importBody,
		locales,
		getLocalizedSeiten(locale) {
			return localizedList(seitenByLocale, locale)
		},
		resolveUrl(url) {
			const germanSeite = findByUrl(seiten, url)
			if (germanSeite) return { kind: 'seite', seite: germanSeite }

			const germanViertel = findByUrl(viertel, url)
			if (germanViertel) return { kind: 'viertel', viertel: germanViertel }

			for (const locale of locales) {
				const localizedSeite = findByUrl(localizedList(seitenByLocale, locale), url)
				if (localizedSeite) return { kind: 'seite', seite: localizedSeite, locale }

				const localizedViertel = findByUrl(localizedList(viertelByLocale, locale), url)
				if (localizedViertel) return { kind: 'viertel', viertel: localizedViertel, locale }
			}

			return undefined
		},
		navigation: navigation.tree,
		// Published-only in or out of `next dev`: it reads the full Seiten set
		// to find Drafts itself, not the dev-aware `seiten`.
		sitemap: listSitemap({
			tree: navigation.tree,
			seiten: allSeiten,
			zentrum,
			viertel,
			aufsaetze,
			kapitel,
			abschnitteByKapitel,
			themen,
			rundgaenge,
			stationenByRundgang,
		}),
		getBreadcrumbs: navigation.getBreadcrumbs,
		getPrevious: navigation.getPrevious,
		getNext: navigation.getNext,
		site,
		getMenu(name) {
			return menus.get(name) ?? []
		},
		viertel,
		getViertel(id, locale) {
			if (locale !== undefined) return viertelByLocale.get(locale)?.get(id)
			return viertel.find((item) => item.id === id)
		},
		getLocalizedViertel(locale) {
			return localizedList(viertelByLocale, locale)
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
