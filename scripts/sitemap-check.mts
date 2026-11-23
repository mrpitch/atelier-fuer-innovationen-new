import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const outDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'out'))

// Next's own pages for a static export, not content — never expected in the Sitemap.
const EXEMPT_NAMES = new Set(['404.html', '_not-found.html'])

function listPages(dir: string): string[] {
	return fs
		.readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter(
			(entry) => entry.isFile() && entry.name.endsWith('.html') && !EXEMPT_NAMES.has(entry.name),
		)
		.map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
}

// A built page's URL is its path under `out/`, minus the `.html` extension and
// any trailing `/index` — the same rule `next export` itself uses to turn a
// route into a static file.
function urlForPage(relativePath: string): string {
	const withoutExtension = relativePath.slice(0, -'.html'.length).split(path.sep).join('/')
	const withoutIndex = withoutExtension.replace(/(^|\/)index$/, '')
	return withoutIndex === '' ? '/' : `/${withoutIndex}`
}

function listSitemapUrls(sitemapPath: string): Set<string> {
	const xml = fs.readFileSync(sitemapPath, 'utf8')
	const urls = new Set<string>()
	for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
		urls.add(new URL(match[1]).pathname)
	}
	return urls
}

const pages = listPages(outDir)
const sitemapUrls = listSitemapUrls(path.join(outDir, 'sitemap.xml'))

const missing = pages.map(urlForPage).filter((url) => !sitemapUrls.has(url))

if (missing.length > 0) {
	for (const url of missing) {
		console.error(`sitemap:check: ${url} is a built page but missing from sitemap.xml`)
	}
	process.exit(1)
}

console.log(
	`sitemap:check: ${pages.length} built page(s) OK in ${path.join(outDir, 'sitemap.xml')}`,
)
