import fs from 'node:fs'
import path from 'node:path'

import type { z } from 'zod'

import { extractRelativeImages, resolveBodyAssetPath } from './body'
import {
	ABSCHNITT_ORDER_FIELD,
	BODY_IMAGE_FIELD,
	ContentValidationError,
	FRONTMATTER_FIELD,
	MENU_FIELD,
	META_FIELD,
	SITE_FIELD,
	STATION_ORDER_FIELD,
	VIERTEL_ORDER_FIELD,
	ZENTRUM_FIELD,
} from './errors'
import { splitDocument } from './frontmatter'
import type { MenuEntry, Site, TranslationFrontmatter, ViertelSteckbrief } from './schemas'
import {
	abschnittFrontmatterSchema,
	aufsatzFrontmatterSchema,
	kapitelFrontmatterSchema,
	menuSchema,
	metaSchema,
	rundgangFrontmatterSchema,
	seiteFrontmatterSchema,
	siteSchema,
	stationFrontmatterSchema,
	themaFrontmatterSchema,
	translationFrontmatterSchema,
	viertelFrontmatterSchema,
	viertelOrderSchema,
	zentrumFrontmatterSchema,
} from './schemas'

export type { Site, ViertelSteckbrief } from './schemas'

// German, the default locale, has no file suffix of its own (ADR-0001); a
// document's ID drops a trailing one, so a later translation shares its
// non-localised ID. "de" sits here only so the ID of a stray file literally
// named *.de.mdx (there shouldn't be one) still collapses correctly — it is
// NOT the configured-locales list (buildContentGraph's own `locales`
// parameter, issue #36), which is empty by default and non-empty only in
// tests exercising a translation; the two lists happen to share vocabulary
// but answer different questions, so this one is named for its own purpose
// rather than reusing "locales".
const ID_SUFFIX_LOCALES = ['de']
const LOCALE_SUFFIX_PATTERN = new RegExp(`\\.(${ID_SUFFIX_LOCALES.join('|')})$`)

export interface Seite {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly draft: boolean
	readonly body: string
}

// A document carrying a title and an optional Short title: every content
// type (Seite, Viertel, Zentrum) satisfies this, without the helper below
// claiming any one of them by name.
export interface ShortTitled {
	readonly title: string
	readonly shortTitle?: string
}

// The glossary's Short title: a document's shorter name for places where
// space is tight (Menus, breadcrumbs, previous/next), its title otherwise.
// Navigation and Menu resolution both use this one rule.
export function shortTitleOrTitle(document: ShortTitled): string {
	return document.shortTitle ?? document.title
}

// The ID is the path under the content directory, without extension or locale
// suffix. An `index.mdx` file represents the folder it sits in (ADR-0003: a
// Seite's URL is its folder path), so its own "index" segment is dropped too.
function deriveId(relativePath: string): string {
	const posixPath = relativePath.split(path.sep).join('/')
	const withoutExtension = posixPath.replace(/\.mdx$/, '')
	const withoutLocale = withoutExtension.replace(LOCALE_SUFFIX_PATTERN, '')
	const segments = withoutLocale.split('/')
	if (segments.at(-1) === 'index') segments.pop()
	return segments.join('/')
}

function seiteUrl(id: string): string {
	return id === '' ? '/' : `/${id}`
}

// The content file a document's ID derives from — the inverse of deriveId,
// for the error messages a body-level check (below) or a reference check
// (a Menu entry naming a Draft, issue #33) throws, since by the time those
// run the original relativePath is out of scope.
export function documentFile(id: string): string {
	return id === '' ? 'index.mdx' : path.join(id, 'index.mdx')
}

// A relative path's directory, POSIX-separated regardless of platform — every
// location rule below tests this against its own pattern.
function relativeDir(relativePath: string): string {
	return path.dirname(relativePath).split(path.sep).join('/')
}

// Location rule (content-layer.md) for the Stadt area (ADR-0003): a document
// directly inside src/content/stadt/<slug>/ is the Zentrum if slug is
// "zentrum", a Viertel otherwise. stadt/index.mdx itself (no further
// segment) is a plain Seite, the Stadt area's landing page.
const STADT_DIR = 'stadt'
const ZENTRUM_SLUG = 'zentrum'
const STADT_CHILD_PATTERN = /^stadt\/([^/]+)$/

