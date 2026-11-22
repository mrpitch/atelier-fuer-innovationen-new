import path from 'node:path'

import type { Referenceable } from './references'
import { resolveReference } from './references'

// Every `<ViertelTeaser id="...">` usage in a body (issue #35, the first
// content-referencing component): a plain tag/attribute scan, since content
// MDX never imports (content-layer.md) — every component instance is a
// literal JSX tag the registered set already knows how to render, not an
// expression a regex would have to evaluate.
function extractComponentReferences(body: string, component: string, prop: string): string[] {
	const tagPattern = new RegExp(`<${component}\\b([^>]*)>`, 'g')
	const propPattern = new RegExp(`\\b${prop}\\s*=\\s*["']([^"']+)["']`)
	const ids: string[] = []
	for (const match of body.matchAll(tagPattern)) {
		const propMatch = propPattern.exec(match[1])
		if (propMatch) ids.push(propMatch[1])
	}
	return ids
}

// Every `<ViertelTeaser id="...">` in a body, checked against the resolved
// Viertel list the same way a frontmatter reference field is (references.ts)
// — reusing resolveReference as-is, the one generic resolution mechanism
// (content-layer.md), rather than a second ID-checking code path.
export function validateViertelTeaserReferences(
	file: string,
	body: string,
	viertel: readonly Referenceable[],
): void {
	for (const id of extractComponentReferences(body, 'ViertelTeaser', 'id')) {
		resolveReference(file, 'ViertelTeaser.id', id, viertel)
	}
}

// A relative image path has no URL scheme and doesn't start at the site
// root — an absolute path, an external URL or a data: URI is out of scope:
// only a co-located image is validated, copied into the build output, and
// resolved by the MDX provider's `img` override (issue #35; the latter two
// reuse this same check, rather than each keeping their own copy of it).
const ABSOLUTE_OR_SCHEME_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/)/i

export function isRelativeImagePath(src: string): boolean {
	return !ABSOLUTE_OR_SCHEME_PATTERN.test(src)
}

// Markdown's image syntax, ![alt](src) — the only way a body references an
// image: content MDX has no imports, so an image can't be a JSX component
// prop the way a Viertel teaser's ID is.
const IMAGE_PATTERN = /!\[[^\]]*\]\(([^)\s]+)\)/g

// Every relative image path a body references, in source order — feeds both
// the loader's existence check and content-images.mts's copy step.
export function extractRelativeImages(body: string): string[] {
	const paths: string[] = []
	for (const match of body.matchAll(IMAGE_PATTERN)) {
		if (isRelativeImagePath(match[1])) paths.push(match[1])
	}
	return paths
}

// A body image's path under the content directory, resolved against its own
// document's folder — a document's ID is its folder path (content-layer.md,
// "Document IDs"), so no extra lookup is needed to know where a relative
// image sits. The loader's existence check, content-images.mts's copy step
// and the MDX provider's `img` override all resolve a body image through
// this one function, so they can never drift apart on what a path means.
export function resolveBodyAssetPath(id: string, relativeImagePath: string): string {
	return path.posix.normalize(path.posix.join(id, relativeImagePath))
}
