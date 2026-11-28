import type { MDXComponents } from 'mdx/types'
import type * as React from 'react'

import { ViertelTeaser } from '@/components/viertel/viertel-teaser'
import { isRelativeImagePath, resolveBodyAssetPath } from '@/lib/content'

// The registered component set (issue #35): every component a body can use
// without an import (content-layer.md). A page adds its own, local `img`
// override on top of this (bodyImageComponents below) via
// <Body components={...}>, which MDX merges with and overrides this global
// set, per document.
const components: MDXComponents = { ViertelTeaser }

export function useMDXComponents(): MDXComponents {
	return components
}

// A body's relative image path (content-layer.md) is written against its
// own document's folder, not the page's URL, so it can't resolve on its
// own: resolveBodyAssetPath is the same join the loader's existence check
// and content-images.mts's copy step use, so all three can never drift
// apart on what the path means. content-images.mts copies the file to
// public/content/<that path>, so the src is /content/<that path>. An
// already-absolute src (an external URL, say) passes through unchanged.
function createBodyImage(documentId: string) {
	function BodyImage({ src, alt, ...props }: React.ComponentProps<'img'>) {
		if (typeof src !== 'string') return null
		const resolvedSrc = isRelativeImagePath(src)
			? `/content/${resolveBodyAssetPath(documentId, src)}`
			: src
		return <img data-slot="body-image" src={resolvedSrc} alt={alt ?? ''} {...props} />
	}
	return BodyImage
}

// Local MDX components for one document's body (issue #35): page.tsx passes
// this to <Body components={...}>, which MDX merges with and overrides the
// globally registered set (above) for that one render — the documented way
// to pass per-page data into an MDX component.
export function bodyImageComponents(documentId: string): MDXComponents {
	return { img: createBodyImage(documentId) }
}