function stadtChildSlug(relativePath: string): string | undefined {
	return STADT_CHILD_PATTERN.exec(relativeDir(relativePath))?.[1]
}

function isViertelPath(relativePath: string): boolean {
	const slug = stadtChildSlug(relativePath)
	return slug !== undefined && slug !== ZENTRUM_SLUG
}

function isZentrumPath(relativePath: string): boolean {
	return stadtChildSlug(relativePath) === ZENTRUM_SLUG
}

// Location rule for Aufsatz (issue #29, ADR-0003): a document directly
// inside src/content/bibliothek/aufsaetze/<slug>/ — its own rule, the same
// shape as the Stadt area's, since a content type is decided by where its
// file sits, never by a frontmatter field.
const AUFSATZ_CHILD_PATTERN = /^bibliothek\/aufsaetze\/[^/]+$/

function isAufsatzPath(relativePath: string): boolean {
	return AUFSATZ_CHILD_PATTERN.test(relativeDir(relativePath))
}

// Location rule for Kapitel and Abschnitt (issue #30, ADR-0003): a Kapitel
// belongs to the Leitthema, not to the Viertel it's set in, so it sits
// directly inside src/content/leitthema/<slug>/ — its files, not the Viertel
// folder's. An Abschnitt sits one level deeper, inside its Kapitel's own
// folder.
const KAPITEL_CHILD_PATTERN = /^leitthema\/[^/]+$/
const ABSCHNITT_CHILD_PATTERN = /^leitthema\/[^/]+\/[^/]+$/

function isKapitelPath(relativePath: string): boolean {
	return KAPITEL_CHILD_PATTERN.test(relativeDir(relativePath))
}

function isAbschnittPath(relativePath: string): boolean {
	return ABSCHNITT_CHILD_PATTERN.test(relativeDir(relativePath))
}

// Location rule for Rundgang and Station (issue #32, ADR-0003): a Rundgang
// sits directly inside src/content/rundgaenge/<slug>/, and a Station one
// level deeper, inside its Rundgang's own folder — the same shape as
// Kapitel/Abschnitt above.
const RUNDGANG_CHILD_PATTERN = /^rundgaenge\/[^/]+$/
const STATION_CHILD_PATTERN = /^rundgaenge\/[^/]+\/[^/]+$/

function isRundgangPath(relativePath: string): boolean {
	return RUNDGANG_CHILD_PATTERN.test(relativeDir(relativePath))
}

function isStationPath(relativePath: string): boolean {
	return STATION_CHILD_PATTERN.test(relativeDir(relativePath))
}

// Location rule for Thema and Themen-Ort (issue #31, ADR-0003): both kinds
// sit directly inside src/content/themen/<slug>/, at the same level — a
// Themen-Ort doesn't move into the Kapitel it branches off from, the way an
// Abschnitt moves into its Kapitel. Which kind a document is comes from
// whether its frontmatter carries a Kapitel reference (schemas.ts), not from
// a further location rule.
const THEMA_CHILD_PATTERN = /^themen\/[^/]+$/

function isThemaPath(relativePath: string): boolean {
	return THEMA_CHILD_PATTERN.test(relativeDir(relativePath))
}

// One frontmatter validator for every content type: only the schema differs
// between Seite, Viertel and Zentrum.
function validateFrontmatter<T>(schema: z.ZodType<T>, file: string, data: unknown): T {
	const result = schema.safeParse(data)
	if (!result.success) {
		const issue = result.error.issues[0]
		const field = issue.path.length > 0 ? issue.path.join('.') : FRONTMATTER_FIELD
		throw new ContentValidationError(file, field, issue.message)
	}
	return result.data
}

// A document's own translation file (issue #36), e.g. idee/index.mdx's
// sibling idee/index.xx.mdx for locale "xx" — excluded here, by shape, so
// it's never mistaken for a separate standalone document by whatever type's
// location rule scans this folder, configured locale or not (a stray
// translation file for an unconfigured locale should still never become a
// bogus document). loadTranslation (below) is the one place that reads a
// translation file, by its own document's ID, rather than by appearing in
// this listing.
const TRANSLATION_FILE_PATTERN = /\.[a-z]{2,3}\.mdx$/

function isTranslationPath(relativePath: string): boolean {
	return TRANSLATION_FILE_PATTERN.test(relativePath)
}

