// Marks this entry server-only (issue #55): a Client Component that imports it
// fails `next build` with Next's own error, instead of silently bundling the
// content graph's file reads into client JavaScript. Next implements this
// import itself — no package to install (About the architecture).
import 'server-only'

export { ContentValidationError } from './errors'
export type { SplitDocument } from './frontmatter'
export { splitDocument } from './frontmatter'
export type { ContentGraph } from './graph'
export { buildContentGraph } from './graph'
export type {
	Abschnitt,
	Aufsatz,
	Kapitel,
	Rundgang,
	Seite,
	Site,
	Station,
	Thema,
	Viertel,
	ViertelSteckbrief,
	Zentrum,
} from './loader'
export { shortTitleOrTitle, siteWordmark } from './loader'
export type { MenuLink } from './menu'
export type { NavigationLink, NavigationNode } from './navigation'
