import fs from 'node:fs'
import path from 'node:path'

import type { z } from 'zod'

import { extractRelativeImages, resolveBodyAssetPath } from './body'
import { CONTENT_KINDS } from './documents'
import {
	BODY_IMAGE_FIELD,
	ContentValidationError,
	FRONTMATTER_FIELD,
	MENU_FIELD,
	META_FIELD,
	SITE_FIELD,
	TRANSLATION_FIELD,
} from './errors'
import { splitDocument } from './frontmatter'
import {
	deriveId,
	documentFile,
	isNonSeiteMetaDir,
	isTranslationPath,
	kindOfPath,
	translationLocale,
} from './locations'
import type { Meta } from './order'
import type { MenuItem, Site, TranslationFrontmatter } from './schemas'
import {
	abschnittFrontmatterSchema,
	abschnittTranslationFrontmatterSchema,
	aufsatzFrontmatterSchema,
	kapitelFrontmatterSchema,
	kapitelTranslationFrontmatterSchema,
	menuSchema,
	metaSchema,
	rundgangFrontmatterSchema,
	seiteFrontmatterSchema,
	siteSchema,
	stationFrontmatterSchema,
	themaFrontmatterSchema,
	translationFrontmatterSchema,
	viertelFrontmatterSchema,
	viertelTranslationFrontmatterSchema,
	zentrumFrontmatterSchema,
} from './schemas'
import type { ContentKind } from './types'

// This module is the only one in the content layer that reads the file
// system (plus validateBodyImages' existence check): everything it returns is
// plain data that the pure modules (viertel.ts, navigation.ts, …) resolve.

const FRONTMATTER_SCHEMAS = {
	seite: seiteFrontmatterSchema,
	viertel: viertelFrontmatterSchema,
	zentrum: zentrumFrontmatterSchema,
	aufsatz: aufsatzFrontmatterSchema,
	kapitel: kapitelFrontmatterSchema,
	abschnitt: abschnittFrontmatterSchema,
	thema: themaFrontmatterSchema,
	rundgang: rundgangFrontmatterSchema,
	station: stationFrontmatterSchema,
} as const satisfies Record<ContentKind, z.ZodType>

// A translation file may set exactly the keys of its type's translation
// schema (issue #36): every type's title, Short title, description and slug,
// plus a Viertel's Leitsatz and Steckbrief.
const TRANSLATION_SCHEMAS = {
	seite: translationFrontmatterSchema,
	viertel: viertelTranslationFrontmatterSchema,
	zentrum: translationFrontmatterSchema,
	aufsatz: translationFrontmatterSchema,
	kapitel: kapitelTranslationFrontmatterSchema,
	abschnitt: abschnittTranslationFrontmatterSchema,
	thema: translationFrontmatterSchema,
	rundgang: translationFrontmatterSchema,
	station: translationFrontmatterSchema,
} as const satisfies Record<ContentKind, z.ZodObject>

// A document as read from disk, before its references, order and URL are
// resolved: its ID, the source file for error messages, the validated
// frontmatter (Draft flag included) and the body. Resolution (viertel.ts,
// kapitel.ts, …) turns it into the public type and drops `file`.
export type Loaded<K extends ContentKind> = {
	readonly id: string
	// The source file's path relative to the content directory.
	readonly file: string
	readonly body: string
} & z.infer<(typeof FRONTMATTER_SCHEMAS)[K]>

export type LoadedContent = { readonly [K in ContentKind]: readonly Loaded<K>[] }

// A loaded document of any type, reduced to what every type shares — for the
// graph's checks that span every type (IDs, bodies).
export interface LoadedDocument {
	readonly kind: ContentKind
	readonly id: string
	readonly file: string
	readonly body: string
	readonly draft: boolean
}

export function listLoaded(content: LoadedContent): LoadedDocument[] {
	return CONTENT_KINDS.flatMap((kind) =>
		(content[kind] as readonly Omit<LoadedDocument, 'kind'>[]).map(({ id, file, body, draft }) => ({
			kind,
			id,
			file,
			body,
			draft,
		})),
	)
}

// One frontmatter validator for every content type: only the schema differs.
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

