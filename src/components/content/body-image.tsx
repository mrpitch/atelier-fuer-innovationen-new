import type { MDXComponents } from 'mdx/types'
import type * as React from 'react'

import { isRelativeImagePath, resolveBodyAssetPath } from '@/lib/content'

// A body's relative image path (content-layer.md) is written against its
// own document's folder, not the page's URL, so it can't resolve on its
// own: resolveBodyAssetPath is the same join the loader's existence check
// and content-images.mts's copy step use, so all three can never drift
// apart on what the path means. An already-absolute src (an external URL,
// say) passes through unchanged.
function createBodyImage(documentId: string) {
	function BodyImage({ src, alt, ...props }: React.ComponentProps<'img'>) {
		if (typeof src !== 'string') return null
		const resolvedSrc = isRelativeImagePath(src) ? `/${resolveBodyAssetPath(documentId, src)}` : src
		return <img src={resolvedSrc} alt={alt ?? ''} {...props} />
	}
	return BodyImage
}

// Local MDX components for one document's body (issue #35): page.tsx passes
// this to <Body components={...}>, which MDX merges with and overrides the
// globally registered set (mdx-components.tsx) for that one render — the
// documented way to pass per-page data into an MDX component.
export function bodyImageComponents(documentId: string): MDXComponents {
	return { img: createBodyImage(documentId) }
}
