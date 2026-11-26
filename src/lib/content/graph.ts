import path from 'node:path'

import { orderAbschnitte } from './abschnitt'
import { resolveAufsaetze } from './aufsatz'
import { validateViertelTeaserReferences } from './body'
import { flattenSet, lookupSet } from './documents'
import {
	ABSCHNITT_ORDER_FIELD,
	RUNDGANG_ORDER_FIELD,
	STATION_ORDER_FIELD,
	VIERTEL_ORDER_FIELD,
} from './errors'
import { resolveKapitel } from './kapitel'
import {
	listLoaded,
	loadDocuments,
	loadMenus,
	loadMeta,
	loadOrder,
	loadSite,
	loadTranslations,
	validateBodyImages,
} from './loader'
import { parentId, RUNDGAENGE_DIR, STADT_DIR } from './locations'
import type { FlatMenuName, GroupedMenuName, MenuGroupLink, MenuLink, ResolvedMenu } from './menu'
import { resolveMenus } from './menu'
import { buildNavigation } from './navigation'
import { orderRundgaenge, summarizeRundgang } from './rundgang'
import { listSitemap } from './sitemap'
import { orderStationen } from './station'
import { resolveThemen } from './thema'
import { buildTrail } from './trail'
import { localizeSet } from './translation'
import type {
	Abschnitt,
	Aufsatz,
	ContentKind,
	ContentSet,
	Kapitel,
	KindMap,
	NavigationLink,
	NavigationNode,
	ResolvedDocument,
	Rundgang,
	Seite,
	Site,
	Station,
	Thema,
	Viertel,
	Zentrum,
} from './types'
import { pathUrl } from './urls'
import { orderViertel, resolveHinweise, resolveZentrum } from './viertel'

// Compiles a document's MDX body through Next's MDX pipeline (ADR-0002) — the
// one place in the module that imports `@/content` dynamically, so pages
// never do (issue #55). With a locale, the body is its translation file's
// (issue #36); the caller only passes one that has such a file. Each template
// covers the German file and every translation: `index.mdx` or
// `index.<locale>.mdx`. The dynamic extension part is never empty, because
// Turbopack's pattern for an empty-able part leaves files out at runtime, and
// a pattern for translations alone matches no file (none ship) and fails the
// build. The root Seite (`id === ''`) needs its own template, because
// `@/content//index.mdx` has no matching file (issue #25).
async function importBody(id: string, locale?: string) {
	const extension = locale === undefined ? 'mdx' : `${locale}.mdx`
	return id === ''
		? (await import(`@/content/index.${extension}`)).default
		: (await import(`@/content/${id}/index.${extension}`)).default
}

export interface ContentGraph {
	// The extra locales configured for translation (issue #36, ADR-0001):
	// empty by default, since no extra locale ships — the prefixed routes
	// exist only once a locale is configured (graph.ts's CONFIGURED_LOCALES).
	readonly locales: readonly string[]

	// Every published Seite. A production graph (`development` false) exposes
	// no Draft of any type, here or in any list, getter, count, related list,
	// Menu, Navigation, the Sitemap, resolveUrl or localized document below
	// (issue #33); a development graph exposes Drafts like any document.
	readonly seiten: readonly Seite[]
	// Every getter below returns the German document, or with a configured
	// locale (issue #36) that locale's translated view: translatable fields
	// from its translation file when one sets them, the German document's
	// otherwise, and a `/<locale>`-prefixed URL (ADR-0001, ADR-0003) —
	// undefined for an unconfigured locale, the same as an unknown `id`.
	getSeite(id: string, locale?: string): Seite | undefined

	// Compiles a document's MDX body. With a configured locale whose
	// translation file for this document exists, that file's body; the German
	// body otherwise.
	getBody(id: string, locale?: string): ReturnType<typeof importBody>

