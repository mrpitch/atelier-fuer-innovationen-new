import type { ViertelSteckbrief } from './schemas'

export type { Site, ViertelSteckbrief } from './schemas'

// Every content type (glossary), named as the discriminant `kind` carries it
// through resolveUrl, getLocalizedDocuments and the document index.
export type ContentKind =
	| 'seite'
	| 'viertel'
	| 'zentrum'
	| 'aufsatz'
	| 'kapitel'
	| 'abschnitt'
	| 'thema'
	| 'rundgang'
	| 'station'

// What every resolved document carries, whatever its type. `url` follows the
// type's URL rule (ADR-0003); `draft` is only ever true in a development
// graph, since a production graph exposes no Draft.
export interface BaseDocument {
	readonly id: string
	readonly url: string
	readonly title: string
	readonly description: string
	readonly shortTitle?: string
	readonly body: string
	readonly draft: boolean
}

export type Seite = BaseDocument

// A Viertel with its number assigned (viertel.ts).
export interface Viertel extends BaseDocument {
	readonly leitsatz: string
	readonly steckbrief: ViertelSteckbrief
	readonly number: number
}

// The Zentrum: its own type, not a Viertel, with no number.
export type Zentrum = BaseDocument

// An Aufsatz (issue #29) with its Viertel reference checked and its reading
// time computed (aufsatz.ts).
export interface Aufsatz extends BaseDocument {
	readonly viertelId: string
	readonly readingTimeMinutes: number
}

// A Kapitel (issue #30) with its number and URL derived from its Viertel
// (kapitel.ts).
export interface Kapitel extends BaseDocument {
	readonly viertelId: string
	readonly number: number
}

// An Abschnitt (issue #30) with its position, number, URL and reading time
// derived from its Kapitel (abschnitt.ts). `kapitelId` is its folder's ID.
export interface Abschnitt extends BaseDocument {
	readonly kapitelId: string
	readonly position: number
	readonly number: string
	readonly readingTimeMinutes: number
}

// A Thema (issue #31): the Leitthema (no `kapitelId`) or a Themen-Ort, whose
// `kapitelId` names the one Kapitel it branches off from.
export interface Thema extends BaseDocument {
	readonly kapitelId?: string
}

// A Rundgang (issue #32) with its Stationen count and duration derived
// (rundgang.ts).
export interface Rundgang extends BaseDocument {
	readonly stationenCount: number
	readonly durationMinutes: number
}

// A Station (issue #32): `ortId` is the Viertel or Zentrum it stands at,
// `rundgangId` its folder's ID; number, URL and reading time are derived
// (station.ts).
export interface Station extends BaseDocument {
	readonly ortId: string
	readonly rundgangId: string
	readonly number: number
	readonly readingTimeMinutes: number
}

// One resolved document type per kind.
export interface KindMap {
	readonly seite: Seite
	readonly viertel: Viertel
	readonly zentrum: Zentrum
	readonly aufsatz: Aufsatz
	readonly kapitel: Kapitel
	readonly abschnitt: Abschnitt
	readonly thema: Thema
	readonly rundgang: Rundgang
	readonly station: Station
}

// A set of resolved documents, one list per kind. The German graph, each
// configured locale's translated view and the visible-documents index are
// all this one shape.
export type ContentSet = { readonly [K in ContentKind]: readonly KindMap[K][] }

// A document of any type, tagged by its kind — the one shape resolveUrl and
// getLocalizedDocuments return, so a caller narrows on `kind` once.
export type ContentDocument = {
	readonly [K in ContentKind]: { readonly kind: K; readonly document: KindMap[K] }
}[ContentKind]

// A document found by its URL: `locale` is set for a configured locale's own
// prefixed URL and absent for a German one.
export type ResolvedDocument = ContentDocument & { readonly locale?: string }

// The hierarchy of content as it sits in the site (glossary: Navigation).
// Breadcrumbs and previous/next are views of this hierarchy, not written down
// separately.
export interface NavigationLink {
	readonly id: string
	readonly url: string
	readonly title: string
}

export interface NavigationNode extends NavigationLink {
	readonly children: readonly NavigationNode[]
}

// Which documents a graph exposes: a Draft only in development.
export type Visibility = (document: { readonly draft: boolean }) => boolean
