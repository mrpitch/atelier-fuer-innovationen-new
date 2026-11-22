import fs from 'node:fs'
import path from 'node:path'

import type { z } from 'zod'

import {
	ContentValidationError,
	FRONTMATTER_FIELD,
	MENU_FIELD,
	META_FIELD,
	SITE_FIELD,
	VIERTEL_ORDER_FIELD,
	ZENTRUM_FIELD,
} from './errors'
import { splitDocument } from './frontmatter'
import type { MenuEntry, Site, ViertelSteckbrief } from './schemas'
import {
	aufsatzFrontmatterSchema,
	menuSchema,
	metaSchema,
	seiteFrontmatterSchema,
	siteSchema,
	viertelFrontmatterSchema,
	viertelOrderSchema,
	zentrumFrontmatterSchema,
} from './schemas'

export type { Site, ViertelSteckbrief } from './schemas'

// Only German exists today (ADR-0001), but a document's ID drops any locale
// suffix so a later locale file doesn't get its own ID.
const LOCALES = ['de']
const LOCALE_SUFFIX_PATTERN = new RegExp(`\\.(${LOCALES.join('|')})$`)

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

function listMdxFiles(contentDir: string): string[] {
	const entries = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
		.map((entry) => path.relative(contentDir, path.join(entry.parentPath, entry.name)))
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
	return entries
		.filter((entry) => entry.isFile() && entry.name === META_FILE_NAME)
		.map((entry) => path.relative(contentDir, path.join(entry.parentPath, entry.name)))
		.sort()
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
			(relativePath) => stadtChildSlug(relativePath) === undefined && !isAufsatzPath(relativePath),
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
