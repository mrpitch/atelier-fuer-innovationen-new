import type { MetadataRoute } from 'next'

import { contentGraph, flattenNavigation } from '@/lib/content'

// A static export can't revalidate a Route Handler at runtime (static-export.md).
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
	const graph = contentGraph()
	return flattenNavigation(graph.sitemap).map((item) => ({
		url: new URL(item.url, graph.site.baseUrl).toString(),
	}))
}