	// Resolves a URL (the catch-all route's own joined `slug` param) back to
	// the document of any type it names, tagged by `kind`, and, for a
	// locale's own prefixed URL, that locale — the one place a URL is parsed
	// instead of built, so a route asks the graph rather than parsing a
	// locale prefix by hand (ADR-0001, ADR-0003).
	resolveUrl(url: string): ResolvedDocument | undefined
	// Every published document of every type translated into `locale`, in the
	// same shape as resolveUrl's result — the source for a prefixed route per
	// document once a locale is configured. Empty for an unconfigured locale.
	getLocalizedDocuments(locale: string): readonly ResolvedDocument[]

	// The Seite hierarchy (glossary: Navigation).
	readonly navigation: NavigationNode
	// The Sitemap page and sitemap.xml both read this instead of re-deriving
	// it: every published document of every type as a tree rooted at the start
	// Seite, each type nested under its area's Seite (issue #34, #60);
	// `flattenNavigation` turns it into the depth-first list sitemap.xml needs.
	// Published only, in or out of development.
	readonly sitemap: NavigationNode
	// For a document of any type: its trail from the root, Seite ancestors and
	// type ancestors alike (Start › Stadt › Viertel › Kapitel › Abschnitt;
	// Start › Rundgänge › Rundgang › Station), the document itself last.
	// Empty for an unknown or hidden ID.
	getBreadcrumbs(id: string): readonly NavigationLink[]
	// Seiten walk Navigation; Viertel their stadt/meta.json number order (with
	// a neighbour's `number` set, issue #82); Abschnitte all Abschnitte in
	// Kapitel number order, across Kapitel; Kapitel all Kapitel in number
	// order; Stationen their own Rundgang's; Rundgänge and Themen their own
	// resolved list order. Undefined at either end of a sequence, for the
	// Zentrum, and for every other type.
	getPrevious(id: string): NavigationLink | undefined
	getNext(id: string): NavigationLink | undefined

	readonly site: Site
	// name is the Menu file's basename (header, footer, …). An unlisted Menu
	// returns an empty list rather than throwing. An entry's ID may name a
	// published document of any type. A grouped Menu resolves to labelled
	// groups of links instead of a flat list (glossary: Menu group).
	// The names RootLayout reads resolve to a known shape (menu.ts's
	// FLAT_MENU_NAMES/GROUPED_MENU_NAMES, checked while the graph is built), so
	// they type as that shape; any other name stays a ResolvedMenu.
	getMenu(name: FlatMenuName): readonly MenuLink[]
	getMenu(name: GroupedMenuName): readonly MenuGroupLink[]
	getMenu(name: string): ResolvedMenu

