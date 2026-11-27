import type { Translation } from './loader'
import type { Abschnitt, BaseDocument, ContentSet, Kapitel, Thema, Viertel } from './types'
import type { UrlScope } from './urls'
import { abschnittUrl, kapitelUrl, pathUrl, stationUrl } from './urls'

// A document translated into a locale (issue #36): title, Short title,
// description and body come from the translation when it sets them, the
// German document otherwise — a missing translation (`translation` is
// undefined) falls back to the German document entirely. Every other field
// (Draft state, numbers, references) is always the German document's;
// loader.ts's translation schemas keep a translation file from setting one
// in the first place. The URL is the caller's: it depends on the type's URL
// rule.
function localizeBase<T extends BaseDocument>(
	document: T,
	translation: Translation | undefined,
	url: string,
): T {
	return {
		...document,
		title: translation?.frontmatter.title ?? document.title,
		shortTitle: translation?.frontmatter.shortTitle ?? document.shortTitle,
		description: translation?.frontmatter.description ?? document.description,
		body: translation?.body ?? document.body,
		url,
	}
}

// A Viertel additionally translates its own Leitsatz, Steckbrief and
// Untertitel (content-layer.md). Its number, `hinweisId` and resolved
// `hinweis` always stay the German document's (issue #93): a reference is
// never translatable, and `hinweis` is derived from it, before translation
// ever runs (graph.ts).
function localizeViertel(viertel: Viertel, translation: Translation | undefined, url: string) {
	return {
		...localizeBase(viertel, translation, url),
		leitsatz: translation?.frontmatter.leitsatz ?? viertel.leitsatz,
		steckbrief: translation?.frontmatter.steckbrief ?? viertel.steckbrief,
		untertitel: translation?.frontmatter.untertitel ?? viertel.untertitel,
	}
}

// A Kapitel additionally translates its own Untertitel (issue #93).
function localizeKapitel(kapitel: Kapitel, translation: Translation | undefined, url: string) {
	return {
		...localizeBase(kapitel, translation, url),
		untertitel: translation?.frontmatter.untertitel ?? kapitel.untertitel,
	}
}

// A Thema additionally translates its own Teaser (issue #149).
function localizeThema(thema: Thema, translation: Translation | undefined, url: string) {
	return {
		...localizeBase(thema, translation, url),
		teaser: translation?.frontmatter.teaser ?? thema.teaser,
	}
}

// An Abschnitt additionally translates its own Leitsatz and Jahr (issue
// #93).
function localizeAbschnitt(
	abschnitt: Abschnitt,
	translation: Translation | undefined,
	url: string,
) {
	return {
		...localizeBase(abschnitt, translation, url),
		leitsatz: translation?.frontmatter.leitsatz ?? abschnitt.leitsatz,
		jahr: translation?.frontmatter.jahr ?? abschnitt.jahr,
	}
}

// Every published document of `set` translated into `locale` (issue #36,
// ADR-0001): German's set, with each document's own translation merged in and
// its URL replaced by the type's URL rule applied to the translated slugs —
// `/<locale>` + the German rule, a translation's `slug` replacing the
// document's own final segment, and, wherever a URL contains an ancestor
// Seite's folder name, that Seite's translated slug (`seiteSlugs`, from every
// Seite's translation, Draft or not). A Kapitel, Abschnitt or Station URL
// continues its translated parent's: Kapitel from its Viertel's, Abschnitt
// from its Kapitel's, Station from its Rundgang's, so the parents go first.
// A pure function, like the German resolvers.
export function localizeSet(
	set: ContentSet,
	locale: string,
	translations: ReadonlyMap<string, Translation>,
	seiteSlugs: ReadonlyMap<string, string>,
): ContentSet {
	const scope: UrlScope = { locale, slugOf: (seiteId) => seiteSlugs.get(seiteId) }
	function slugOf(id: string) {
		return translations.get(id)?.frontmatter.slug
	}

	function localizeAtPath<T extends BaseDocument>(documents: readonly T[]): T[] {
		return documents.map((document) =>
			localizeBase(
				document,
				translations.get(document.id),
				pathUrl(document.id, scope, slugOf(document.id)),
			),
		)
	}

	const viertel = set.viertel.map((document) =>
		localizeViertel(
			document,
			translations.get(document.id),
			pathUrl(document.id, scope, slugOf(document.id)),
		),
	)
	const viertelUrls = new Map(viertel.map((item) => [item.id, item.url]))

	const kapitel = set.kapitel.map((document) =>
		localizeKapitel(
			document,
			translations.get(document.id),
			kapitelUrl(viertelUrls.get(document.viertelId) ?? '', document.number, slugOf(document.id)),
		),
	)
	const kapitelUrls = new Map(kapitel.map((item) => [item.id, item.url]))

	const abschnitt = set.abschnitt.map((document) =>
		localizeAbschnitt(
			document,
			translations.get(document.id),
			abschnittUrl(
				kapitelUrls.get(document.kapitelId) ?? '',
				document.position,
				slugOf(document.id),
			),
		),
	)

	const rundgang = localizeAtPath(set.rundgang)
	const rundgangUrls = new Map(rundgang.map((item) => [item.id, item.url]))

	const station = set.station.map((document) =>
		localizeBase(
			document,
			translations.get(document.id),
			stationUrl(rundgangUrls.get(document.rundgangId) ?? '', document.number, slugOf(document.id)),
		),
	)

	const thema = set.thema.map((document) =>
		localizeThema(
			document,
			translations.get(document.id),
			pathUrl(document.id, scope, slugOf(document.id)),
		),
	)

	return {
		seite: localizeAtPath(set.seite),
		viertel,
		zentrum: localizeAtPath(set.zentrum),
		aufsatz: localizeAtPath(set.aufsatz),
		kapitel,
		abschnitt,
		thema,
		rundgang,
		station,
	}
}
