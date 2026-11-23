import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Serves the static export in `out/` the way the host will, so a page can be
// opened in a browser (Playwright, the sandbox's visual checks) after
// `pnpm build`. `next start` does not serve an `output: 'export'` build, and
// `file://` breaks the export's absolute asset paths.
//
// Usage: node scripts/serve-out.mts [port]   (default 3000)

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(scriptsDir, '..', 'out')
const port = Number(process.argv[2] ?? 3000)

const CONTENT_TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2',
}

function isFile(file: string): boolean {
	return fs.statSync(file, { throwIfNoEntry: false })?.isFile() ?? false
}

// The same lookup the static host does: the exact file, then `<path>.html`,
// then `<path>/index.html`.
function resolveFile(urlPath: string): string | undefined {
	const target = path.join(outDir, decodeURIComponent(urlPath))
	if (!target.startsWith(outDir)) return undefined
	return [target, `${target}.html`, path.join(target, 'index.html')].find(isFile)
}

if (!fs.existsSync(outDir)) {
	console.error(`No ${outDir}: run pnpm build first.`)
	process.exit(1)
}

http
	.createServer((request, response) => {
		const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname
		const file = resolveFile(urlPath)
		const notFound = path.join(outDir, '404.html')
		const status = file ? 200 : 404
		const body = file ?? (isFile(notFound) ? notFound : undefined)
		response.writeHead(status, {
			'Content-Type': body
				? (CONTENT_TYPES[path.extname(body)] ?? 'application/octet-stream')
				: 'text/plain',
		})
		if (body) fs.createReadStream(body).pipe(response)
		else response.end('Not found')
	})
	.listen(port, () => console.log(`Serving ${outDir} on http://localhost:${port}`))
