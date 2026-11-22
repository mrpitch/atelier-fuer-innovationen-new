import path from 'node:path'

import type { MetadataRoute } from 'next'

import { buildContentGraph } from '@/lib/content'

const graph = buildContentGraph(path.join(process.cwd(), 'src/content'))

// A static export can't revalidate a Route Handler at runtime (static-export.md).
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
	return graph.sitemap.map((item) => ({ url: new URL(item.url, graph.site.baseUrl).toString() }))
}
