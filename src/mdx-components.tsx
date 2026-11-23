import type { MDXComponents } from 'mdx/types'

import { SitemapList } from '@/components/navigation/sitemap-list'
import { ViertelTeaser } from '@/components/viertel/viertel-teaser'

// The registered component set (issue #35): every component a body can use
// without an import (content-layer.md). A page adds its own, local `img`
// override on top of this (body-image.tsx) via <Body components={...}>,
// which MDX merges with and overrides this global set, per document.
const components: MDXComponents = { SitemapList, ViertelTeaser }

export function useMDXComponents(): MDXComponents {
	return components
}