function listMdxFiles(contentDir: string): string[] {
	const entries = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
		.map((entry) => path.relative(contentDir, path.join(entry.parentPath, entry.name)))
		.filter((relativePath) => !isTranslationPath(relativePath))
		.sort()
}

// A data file is JSON (meta.json, site.json, a Menu file); this is the one
// place that reads it and turns a parse failure into a ContentValidationError.
function readJsonFile(relativePath: string, absolutePath: string, field: string): unknown {
	const raw = fs.readFileSync(absolutePath, 'utf8')
	try {
		return JSON.parse(raw)
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error)
		throw new ContentValidationError(relativePath, field, `invalid JSON: ${reason}`)
	}
}

const META_FILE_NAME = 'meta.json'

export interface Meta {
	// The meta.json path relative to the content directory, for error messages.
	readonly file: string
	readonly order: readonly string[]
}

function listMetaFiles(contentDir: string): string[] {
	const entries = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
	return (
		entries
			.filter((entry) => entry.isFile() && entry.name === META_FILE_NAME)
			.map((entry) => path.relative(contentDir, path.join(entry.parentPath, entry.name)))
			// A Kapitel folder's own meta.json orders its Abschnitte (issue #30,
			// loadAbschnittOrder below), not Seite children — excluded here the same
			// way Viertel/Zentrum/Aufsatz documents are excluded from loadSeiten, so
			// buildNavigation's strict Seite-only validation never sees it.
			.filter((relativePath) => !KAPITEL_CHILD_PATTERN.test(relativeDir(relativePath)))
			// A Rundgang folder's own meta.json orders its Stationen (issue #32,
			// loadStationOrder below), not Seite children — excluded for the same
			// reason as a Kapitel folder's meta.json above.
			.filter((relativePath) => !RUNDGANG_CHILD_PATTERN.test(relativeDir(relativePath)))
			.sort()
	)
}

// meta.json sits beside the index.mdx of the folder it orders, so the folder's
// ID is the same ID the loader would derive for that index.mdx.
function folderIdFromMetaPath(relativePath: string): string {
	const dir = path.dirname(relativePath)
	if (dir === '.') return ''
	return dir.split(path.sep).join('/')
}

// A folder's children's order (issue #26). Keyed by the folder's ID; a folder
// with no meta.json has no entry here, and the content graph sorts its
// children by their natural key instead.
export function loadMeta(contentDir: string): Map<string, Meta> {
	const result = new Map<string, Meta>()

	for (const relativePath of listMetaFiles(contentDir)) {
		const data = readJsonFile(relativePath, path.join(contentDir, relativePath), META_FIELD)

		const parsed = metaSchema.safeParse(data)
		if (!parsed.success) {
			const issue = parsed.error.issues[0]
			throw new ContentValidationError(relativePath, META_FIELD, issue.message)
		}

		result.set(folderIdFromMetaPath(relativePath), { file: relativePath, order: parsed.data })
	}

	return result
}

// The first type is Seite; which folder maps to which type is a decision the
// loader will grow as more content types arrive. A document under the Stadt
// area's Viertel/Zentrum location (above) is excluded: it loads as its own
// type below, not as a Seite.
export function loadSeiten(contentDir: string): Seite[] {
	return listMdxFiles(contentDir)
		.filter(
			(relativePath) =>
				stadtChildSlug(relativePath) === undefined &&
				!isAufsatzPath(relativePath) &&
				!isKapitelPath(relativePath) &&
				!isAbschnittPath(relativePath) &&
				!isRundgangPath(relativePath) &&
				!isStationPath(relativePath) &&
				!isThemaPath(relativePath),
		)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(seiteFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, url: seiteUrl(id), body, ...data }
		})
}

export interface ViertelDocument {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly leitsatz: string
	readonly steckbrief: ViertelSteckbrief
	readonly body: string
}

// A Viertel with its number assigned (viertel.ts): the one shape pages and
// the content graph deal with.
export interface Viertel extends ViertelDocument {
	readonly number: number
}

// Unordered Viertel documents (issue #28): loader.ts only reads and
// validates frontmatter here. Assigning the number from the Viertel order
// file, below, is viertel.ts's job, the same split as meta.json (loader.ts)
// and Navigation (navigation.ts).
export function loadViertelDocuments(contentDir: string): ViertelDocument[] {
	return listMdxFiles(contentDir)
		.filter(isViertelPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(viertelFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, url: seiteUrl(id), body, ...data }
		})
}

