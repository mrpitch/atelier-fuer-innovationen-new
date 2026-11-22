import fs from 'node:fs'
import path from 'node:path'

import { ContentValidationError, FRONTMATTER_FIELD } from './errors'
import { splitDocument } from './frontmatter'
import { seiteFrontmatterSchema } from './schemas'

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
