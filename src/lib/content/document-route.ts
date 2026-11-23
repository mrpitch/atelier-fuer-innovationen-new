import { contentGraph } from './graph'
import type { ContentKind, KindMap } from './types'

// A document's URL as its path segments, for a route's generateStaticParams:
// the params come from the URL the graph built (ADR-0003), never from
// splitting a document ID.
export function urlSegments(url: string): string[] {
	return url.split('/').filter(Boolean)
}

// The reverse, for a route's own params: the segments of a requested URL back
// into the URL `resolveUrl` expects.
export function urlFromSegments(segments: readonly string[]): string {
	return `/${segments.join('/')}`
}

// A dedicated route's document: the one `resolveUrl` finds at the URL its
// params make up, if it is of the route's own `kind`. Another type at that
// URL, or none, is undefined; the route turns that into a 404.
export function findDocument<K extends ContentKind>(
	kind: K,
	...segments: string[]
): KindMap[K] | undefined {
	const resolved = contentGraph().resolveUrl(urlFromSegments(segments))
	return resolved?.kind === kind ? (resolved.document as KindMap[K]) : undefined
}