const VIERTEL_ORDER_FILE = path.join(STADT_DIR, 'viertel-order.json')

export interface ViertelOrder {
	// The order file's path relative to the content directory, for error messages.
	readonly file: string
	readonly order: readonly string[]
}

// The Viertel order file (issue #28): a bare JSON array of Viertel IDs, in
// display order — the only source of a Viertel's number (never frontmatter).
// Its own file and schema, separate from meta.json: meta.json orders a
// folder's actual children for Navigation, while this file is specific to
// numbering the Viertel and never lists the Zentrum.
export function loadViertelOrder(contentDir: string): ViertelOrder {
	const absolutePath = path.join(contentDir, VIERTEL_ORDER_FILE)
	if (!fs.existsSync(absolutePath)) {
		throw new ContentValidationError(VIERTEL_ORDER_FILE, VIERTEL_ORDER_FIELD, 'file not found')
	}

	const data = readJsonFile(VIERTEL_ORDER_FILE, absolutePath, VIERTEL_ORDER_FIELD)

	const parsed = viertelOrderSchema.safeParse(data)
	if (!parsed.success) {
		const issue = parsed.error.issues[0]
		throw new ContentValidationError(VIERTEL_ORDER_FILE, VIERTEL_ORDER_FIELD, issue.message)
	}

	return { file: VIERTEL_ORDER_FILE, order: parsed.data }
}

export interface Zentrum {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly body: string
}

// The Zentrum (issue #28): its own type, not a Viertel, with exactly one
// document at the location rule above.
export function loadZentrum(contentDir: string): Zentrum {
	const [relativePath] = listMdxFiles(contentDir).filter(isZentrumPath)
	if (!relativePath) {
		const file = path.join(STADT_DIR, ZENTRUM_SLUG, 'index.mdx')
		throw new ContentValidationError(file, ZENTRUM_FIELD, 'file not found')
	}

	const absolutePath = path.join(contentDir, relativePath)
	const raw = fs.readFileSync(absolutePath, 'utf8')
	const { frontmatter, body } = splitDocument(relativePath, raw)
	const data = validateFrontmatter(zentrumFrontmatterSchema, relativePath, frontmatter)
	const id = deriveId(relativePath)
	return { id, url: seiteUrl(id), body, ...data }
}

export interface AufsatzDocument {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly viertelId: string
	readonly body: string
	// The source file's path, only for the reference-resolution error if
	// viertelId doesn't match an actual Viertel (aufsatz.ts, references.ts).
	// Dropped once resolved; an Aufsatz doesn't expose its own file.
	readonly file: string
}

// An Aufsatz (issue #29) with its Viertel reference resolved and its reading
// time computed (aufsatz.ts): the one shape pages and the content graph
// deal with, the same split loadViertelDocuments/orderViertel make.
export interface Aufsatz {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly viertelId: string
	readonly body: string
	readonly readingTimeMinutes: number
}

// Unresolved Aufsatz documents (issue #29): loader.ts only reads and
// validates frontmatter here, the same split as Viertel.
export function loadAufsatzDocuments(contentDir: string): AufsatzDocument[] {
	return listMdxFiles(contentDir)
		.filter(isAufsatzPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(aufsatzFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, url: seiteUrl(id), body, file: relativePath, ...data }
		})
}

export interface KapitelDocument {
	readonly id: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly viertelId: string
	readonly body: string
	// The source file's path, only for the reference-resolution and
	// duplicate-Viertel errors (kapitel.ts, references.ts). Dropped once
	// resolved, the same way AufsatzDocument's does.
	readonly file: string
}

// A Kapitel (issue #30) with its Viertel reference resolved and its number
// and URL derived from that Viertel (kapitel.ts): the one shape pages and
// the content graph deal with. Unlike Viertel/Aufsatz, its URL depends on the
// resolved Viertel's slug and number (ADR-0003), so it can't be assigned
// eagerly here.
export interface Kapitel {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly viertelId: string
	readonly body: string
	readonly number: number
}