// The one document loader (issue #23): reads, splits and validates every
// standalone .mdx file under the content directory against its type's schema
// and derives its ID. Which type a file is comes from its location alone
// (locations.ts). Drafts are loaded and validated like any document — hiding
// them is the graph's `isVisible`, not the loader's.
export function loadDocuments(contentDir: string): LoadedContent {
	const result: { [K in ContentKind]: Loaded<K>[] } = {
		seite: [],
		viertel: [],
		zentrum: [],
		aufsatz: [],
		kapitel: [],
		abschnitt: [],
		thema: [],
		rundgang: [],
		station: [],
	}

	for (const relativePath of listMdxFiles(contentDir)) {
		if (isTranslationPath(relativePath)) continue

		const kind = kindOfPath(relativePath)
		const raw = fs.readFileSync(path.join(contentDir, relativePath), 'utf8')
		const { frontmatter, body } = splitDocument(relativePath, raw)
		const data = validateFrontmatter(FRONTMATTER_SCHEMAS[kind], relativePath, frontmatter)
		const document = { id: deriveId(relativePath), file: relativePath, body, ...data }
		;(result[kind] as unknown[]).push(document)
	}

	return result
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

function parseMeta(file: string, absolutePath: string, field: string): Meta {
	const data = readJsonFile(file, absolutePath, field)
	const parsed = metaSchema.safeParse(data)
	if (!parsed.success) {
		throw new ContentValidationError(file, field, parsed.error.issues[0].message)
	}
	return { file, order: parsed.data }
}

function listMetaFiles(contentDir: string): string[] {
	const entries = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
	return entries
		.filter((entry) => entry.isFile() && entry.name === META_FILE_NAME)
		.map((entry) => path.relative(contentDir, path.join(entry.parentPath, entry.name)))
		.filter((relativePath) => !isNonSeiteMetaDir(relativePath))
		.sort()
}

// meta.json sits beside the index.mdx of the folder it orders, so the folder's
// ID is the same ID the loader would derive for that index.mdx.
function folderIdFromMetaPath(relativePath: string): string {
	const dir = path.dirname(relativePath)
	if (dir === '.') return ''
	return dir.split(path.sep).join('/')
}

// A Seite folder's children's order (issue #26). Keyed by the folder's ID; a
// folder with no meta.json has no entry here, and the content graph sorts its
// children by their natural key instead. The meta.json files that order
// non-Seite children (loadOrder, below) are not part of this scan.
export function loadMeta(contentDir: string): Map<string, Meta> {
	const result = new Map<string, Meta>()

	for (const relativePath of listMetaFiles(contentDir)) {
		const meta = parseMeta(relativePath, path.join(contentDir, relativePath), META_FIELD)
		result.set(folderIdFromMetaPath(relativePath), meta)
	}

	return result
}

// A required order file of non-Seite children (issues #28, #30, #32): the
// meta.json of one folder, read directly by that folder's ID — `stadt` for
// the Viertel, a Kapitel's ID for its Abschnitte, a Rundgang's ID for its
// Stationen. Required, since an explicit order is the source of a number,
// not a natural-key fallback. `field` names the file's own error kind
// (errors.ts).
export function loadOrder(contentDir: string, folderId: string, field: string): Meta {
	const file = path.join(folderId, META_FILE_NAME)
	const absolutePath = path.join(contentDir, file)
	if (!fs.existsSync(absolutePath)) {
		throw new ContentValidationError(file, field, 'file not found')
	}
	return parseMeta(file, absolutePath, field)
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

const MENUS_DIR_NAME = 'menus'

export interface RawMenu {
	// The Menu file's path relative to the content directory, for error messages.
	readonly file: string
	readonly items: readonly MenuItem[]
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
// footer.json). Keyed by that name; ID resolution against the documents
// happens in menu.ts, which stays pure like navigation.ts.
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
		result.set(name, { file: relativePath, items: parsed.data })
	}

	return result
}

// Every relative image a body references (issue #35) must actually sit next
// to the document — the one fs check this module adds for the content
// graph's body validation pass (graph.ts), which calls this once per body
// once every type is loaded. `file` is the file holding the body (the
// document or one of its translations), for the error. Returns the resolved
// paths so buildContentGraph can expose them as graph.bodyImages.
export function validateBodyImages(
	contentDir: string,
	id: string,
	file: string,
	body: string,
): string[] {
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

export interface Translation {
	// The translation file's path relative to the content directory, for
	// error messages.
	readonly file: string
	readonly frontmatter: TranslationFrontmatter
	readonly body: string
}

// Every document's sibling translation file for each configured locale
// (issue #36, ADR-0001): idee/index.mdx's translation for locale "xx" is
// idee/index.xx.mdx, the root Seite's is index.xx.mdx — for a document of
// any type. Keyed by locale, then by the document's ID; a locale without a
// translation for a document has no entry, and the fallback to the German
// document is translation.ts's job. A translation file is validated with its
// document type's translation schema: a frontmatter key outside it throws
// naming the file and that key, and a translation file next to no document
// of that locale's own type throws instead of being skipped. A file for an
// unconfigured locale is never read, so it can't become a stray document
// either (locations.ts's isTranslationPath).
export function loadTranslations(
	contentDir: string,
	locales: readonly string[],
	kindById: ReadonlyMap<string, ContentKind>,
): ReadonlyMap<string, ReadonlyMap<string, Translation>> {
	const result = new Map<string, Map<string, Translation>>(
		locales.map((locale) => [locale, new Map()]),
	)
	if (locales.length === 0) return result

	for (const file of listMdxFiles(contentDir)) {
		const locale = translationLocale(file)
		if (locale === undefined || !locales.includes(locale)) continue

		const id = deriveId(file.replace(`.${locale}.mdx`, '.mdx'))
		const kind = kindById.get(id)
		if (kind === undefined || file !== documentFile(id, locale)) {
			throw new ContentValidationError(
				file,
				TRANSLATION_FIELD,
				`translates no document: expected ${documentFile(id)} next to it`,
			)
		}

		const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
		const { frontmatter, body } = splitDocument(file, raw)
		const schema = TRANSLATION_SCHEMAS[kind]

		const rawFrontmatter = (frontmatter ?? {}) as Record<string, unknown>
		for (const key of Object.keys(rawFrontmatter)) {
			if (!(key in schema.shape)) {
				throw new ContentValidationError(file, key, 'is not a translatable field')
			}
		}

		const data = validateFrontmatter(schema as z.ZodType<TranslationFrontmatter>, file, frontmatter)
		result.get(locale)?.set(id, { file, frontmatter: data, body })
	}

	return result
}