	// The Viertel (glossary), ordered and numbered by stadt/meta.json.
	readonly viertel: readonly Viertel[]
	getViertel(id: string, locale?: string): Viertel | undefined
	// The Zentrum (glossary): its own type, exactly one per site — undefined
	// only in a production graph while it is a Draft.
	readonly zentrum: Zentrum | undefined
	// Every Aufsatz (glossary), each resolved to its Viertel (issue #29).
	readonly aufsaetze: readonly Aufsatz[]
	getAufsatz(id: string, locale?: string): Aufsatz | undefined
	// A Viertel's related Aufsätze ("Mehr aus dem Viertel") — derived from
	// each Aufsatz's Viertel reference, never listed by hand.
	getAufsaetzeByViertel(viertelId: string): readonly Aufsatz[]
	// Every Kapitel of the Leitthema (issue #30), in Kapitel number order
	// (ADR-0003: "Kapitel n = Viertel n"). A Viertel has at most one.
	readonly kapitel: readonly Kapitel[]
	getKapitel(id: string, locale?: string): Kapitel | undefined
	getKapitelByViertel(viertelId: string): Kapitel | undefined
	// A Kapitel's published Abschnitte, ordered by its own meta.json — never
	// listed by hand on the Kapitel itself; "N Abschnitte" is this list's
	// length.
	getAbschnitteByKapitel(kapitelId: string): readonly Abschnitt[]
	getAbschnitt(id: string, locale?: string): Abschnitt | undefined
	// Every Rundgang (issue #32), each with its Stationen count and duration
	// derived from its own published Stationen — never written by hand.
	readonly rundgaenge: readonly Rundgang[]
	getRundgang(id: string, locale?: string): Rundgang | undefined
	// A Rundgang's published Stationen, ordered by its own meta.json; "N
	// Stationen" is this list's length.
	getStationenByRundgang(rundgangId: string): readonly Station[]
	getStation(id: string, locale?: string): Station | undefined
	// The Stationen set at a Viertel or the Zentrum — derived from each
	// Station's Ort reference, never listed by hand on the Viertel/Zentrum.
	getStationenByOrt(ortId: string): readonly Station[]
	// The Schauen Rundgang (glossary: Gangart) of a Viertel or the Zentrum
	// (issue #95): the first Rundgang, in `rundgaenge`' own order, with a
	// published Station at that Ort — undefined when no Rundgang visits it.
	// An Ort can stand in several Rundgänge; this is the one the Stadtplan
	// Übersicht shows alongside the Ort's Kapitel in the Leitthema.
	getSchauenRundgang(ortId: string): Rundgang | undefined
	// The Ort's own Station on its Schauen Rundgang (issue #97) — undefined
	// alongside getSchauenRundgang whenever no Rundgang visits it. Shares
	// getSchauenRundgang's lookup; the Viertel page and the Stadtplan-Hub
	// use it. stadt-tabelle-rows.ts derives its own, as it deliberately uses
	// the Zentrum's Rundgang for every row.
	getSchauenStation(ortId: string): Station | undefined
	// The three Themen (issue #31, ADR-0003): the Leitthema and each
	// Themen-Ort, both documents at src/content/themen/<slug>/. The Leitthema
	// has no kapitelId and lists every Kapitel on its own landing page; a
	// Themen-Ort's kapitelId names the one Kapitel it branches off from.
	readonly themen: readonly Thema[]
	getThema(id: string, locale?: string): Thema | undefined
	// A Kapitel's Themen-Ort(e), derived from each Thema's Kapitel reference
	// — never listed by hand on the Kapitel itself.
	getThemenByKapitel(kapitelId: string): readonly Thema[]
	// The Leitthema itself (the one Thema with no kapitelId), looked up once
	// instead of each caller re-deriving it from `themen` (issue #95's
	// zentrumRow/headings did; issue #96's Viertel Bild-Hero badge is the
	// third). Undefined only while no Leitthema is published.
	readonly leitthema: Thema | undefined

	// Every relative image a published document's body references (translations
	// included), resolved to its path under the content directory (body.ts) —
	// content-images.mts copies each one into public/content/ before next
	// build, so the static export can serve it (issue #35).
	readonly bodyImages: readonly string[]
}

export interface ContentGraphOptions {
	// Next assigns NODE_ENV 'development' only for `next dev`, 'production'
	// for every other command (`next build` included) — the exact dev/build
	// split issue #33 wants: in dev a Draft (glossary) of any type renders
	// like any other document, including in lists, Navigation and Menus; by
	// default (every other caller, content:check included) it's hidden from
	// all of them, has no page, and a published document, Menu entry or body
	// component naming it fails instead of resolving.
	readonly development?: boolean
	readonly locales?: readonly string[]
}

function groupByParent<T extends { readonly id: string }>(documents: readonly T[]) {
	const groups = new Map<string, T[]>()
	for (const document of documents) {
		const parent = parentId(document.id) ?? ''
		groups.set(parent, [...(groups.get(parent) ?? []), document])
	}
	return groups
}