// Unresolved Kapitel documents (issue #30): loader.ts only reads and
// validates frontmatter here, the same split as Viertel and Aufsatz.
export function loadKapitelDocuments(contentDir: string): KapitelDocument[] {
	return listMdxFiles(contentDir)
		.filter(isKapitelPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(kapitelFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, body, file: relativePath, ...data }
		})
}

export interface AbschnittDocument {
	readonly id: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly body: string
	// The Kapitel this Abschnitt sits in, derived from its own ID (dropping
	// the last segment) rather than a frontmatter reference — an Abschnitt
	// belongs to its Kapitel by folder location, the same way a Viertel
	// belongs to the Stadt area by location rather than by field.
	readonly kapitelId: string
}

// An Abschnitt (issue #30) with its position, number, URL and reading time
// derived from its Kapitel (abschnitt.ts): the one shape pages and the
// content graph deal with. Like Kapitel, its URL and number depend on
// already-resolved data, so it can't be assigned eagerly here.
export interface Abschnitt {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly body: string
	readonly kapitelId: string
	readonly position: number
	readonly number: string
	readonly readingTimeMinutes: number
}

// Unresolved Abschnitt documents (issue #30): loader.ts only reads and
// validates frontmatter here, the same split as Kapitel.
export function loadAbschnittDocuments(contentDir: string): AbschnittDocument[] {
	return listMdxFiles(contentDir)
		.filter(isAbschnittPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(abschnittFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			const kapitelId = id.split('/').slice(0, -1).join('/')
			return { id, kapitelId, body, ...data }
		})
}

// A Kapitel's own Abschnitt order (issue #30): its own meta.json, read
// directly by this one Kapitel ID rather than through the generic
// listMetaFiles/loadMeta scan above (which is excluded from this path and
// stays Seite-only for Navigation). Required, the same way the Viertel order
// file is: an explicit order is the source of an Abschnitt's position, not a
// natural-key fallback.
export function loadAbschnittOrder(contentDir: string, kapitelId: string): Meta {
	const file = path.join(kapitelId, META_FILE_NAME)
	const absolutePath = path.join(contentDir, file)
	if (!fs.existsSync(absolutePath)) {
		throw new ContentValidationError(file, ABSCHNITT_ORDER_FIELD, 'file not found')
	}

	const data = readJsonFile(file, absolutePath, ABSCHNITT_ORDER_FIELD)

	const parsed = metaSchema.safeParse(data)
	if (!parsed.success) {
		const issue = parsed.error.issues[0]
		throw new ContentValidationError(file, ABSCHNITT_ORDER_FIELD, issue.message)
	}

	return { file, order: parsed.data }
}

export interface RundgangDocument {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly body: string
}

// A Rundgang (issue #32) with its Stationen count and duration derived
// (rundgang.ts): the one shape pages and the content graph deal with. Its
// URL is its folder path (ADR-0003), the same as Viertel/Zentrum/Aufsatz, so
// it's assigned eagerly below rather than by a per-type URL rule.
export interface Rundgang extends RundgangDocument {
	readonly stationenCount: number
	readonly durationMinutes: number
}

// Unresolved Rundgang documents (issue #32): loader.ts only reads and
// validates frontmatter here, the same split as Viertel and Aufsatz.
export function loadRundgangDocuments(contentDir: string): RundgangDocument[] {
	return listMdxFiles(contentDir)
		.filter(isRundgangPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(rundgangFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, url: seiteUrl(id), body, ...data }
		})
}

export interface StationDocument {
	readonly id: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	// The Viertel or the Zentrum this Station stands at, by reference
	// (issue #32), resolved by station.ts against both collections together.
	readonly ortId: string
	readonly body: string
	// The Rundgang this Station sits in, derived from its own ID (dropping
	// the last segment) rather than a frontmatter reference — a Station
	// belongs to its Rundgang by folder location, the same way an Abschnitt
	// belongs to its Kapitel.
	readonly rundgangId: string
	// The source file's path, only for the reference-resolution error if
	// ortId doesn't match an actual Viertel or the Zentrum (station.ts,
	// references.ts). Dropped once resolved, the same way KapitelDocument's
	// and AufsatzDocument's own `file` fields are.
	readonly file: string
}

// A Station (issue #32) with its Ort reference checked, its number derived
// from its position in its Rundgang's own meta.json, and its reading time
// computed (station.ts): the one shape pages and the content graph deal
// with. Like Abschnitt, its URL and number depend on already-resolved data,
// so they can't be assigned eagerly here.
export interface Station {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly ortId: string
	readonly body: string
	readonly rundgangId: string
	readonly number: number
	readonly readingTimeMinutes: number
}

