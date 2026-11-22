import { register } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

register('./ts-extension-loader.mjs', import.meta.url)

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const contentDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'src/content'))

const { buildContentGraph, ContentValidationError } = await import('../src/lib/content/index')

try {
	const graph = buildContentGraph(contentDir)
	console.log(`content:check: ${graph.seiten.length} Seite(n) OK in ${contentDir}`)
} catch (error) {
	if (error instanceof ContentValidationError) {
		console.error(`content:check: ${error.message}`)
		process.exit(1)
	}
	throw error
}