// The one public interface for content (ADR-0002): built from loader output,
// and able to load any content directory so tests and scripts can point it
// at fixtures. Routes and components call `contentGraph()` instead.
//
// Every document of every type is loaded and fully validated — references,
// order files, bodies, translations — Drafts included (issue #33). Only then
// is the exposed set cut down to the visible documents, with numbers
// assigned over what remains, so a production graph has no gaps in them.
// `locales` (issue #36, ADR-0001) is the extra locales configured for
// translation beyond German: empty for every real caller; a test passes a
// non-empty list to exercise this plumbing with a test-only locale.
export function buildContentGraph(
	contentDir: string,
	options: ContentGraphOptions = {},
): ContentGraph {
	const { development = false, locales = [] } = options
	function isVisible(document: { readonly draft: boolean }) {
		return development || !document.draft
	}

	const loaded = loadDocuments(contentDir)

	const allSeiten: Seite[] = loaded.seite.map(({ file: _file, ...document }) => ({
		...document,
		url: pathUrl(document.id),
	}))
	const seiten = allSeiten.filter(isVisible)
	const navigation = buildNavigation(allSeiten, loadMeta(contentDir), isVisible)
	const site = loadSite(contentDir)

	const viertel = orderViertel(
		loadOrder(contentDir, STADT_DIR, VIERTEL_ORDER_FIELD),
		loaded.viertel,
		isVisible,
	)
	const zentrum = resolveZentrum(loaded.zentrum, isVisible)
	const aufsaetze = resolveAufsaetze(loaded.aufsatz, loaded.viertel, isVisible)

	const kapitel = resolveKapitel(loaded.kapitel, loaded.viertel, viertel, isVisible)
	const kapitelById = new Map(kapitel.map((item) => [item.id, item]))
	const abschnittDocuments = groupByParent(loaded.abschnitt)
	// Every Kapitel document gets its Abschnitt order validated, a Draft one
	// included; only a published Kapitel exposes its Abschnitte.
	const abschnitteByKapitel = new Map(
		loaded.kapitel.map((document) => [
			document.id,
			orderAbschnitte(
				document,
				kapitelById.get(document.id),
				loadOrder(contentDir, document.id, ABSCHNITT_ORDER_FIELD),
				abschnittDocuments.get(document.id) ?? [],
				isVisible,
			),
		]),
	)
	const abschnitte = kapitel.flatMap((item) => abschnitteByKapitel.get(item.id) ?? [])
	const themen = resolveThemen(loaded.thema, loaded.kapitel, isVisible)
	const leitthema = themen.find((thema) => thema.kapitelId === undefined)

	const orte = [...loaded.viertel, ...loaded.zentrum]
	const orderedRundgaenge = orderRundgaenge(
		loadOrder(contentDir, RUNDGAENGE_DIR, RUNDGANG_ORDER_FIELD),
		loaded.rundgang,
		loaded.thema,
		isVisible,
	)
	const stationDocuments = groupByParent(loaded.station)
	const stationenByRundgang = new Map<string, readonly Station[]>()
	const rundgaenge: Rundgang[] = []
	let rundgangNumber = 0
	for (const document of orderedRundgaenge) {
		const stationen = orderStationen(
			document,
			isVisible(document) ? { id: document.id, url: pathUrl(document.id) } : undefined,
			loadOrder(contentDir, document.id, STATION_ORDER_FIELD),
			stationDocuments.get(document.id) ?? [],
			orte,
			loaded.zentrum[0]?.id,
			isVisible,
		)
		if (!isVisible(document)) continue
		rundgangNumber += 1
		stationenByRundgang.set(document.id, stationen)
		rundgaenge.push(summarizeRundgang(document, stationen, rundgangNumber))
	}
	const stationen = rundgaenge.flatMap((item) => stationenByRundgang.get(item.id) ?? [])
	// The Schauen Rundgang of a Viertel or the Zentrum (issue #95): the first
	// Rundgang, in `rundgaenge`'s own order, with a published Station there.
	// Shared by getSchauenRundgang and getSchauenStation below.
	function schauenRundgangFor(ortId: string) {
		return rundgaenge.find((rundgang) =>
			(stationenByRundgang.get(rundgang.id) ?? []).some((station) => station.ortId === ortId),
		)
	}

	// The published documents of every type, Viertel not yet enriched with
	// their Hinweis: what resolveHinweise below resolves against, since a
	// Hinweis may name a document of any type, including one resolved above
	// this point (issue #93) — the same any-type reference Menus use.
	const setBeforeHinweise: ContentSet = {
		seite: seiten,
		viertel,
		zentrum: zentrum ? [zentrum] : [],
		aufsatz: aufsaetze,
		kapitel,
		abschnitt: abschnitte,
		thema: themen,
		rundgang: rundgaenge,
		station: stationen,
	}
	const everyLoaded = listLoaded(loaded)
	const kindById = new Map<string, ContentKind>(
		everyLoaded.map((document) => [document.id, document.kind]),
	)
	const hinweise = resolveHinweise(
		loaded.viertel,
		{
			known: new Set(kindById.keys()),
			visible: new Map(flattenSet(setBeforeHinweise).map((entry) => [entry.document.id, entry])),
		},
		isVisible,
	)

	// The published documents of every type: what the graph exposes.
	const set: ContentSet = {
		...setBeforeHinweise,
		viertel: viertel.map((item) => ({ ...item, hinweis: hinweise.get(item.id) })),
	}
	const entries = flattenSet(set)
	const lookup = lookupSet(set)

	// Translations (issue #36): loaded for every document, Draft included, so
	// a translation file is validated whether or not its document is exposed.
	const translations = loadTranslations(contentDir, locales, kindById)
	const localized = new Map(
		locales.map((locale) => {
			const ofLocale = translations.get(locale) ?? new Map()
			const seiteSlugs = new Map(
				loaded.seite.flatMap(({ id }): [string, string][] => {
					const slug = ofLocale.get(id)?.frontmatter.slug
					return slug === undefined ? [] : [[id, slug]]
				}),
			)
			const localizedSet = localizeSet(set, locale, ofLocale, seiteSlugs)
			return [
				locale,
				{
					lookup: lookupSet(localizedSet),
					documents: flattenSet(localizedSet).map((entry) => ({ ...entry, locale })),
				},
			]
		}),
	)

	const urlIndex = new Map<string, ResolvedDocument>()
	for (const entry of entries) urlIndex.set(entry.document.url, entry)
	for (const { documents } of localized.values()) {
		for (const entry of documents) {
			if (!urlIndex.has(entry.document.url)) urlIndex.set(entry.document.url, entry)
		}
	}

	const menus = resolveMenus(loadMenus(contentDir), {
		known: new Set(kindById.keys()),
		visible: new Map(entries.map((entry) => [entry.document.id, entry])),
	})
	const trail = buildTrail(set, entries, navigation.getSiblings)

	// Every body of every document, Draft included, is checked for
	// content-referencing components and relative images (issue #35) — after
	// every type above is loaded, since a Viertel teaser can appear in any of
	// their bodies, not just a Seite's. A translation's body is checked like
	// the German one; only a published document's images are exposed.
	const bodyImages = new Set<string>()
	function checkBody(id: string, file: string, body: string, draft: boolean) {
		validateViertelTeaserReferences({ file, draft }, body, loaded.viertel, isVisible)
		const images = validateBodyImages(contentDir, id, file, body)
		if (isVisible({ draft })) images.forEach((image) => bodyImages.add(image))
	}
	for (const document of everyLoaded) {
		checkBody(document.id, document.file, document.body, document.draft)
		for (const ofLocale of translations.values()) {
			const translation = ofLocale.get(document.id)
			if (translation) checkBody(document.id, translation.file, translation.body, document.draft)
		}
	}

	function find<K extends ContentKind>(
		kind: K,
		id: string,
		locale?: string,
	): KindMap[K] | undefined {
		if (locale === undefined) return lookup[kind].get(id)
		return localized.get(locale)?.lookup[kind].get(id)
	}

	function published<T extends { readonly draft: boolean }>(documents: readonly T[]) {
		return documents.filter((document) => !document.draft)
	}

	return {
		locales,
		seiten,
		getSeite: (id, locale) => find('seite', id, locale),
		getBody(id, locale) {
			const translated = locale !== undefined && translations.get(locale)?.has(id)
			return importBody(id, translated ? locale : undefined)
		},
		resolveUrl: (url) => urlIndex.get(url),
		getLocalizedDocuments: (locale) => localized.get(locale)?.documents ?? [],
		navigation: navigation.tree,
		sitemap: listSitemap({
			tree: navigation.tree,
			draftSeitenIds: new Set(seiten.filter((seite) => seite.draft).map((seite) => seite.id)),
			zentrum: zentrum?.draft ? undefined : zentrum,
			viertel: published(viertel),
			aufsaetze: published(aufsaetze),
			kapitel: published(kapitel),
			abschnitte: published(abschnitte),
			themen: published(themen),
			rundgaenge: published(rundgaenge),
			stationen: published(stationen),
		}),
		getBreadcrumbs: trail.getBreadcrumbs,
		getPrevious: trail.getPrevious,
		getNext: trail.getNext,
		site,
		getMenu: ((name: string) => menus.get(name) ?? []) as ContentGraph['getMenu'],
		viertel: set.viertel,
		getViertel: (id, locale) => find('viertel', id, locale),
		zentrum,
		aufsaetze,
		getAufsatz: (id, locale) => find('aufsatz', id, locale),
		getAufsaetzeByViertel: (viertelId) =>
			aufsaetze.filter((aufsatz) => aufsatz.viertelId === viertelId),
		kapitel,
		getKapitel: (id, locale) => find('kapitel', id, locale),
		getKapitelByViertel: (viertelId) => kapitel.find((item) => item.viertelId === viertelId),
		getAbschnitteByKapitel: (kapitelId) => abschnitteByKapitel.get(kapitelId) ?? [],
		getAbschnitt: (id, locale) => find('abschnitt', id, locale),
		rundgaenge,
		getRundgang: (id, locale) => find('rundgang', id, locale),
		getStationenByRundgang: (rundgangId) => stationenByRundgang.get(rundgangId) ?? [],
		getStation: (id, locale) => find('station', id, locale),
		getStationenByOrt: (ortId) => stationen.filter((station) => station.ortId === ortId),
		getSchauenRundgang: schauenRundgangFor,
		getSchauenStation: (ortId) => {
			const rundgang = schauenRundgangFor(ortId)
			return (
				rundgang &&
				stationen.find((station) => station.ortId === ortId && station.rundgangId === rundgang.id)
			)
		},
		themen,
		getThema: (id, locale) => find('thema', id, locale),
		getThemenByKapitel: (kapitelId) => themen.filter((item) => item.kapitelId === kapitelId),
		leitthema,
		bodyImages: [...bodyImages],
	}
}

// The extra locales configured for translation (ADR-0001, issue #36): none
// ships today, so no prefixed route and no translation lookup exists. Adding
// one here is the single switch that turns the plumbing on.
const CONFIGURED_LOCALES: readonly string[] = []

let memoized: ContentGraph | undefined

// The content graph of the real `src/content`, for routes and components
// (the one place they build it, instead of each passing a path): `development`
// follows `next dev` (see ContentGraphOptions), the locales are the
// configured ones. A production build or `next build` memoizes it, since
// content can't change under a running build; `next dev` rebuilds on every
// call so an edited file shows up on the next request.
export function contentGraph(): ContentGraph {
	const development = process.env.NODE_ENV === 'development'
	if (development) return buildRealGraph(development)
	memoized ??= buildRealGraph(development)
	return memoized
}

function buildRealGraph(development: boolean): ContentGraph {
	return buildContentGraph(path.join(process.cwd(), 'src/content'), {
		development,
		locales: CONFIGURED_LOCALES,
	})
}
