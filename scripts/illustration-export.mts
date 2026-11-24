// Turns one or more Figma `Illustration / …` components into drawing modules
// under src/components/ui/illustrations/ (issue #88). Run by hand or by an
// agent, never at build time — the committed module is what ships, not this
// script.
//
//   FIGMA_TOKEN=… pnpm illustration:export <node-id>...
//
// Each <node-id> is a Figma node, e.g. 36474:7249. One module is written per
// node, named after that node's own `Illustration / <section> / <Name>`
// group id — transformIllustrationSvg derives the name, so re-running the
// export on the same node reproduces the same module. Registering the
// result under a content ID is a separate, manual step in illustration.tsx:
// this script doesn't know which document an illustration belongs to.
import fs from 'node:fs'
import { register } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import prettier from 'prettier'

register('./ts-extension-loader.mjs', import.meta.url)

const { transformIllustrationSvg } = await import('./illustration-transform')

// agents.yaml: figma.app.fileKey.
const FIGMA_FILE_KEY = 'ms4MqN4CJhsLTMTKqTSC8p'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const outDir = path.join(repoRoot, 'src/components/ui/illustrations')

const nodeIds = process.argv.slice(2)
if (nodeIds.length === 0) {
	console.error('illustration:export: usage: node scripts/illustration-export.mts <node-id>...')
	process.exit(1)
}

const figmaToken = process.env.FIGMA_TOKEN
if (!figmaToken) {
	console.error('illustration:export: FIGMA_TOKEN is not set')
	process.exit(1)
}

async function fetchJson(url: string): Promise<unknown> {
	const response = await fetch(url, { headers: { 'X-Figma-Token': figmaToken! } })
	if (!response.ok) {
		throw new Error(`illustration:export: Figma API request failed (${response.status}): ${url}`)
	}
	return response.json()
}

const idsParam = nodeIds.map(encodeURIComponent).join(',')
const imagesResponse = await fetchJson(
	`https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${idsParam}&format=svg&svg_include_id=true`,
)
const imageUrls = (imagesResponse as { images?: Record<string, string | null> }).images ?? {}

fs.mkdirSync(outDir, { recursive: true })

for (const nodeId of nodeIds) {
	const imageUrl = imageUrls[nodeId]
	if (!imageUrl) {
		throw new Error(`illustration:export: Figma returned no SVG for node "${nodeId}"`)
	}

	const svgResponse = await fetch(imageUrl)
	if (!svgResponse.ok) {
		throw new Error(`illustration:export: failed to download the SVG for node "${nodeId}"`)
	}
	const svgSource = await svgResponse.text()

	const { slug, source } = transformIllustrationSvg(svgSource)

	const outFile = path.join(outDir, `${slug}.tsx`)
	const prettierConfig = await prettier.resolveConfig(outFile)
	const formatted = await prettier.format(source, { ...prettierConfig, filepath: outFile })
	fs.writeFileSync(outFile, formatted)

	console.log(
		`illustration:export: wrote ${path.relative(repoRoot, outFile)} from node "${nodeId}"`,
	)
}
