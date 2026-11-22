import type { MDXComponents } from 'mdx/types'

import { SitemapList } from '@/components/navigation/sitemap-list'

const components: MDXComponents = { SitemapList }

export function useMDXComponents(): MDXComponents {
	return components
}
