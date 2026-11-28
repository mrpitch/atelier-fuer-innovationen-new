// Marks this entry server-only (issue #55): a Client Component that imports it
// fails `next build` with Next's own error, instead of silently bundling the
// content graph's file reads into client JavaScript. Next implements this
// import itself — no package to install (About the architecture).
import 'server-only'

export { isRelativeImagePath, resolveBodyAssetPath } from './body'
export { findDocument, urlFromSegments, urlSegments } from './document-route'
export { ContentValidationError } from './errors'
export type { SplitDocument } from './frontmatter'
export { splitDocument } from './frontmatter'
export type { ContentGraph, ContentGraphOptions } from './graph'
export { buildContentGraph, contentGraph } from './graph'
export type { FlatMenuName, GroupedMenuName, MenuGroupLink, MenuLink, ResolvedMenu } from './menu'
export { shortTitleOrTitle, siteWordmark } from './presentation'
export { RUNDGAENGE_SEITE_ID, STADT_SEITE_ID, THEMEN_SEITE_ID } from './rundgang'
export { flattenNavigation, SITEMAP_SEITE_ID } from './sitemap'
export type {
	Abschnitt,
	Aufsatz,
	BaseDocument,
	ContentDocument,
	ContentKind,
	Hinweis,
	Kapitel,
	NavigationLink,
	NavigationNode,
	Ort,
	ResolvedDocument,
	Rundgang,
	Seite,
	Site,
	Station,
	Thema,
	ThemenOrt,
	Viertel,
	ViertelSteckbrief,
	Zentrum,
	Zitat,
} from './types'
