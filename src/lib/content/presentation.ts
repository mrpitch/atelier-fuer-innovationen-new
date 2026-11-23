import type { NavigationLink, Site } from './types'

// A document carrying a title and an optional Short title: every content
// type satisfies this, without the helpers below claiming any one of them
// by name.
export interface ShortTitled {
	readonly title: string
	readonly shortTitle?: string
}

// The glossary's Short title: a document's shorter name for places where
// space is tight (Menus, breadcrumbs, previous/next), its title otherwise.
// Navigation, Menu resolution and the Sitemap all use this one rule.
export function shortTitleOrTitle(document: ShortTitled): string {
	return document.shortTitle ?? document.title
}

// The one link shape for every content type: Navigation, breadcrumbs,
// previous/next and the Sitemap.
export function toLink(
	document: { readonly id: string; readonly url: string } & ShortTitled,
): NavigationLink {
	return { id: document.id, url: document.url, title: shortTitleOrTitle(document) }
}

// The brand wordmark (PRODUCT.md): the site name and tagline together.
export function siteWordmark(site: Site): string {
	return `${site.name} · ${site.tagline}`
}
