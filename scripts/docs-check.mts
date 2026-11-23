import fs from 'node:fs'
import { register } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

register('./ts-extension-loader.mjs', import.meta.url)

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const docsDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'docs'))

const { splitDocument } = await import('../src/lib/content/index')

// Diataxis folder → the `type` its docs must carry (docs skill's frontmatter contract).
// ADRs sit outside the four quadrants, in their own top-level folder.
const TYPE_BY_FOLDER: Record<string, string> = {
	tutorials: 'tutorial',
	'how-to': 'how-to',
	reference: 'reference',
	explanation: 'explanation',
	adr: 'adr',
}

const REQUIRED_FIELDS = ['type', 'title', 'description'] as const

// The generated index and every section README carry no frontmatter contract.
const EXEMPT_NAMES = new Set(['index.md', 'README.md'])

function listDocs(dir: string): string[] {
	return fs
		.readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter(
			(entry) => entry.isFile() && entry.name.endsWith('.md') && !EXEMPT_NAMES.has(entry.name),
		)
		.map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
		.sort()
}

function topFolder(relativePath: string): string | undefined {
	const [first, ...rest] = relativePath.split(path.sep)
	return rest.length > 0 ? first : undefined
}

let failed = false

function report(file: string, field: string, reason: string) {
	console.error(`docs:check: ${file}: ${field} — ${reason}`)
	failed = true
}

for (const relativePath of listDocs(docsDir)) {
	const absolutePath = path.join(docsDir, relativePath)
	const raw = fs.readFileSync(absolutePath, 'utf8')

	let frontmatter: unknown
	try {
		frontmatter = splitDocument(relativePath, raw).frontmatter
	} catch (error) {
		report(relativePath, '(frontmatter)', error instanceof Error ? error.message : String(error))
		continue
	}

	const data =
		frontmatter && typeof frontmatter === 'object' ? (frontmatter as Record<string, unknown>) : {}

	for (const field of REQUIRED_FIELDS) {
		const value = data[field]
		if (typeof value !== 'string' || value.trim() === '') {
			report(relativePath, field, `required, got ${JSON.stringify(value ?? null)}`)
		}
	}

	const folder = topFolder(relativePath)
	const expectedType = folder ? TYPE_BY_FOLDER[folder] : undefined
	if (expectedType && typeof data.type === 'string' && data.type !== expectedType) {
		report(
			relativePath,
			'type',
			`expected "${expectedType}" for docs/${folder}, got "${data.type}"`,
		)
	}
}

if (failed) process.exit(1)
console.log(`docs:check: OK in ${docsDir}`)
