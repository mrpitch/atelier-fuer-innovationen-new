import fs from 'node:fs'
import { register } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

register('./ts-extension-loader.mjs', import.meta.url)

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const contentDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'src/content'))
const publicDir = path.resolve(process.argv[3] ?? path.join(repoRoot, 'public'))
// Body images live under public/content/ so they can't collide with hand-authored static
// assets in public/ (issue #35); the body image's src is /content/<path> to match.
const imagesDir = path.join(publicDir, 'content')

const { buildContentGraph, ContentValidationError } = await import('../src/lib/content/index')

try {
	const graph = buildContentGraph(contentDir)

	for (const relativePath of graph.bodyImages) {
		const from = path.join(contentDir, relativePath)
		const to = path.join(imagesDir, relativePath)
		fs.mkdirSync(path.dirname(to), { recursive: true })
		fs.copyFileSync(from, to)
	}

	console.log(`content:images: copied ${graph.bodyImages.length} body image(s) into ${imagesDir}`)
} catch (error) {
	if (error instanceof ContentValidationError) {
		console.error(`content:images: ${error.message}`)
		process.exit(1)
	}
	throw error
}