// Unresolved Station documents (issue #32): loader.ts only reads and
// validates frontmatter here, the same split as Abschnitt.
export function loadStationDocuments(contentDir: string): StationDocument[] {
	return listMdxFiles(contentDir)
		.filter(isStationPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(stationFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			const rundgangId = id.split('/').slice(0, -1).join('/')
			return { id, rundgangId, body, file: relativePath, ...data }
		})
}

// A Rundgang's own Station order (issue #32): its own meta.json, read
// directly by this one Rundgang ID, the same way loadAbschnittOrder reads a
// Kapitel's own meta.json rather than through the generic listMetaFiles/
// loadMeta scan above.
export function loadStationOrder(contentDir: string, rundgangId: string): Meta {
	const file = path.join(rundgangId, META_FILE_NAME)
	const absolutePath = path.join(contentDir, file)
	if (!fs.existsSync(absolutePath)) {
		throw new ContentValidationError(file, STATION_ORDER_FIELD, 'file not found')
	}

	const data = readJsonFile(file, absolutePath, STATION_ORDER_FIELD)

	const parsed = metaSchema.safeParse(data)
	if (!parsed.success) {
		const issue = parsed.error.issues[0]
		throw new ContentValidationError(file, STATION_ORDER_FIELD, issue.message)
	}

	return { file, order: parsed.data }
}

export interface ThemaDocument {
	readonly id: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly kapitelId?: string
	readonly body: string
	// The source file's path, only for the reference-resolution error if
	// kapitelId doesn't match an actual Kapitel (thema.ts, references.ts).
	// Dropped once resolved, the same way AufsatzDocument's does.
	readonly file: string
}

// A Thema (issue #31) with its Kapitel reference resolved, if it has one, and
// its URL derived from its own slug (thema.ts): the one shape pages and the
// content graph deal with. The Leitthema has no `kapitelId`; a Themen-Ort's
// names the one Kapitel it branches off from.
export interface Thema {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly kapitelId?: string
	readonly body: string
}

// Unresolved Thema documents (issue #31): loader.ts only reads and validates
// frontmatter here, the same split as Aufsatz and Kapitel.
export function loadThemaDocuments(contentDir: string): ThemaDocument[] {
	return listMdxFiles(contentDir)
		.filter(isThemaPath)
		.map((relativePath) => {
			const absolutePath = path.join(contentDir, relativePath)
			const raw = fs.readFileSync(absolutePath, 'utf8')
			const { frontmatter, body } = splitDocument(relativePath, raw)
			const data = validateFrontmatter(themaFrontmatterSchema, relativePath, frontmatter)
			const id = deriveId(relativePath)
			return { id, body, file: relativePath, ...data }
		})
}
const SITE_FILE_NAME = 'site.json'

// Site-wide facts (issue #27): one data file at the content directory's root.
export function loadSite(contentDir: string): Site {
	const absolutePath = path.join(contentDir, SITE_FILE_NAME)
	if (!fs.existsSync(absolutePath)) {
		throw new ContentValidationError(SITE_FILE_NAME, SITE_FIELD, 'file not found')
	}

	const data = readJsonFile(SITE_FILE_NAME, absolutePath, SITE_FIELD)

	const parsed = siteSchema.safeParse(data)
	if (!parsed.success) {
		const issue = parsed.error.issues[0]
		const field = issue.path.length > 0 ? issue.path.join('.') : SITE_FIELD
		throw new ContentValidationError(SITE_FILE_NAME, field, issue.message)
	}

	return parsed.data
}

// The brand wordmark (PRODUCT.md): the site name and tagline together.
export function siteWordmark(site: Site): string {
	return `${site.name} · ${site.tagline}`
}

const MENUS_DIR_NAME = 'menus'

export interface RawMenu {
	// The Menu file's path relative to the content directory, for error messages.
	readonly file: string
	readonly entries: readonly MenuEntry[]
}

