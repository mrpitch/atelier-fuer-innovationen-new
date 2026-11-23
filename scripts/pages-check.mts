import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The backstop for site-wide page rules. Page routes arrive one content type at
// a time, so this checks what the static export actually built: every page is in
// sitemap.xml, and its head has a canonical link and Open Graph tags that point
// at the page itself.

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const outDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'out'))

// Next's own pages for a static export, not content — never expected in the Sitemap.
const EXEMPT_NAMES = new Set(['404.html', '_not-found.html'])

const REQUIRED_OPEN_GRAPH = ['og:title', 'og:description', 'og:url', 'og:site_name']

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

// Each `<link>` and `<meta>` tag's attributes, whatever their order or the
// whitespace between them.
function headTags(html: string): Map<string, string>[] {
	return [...html.matchAll(/<(?:link|meta)\b[^>]*>/g)].map(
		([tag]) =>
			new Map([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value])),
	)
}

function headProblems(html: string, url: string): string[] {
	const problems: string[] = []
	const tags = headTags(html)
	const openGraph = (property: string) =>
		tags.find((tag) => tag.get('property') === property)?.get('content')

	const canonical = tags.find((tag) => tag.get('rel') === 'canonical')?.get('href')
	if (canonical === undefined) {
		problems.push('has no canonical link')
	} else if (new URL(canonical).pathname !== url) {
		problems.push(`has a canonical link to ${new URL(canonical).pathname}`)
	}

	for (const property of REQUIRED_OPEN_GRAPH) {
		if (!openGraph(property)) problems.push(`has no ${property}`)
	}

	const openGraphUrl = openGraph('og:url')
	if (openGraphUrl && canonical !== undefined && openGraphUrl !== canonical) {
		problems.push(`has og:url ${openGraphUrl}, not its canonical ${canonical}`)
	}

	return problems
}

const pages = listPages(outDir)
const sitemapUrls = listSitemapUrls(path.join(outDir, 'sitemap.xml'))

const problems = pages.flatMap((page) => {
	const url = urlForPage(page)
	const html = fs.readFileSync(path.join(outDir, page), 'utf8')
	return [
		...(sitemapUrls.has(url) ? [] : ['is a built page but missing from sitemap.xml']),
		...headProblems(html, url),
	].map((problem) => `${url} ${problem}`)
})

if (problems.length > 0) {
	for (const problem of problems) {
		console.error(`pages:check: ${problem}`)
	}
	process.exit(1)
}

console.log(`pages:check: ${pages.length} built page(s) OK in ${outDir}`)
