import path from 'node:path'

import type { ContentKind } from './types'

// Where a content type's files sit under src/content, and how a file path
// turns into a document ID (content-layer.md, "Content types"). A content
// type is decided by where its file sits, never by a frontmatter field. This
// module is pure: no file system access.

// German, the default locale, has no file suffix of its own (ADR-0001); a
// document's ID drops a trailing one, so a later translation shares its
// non-localised ID. "de" sits here only so the ID of a stray file literally
// named *.de.mdx (there shouldn't be one) still collapses correctly — it is
// NOT the configured-locales list (buildContentGraph's own `locales`
// option, issue #36), which is empty by default; the two lists happen to
// share vocabulary but answer different questions.
const ID_SUFFIX_LOCALES = ['de']
const LOCALE_SUFFIX_PATTERN = new RegExp(`\\.(${ID_SUFFIX_LOCALES.join('|')})$`)

// The ID is the path under the content directory, without extension or locale
// suffix. An `index.mdx` file represents the folder it sits in (ADR-0003: a
// Seite's URL is its folder path), so its own "index" segment is dropped too.
export function deriveId(relativePath: string): string {
	const posixPath = relativePath.split(path.sep).join('/')
	const withoutExtension = posixPath.replace(/\.mdx$/, '')
	const withoutLocale = withoutExtension.replace(LOCALE_SUFFIX_PATTERN, '')
	const segments = withoutLocale.split('/')
	if (segments.at(-1) === 'index') segments.pop()
	return segments.join('/')
}

// The content file a document's ID derives from — the inverse of deriveId —
// or, with `locale`, its translation file's (index.<locale>.mdx, issue #36).
// For the error messages a body-level check or a reference check throws,
// since by then the original relativePath is out of scope.
export function documentFile(id: string, locale?: string): string {
	const name = locale === undefined ? 'index.mdx' : `index.${locale}.mdx`
	return id === '' ? name : path.join(id, name)
}

// A folder's ID is the ID of the folder that contains it; the root ('') has
// none.
export function parentId(id: string): string | undefined {
	if (id === '') return undefined
	return id.split('/').slice(0, -1).join('/')
}

// A relative path's directory, POSIX-separated regardless of platform — every
// location rule below tests this against its own pattern.
function relativeDir(relativePath: string): string {
	return path.dirname(relativePath).split(path.sep).join('/')
}

// Stadt area (ADR-0003): a document directly inside src/content/stadt/<slug>/
// is the Zentrum if slug is "zentrum", a Viertel otherwise. stadt/index.mdx
// itself (no further segment) is a plain Seite, the Stadt area's landing
// page.
export const STADT_DIR = 'stadt'
const ZENTRUM_SLUG = 'zentrum'
const STADT_CHILD_PATTERN = /^stadt\/([^/]+)$/

// Aufsatz (issue #29): directly inside src/content/bibliothek/aufsaetze/<slug>/.
const AUFSATZ_CHILD_PATTERN = /^bibliothek\/aufsaetze\/[^/]+$/

// Kapitel and Abschnitt (issue #30): a Kapitel belongs to the Leitthema, not
// to the Viertel it's set in, so it sits directly inside
// src/content/leitthema/<slug>/. An Abschnitt sits one level deeper, inside
// its Kapitel's own folder.
const KAPITEL_CHILD_PATTERN = /^leitthema\/[^/]+$/
const ABSCHNITT_CHILD_PATTERN = /^leitthema\/[^/]+\/[^/]+$/

// Rundgang and Station (issue #32): the same shape as Kapitel/Abschnitt,
// under src/content/rundgaenge/.
export const RUNDGAENGE_DIR = 'rundgaenge'
const RUNDGANG_CHILD_PATTERN = /^rundgaenge\/[^/]+$/
const STATION_CHILD_PATTERN = /^rundgaenge\/[^/]+\/[^/]+$/

// Thema and Themen-Ort (issue #31): both kinds sit directly inside
// src/content/themen/<slug>/, at the same level. Which kind a document is
// comes from whether its frontmatter carries a Kapitel reference, not from a
// further location rule.
const THEMA_CHILD_PATTERN = /^themen\/[^/]+$/

// The content type a (non-translation) file under src/content belongs to.
export function kindOfPath(relativePath: string): ContentKind {
	const dir = relativeDir(relativePath)
	const stadtSlug = STADT_CHILD_PATTERN.exec(dir)?.[1]
	if (stadtSlug !== undefined) return stadtSlug === ZENTRUM_SLUG ? 'zentrum' : 'viertel'
	if (AUFSATZ_CHILD_PATTERN.test(dir)) return 'aufsatz'
	if (KAPITEL_CHILD_PATTERN.test(dir)) return 'kapitel'
	if (ABSCHNITT_CHILD_PATTERN.test(dir)) return 'abschnitt'
	if (RUNDGANG_CHILD_PATTERN.test(dir)) return 'rundgang'
	if (STATION_CHILD_PATTERN.test(dir)) return 'station'
	if (THEMA_CHILD_PATTERN.test(dir)) return 'thema'
	return 'seite'
}

// A meta.json in one of these folders orders non-Seite children — the
// Viertel (stadt/meta.json), the Rundgänge (rundgaenge/meta.json, issue
// #116), a Kapitel's Abschnitte and a Rundgang's Stationen — and is read by
// its own required-order loader (loader.ts's loadOrder). The generic
// Seite-order scan skips it, so Navigation's strict Seite-only validation
// never sees it.
export function isNonSeiteMetaDir(relativeMetaPath: string): boolean {
	const dir = relativeDir(relativeMetaPath)
	return (
		dir === STADT_DIR ||
		dir === RUNDGAENGE_DIR ||
		KAPITEL_CHILD_PATTERN.test(dir) ||
		RUNDGANG_CHILD_PATTERN.test(dir)
	)
}

// A document's translation file (issue #36), e.g. idee/index.mdx's sibling
// idee/index.xx.mdx for locale "xx" — excluded from the standalone-document
// listing by shape, so it's never mistaken for a separate document by any
// type's location rule, configured locale or not.
const TRANSLATION_FILE_PATTERN = /\.([a-z]{2,3})\.mdx$/

export function isTranslationPath(relativePath: string): boolean {
	return TRANSLATION_FILE_PATTERN.test(relativePath)
}

// The locale suffix of a translation file's path, e.g. "xx" for
// idee/index.xx.mdx.
export function translationLocale(relativePath: string): string | undefined {
	return TRANSLATION_FILE_PATTERN.exec(relativePath)?.[1]
}
