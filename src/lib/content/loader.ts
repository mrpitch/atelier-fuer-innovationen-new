import fs from 'node:fs'
import path from 'node:path'

import {
	ContentValidationError,
	FRONTMATTER_FIELD,
	MENU_FIELD,
	META_FIELD,
	SITE_FIELD,
} from './errors'
import { splitDocument } from './frontmatter'
import type { MenuEntry, Site } from './schemas'
import { menuSchema, metaSchema, seiteFrontmatterSchema, siteSchema } from './schemas'

export type { Site } from './schemas'

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
	readonly body: string
}

// The glossary's Short title: a document's shorter name for places where
// space is tight (Menus, breadcrumbs, previous/next), its title otherwise.
// Navigation and Menu resolution both use this one rule.
export function shortTitleOrTitle(seite: Seite): string {
	return seite.shortTitle ?? seite.title
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

function validateSeiteFrontmatter(file: string, data: unknown) {
	const result = seiteFrontmatterSchema.safeParse(data)
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
// loader will grow as more content types arrive.
export function loadSeiten(contentDir: string): Seite[] {
	return listMdxFiles(contentDir).map((relativePath) => {
		const absolutePath = path.join(contentDir, relativePath)
		const raw = fs.readFileSync(absolutePath, 'utf8')
		const { frontmatter, body } = splitDocument(relativePath, raw)
		const data = validateSeiteFrontmatter(relativePath, frontmatter)
		const id = deriveId(relativePath)
		return { id, url: seiteUrl(id), body, ...data }
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
