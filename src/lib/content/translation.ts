import type { Seite, Translation, Viertel } from './loader'

// A document's own URL translated into `locale` (issue #36, ADR-0001):
// German stays unprefixed, every other locale's URL carries a `/<locale>`
// prefix. A translation may set its own slug, replacing the document's own
// final path segment — an ancestor segment is never translated by this
// mechanism, since no sub-issue needs a nested translated tree yet.
function localizedUrl(id: string, locale: string, slug: string | undefined): string {
	if (id === '') return slug === undefined ? `/${locale}` : `/${locale}/${slug}`
	const segments = id.split('/')
	if (slug !== undefined) segments[segments.length - 1] = slug
	return `/${locale}/${segments.join('/')}`
}

// A Seite translated into `locale` (issue #36): title, Short title,
// description, slug and body come from the translation when it sets them,
// the German document otherwise — a missing translation (`translation` is
// undefined) falls back to the German document entirely. Every other field
// (draft) is always the German document's; loader.ts's translatableKeys
// keeps a translation file from setting it in the first place.
export function localizeSeite(
	seite: Seite,
	locale: string,
	translation: Translation | undefined,
): Seite {
	return {
		...seite,
		title: translation?.frontmatter.title ?? seite.title,
		shortTitle: translation?.frontmatter.shortTitle ?? seite.shortTitle,
		description: translation?.frontmatter.description ?? seite.description,
		body: translation?.body ?? seite.body,
		url: localizedUrl(seite.id, locale, translation?.frontmatter.slug),
	}
}

// A Viertel translated into `locale` (issue #36): the same base fields as a
// Seite, plus its own Leitsatz and Steckbrief (content-layer.md). Its number
// always stays the German document's — it comes from the Viertel order file,
// never from a translation.
export function localizeViertel(
	viertel: Viertel,
	locale: string,
	translation: Translation | undefined,
): Viertel {
	return {
		...viertel,
		title: translation?.frontmatter.title ?? viertel.title,
		shortTitle: translation?.frontmatter.shortTitle ?? viertel.shortTitle,
		description: translation?.frontmatter.description ?? viertel.description,
		leitsatz: translation?.frontmatter.leitsatz ?? viertel.leitsatz,
		steckbrief: translation?.frontmatter.steckbrief ?? viertel.steckbrief,
		body: translation?.body ?? viertel.body,
		url: localizedUrl(viertel.id, locale, translation?.frontmatter.slug),
	}
}