function listMenuFiles(contentDir: string): string[] {
	const menusDir = path.join(contentDir, MENUS_DIR_NAME)
	if (!fs.existsSync(menusDir)) return []

	return fs
		.readdirSync(menusDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
		.map((entry) => path.join(MENUS_DIR_NAME, entry.name))
		.sort()
}

// One JSON file per Menu (issue #27), named after the Menu (header.json,
// footer.json). Keyed by that name; ID resolution against the Seiten happens
// in menu.ts, which stays pure like navigation.ts.
export function loadMenus(contentDir: string): ReadonlyMap<string, RawMenu> {
	const result = new Map<string, RawMenu>()

	for (const relativePath of listMenuFiles(contentDir)) {
		const data = readJsonFile(relativePath, path.join(contentDir, relativePath), MENU_FIELD)

		const parsed = menuSchema.safeParse(data)
		if (!parsed.success) {
			const issue = parsed.error.issues[0]
			throw new ContentValidationError(relativePath, MENU_FIELD, issue.message)
		}

		const name = path.basename(relativePath, '.json')
		result.set(name, { file: relativePath, entries: parsed.data })
	}

	return result
}

// Every relative image a body references (issue #35) must actually sit next
// to the document — the one fs check this module adds for the content
// graph's body validation pass (graph.ts), which calls this once per
// document once every type is loaded. Returns the resolved paths so
// buildContentGraph can expose them as graph.bodyImages, content-images.mts's
// own source of what to copy into the build output.
export function validateBodyImages(contentDir: string, id: string, body: string): string[] {
	const file = documentFile(id)
	return extractRelativeImages(body).map((relativeImagePath) => {
		const resolved = resolveBodyAssetPath(id, relativeImagePath)
		if (!fs.existsSync(path.join(contentDir, resolved))) {
			throw new ContentValidationError(
				file,
				BODY_IMAGE_FIELD,
				`image not found: ${relativeImagePath}`,
			)
		}
		return resolved
	})
}

// Translatable fields (issue #36): every content type's translation file may
// set title, Short title, description and slug; a Viertel's may also set its
// own Leitsatz and Steckbrief (content-layer.md). Every other field — a
// Seite's Draft state, a Viertel's number, any reference — is always the
// German document's; a translation file setting one of those is a
// validation error, not silently ignored, below.
const SEITE_TRANSLATABLE_KEYS = ['title', 'shortTitle', 'description', 'slug']
const VIERTEL_TRANSLATABLE_KEYS = [...SEITE_TRANSLATABLE_KEYS, 'leitsatz', 'steckbrief']

export interface Translation {
	// The translation file's path relative to the content directory, for
	// error messages.
	readonly file: string
	readonly frontmatter: TranslationFrontmatter
	readonly body: string
}

// A document's sibling translation file for one locale (issue #36, ADR-0001),
// e.g. idee/index.mdx's translation for locale "xx" is idee/index.xx.mdx; the
// root Seite's (id '') is index.xx.mdx. Undefined when the locale has no
// translation for this document — the fallback to the German document is
// translation.ts's job, not this function's. A frontmatter key outside
// `translatableKeys` throws naming the file and that key directly, the same
// shape every other ContentValidationError in this module uses.
function loadTranslation(
	contentDir: string,
	id: string,
	locale: string,
	translatableKeys: readonly string[],
): Translation | undefined {
	const base = id === '' ? 'index' : path.join(id, 'index')
	const file = `${base}.${locale}.mdx`
	const absolutePath = path.join(contentDir, file)
	if (!fs.existsSync(absolutePath)) return undefined

	const raw = fs.readFileSync(absolutePath, 'utf8')
	const { frontmatter, body } = splitDocument(file, raw)

	const rawFrontmatter = (frontmatter ?? {}) as Record<string, unknown>
	for (const key of Object.keys(rawFrontmatter)) {
		if (!translatableKeys.includes(key)) {
			throw new ContentValidationError(file, key, 'is not a translatable field')
		}
	}

	const data = validateFrontmatter(translationFrontmatterSchema, file, frontmatter)
	return { file, frontmatter: data, body }
}

export function loadSeiteTranslation(
	contentDir: string,
	id: string,
	locale: string,
): Translation | undefined {
	return loadTranslation(contentDir, id, locale, SEITE_TRANSLATABLE_KEYS)
}

export function loadViertelTranslation(
	contentDir: string,
	id: string,
	locale: string,
): Translation | undefined {
	return loadTranslation(contentDir, id, locale, VIERTEL_TRANSLATABLE_KEYS)
}
