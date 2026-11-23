// The field name when a problem isn't tied to one frontmatter key: invalid
// YAML, or a schema issue with no path of its own.
export const FRONTMATTER_FIELD = '(frontmatter)'

// The field name when a meta.json problem isn't tied to one listed ID: invalid
// JSON, or a schema issue with no path of its own.
export const META_FIELD = '(meta)'

// The field name when the site data file's problem isn't tied to one key:
// invalid JSON, or a schema issue with no path of its own.
export const SITE_FIELD = '(site)'

// The field name when a Menu file's problem isn't tied to one entry's ID:
// invalid JSON, or a schema issue with no path of its own. An entry whose ID
// has no matching Seite instead names that ID directly (issue #27).
export const MENU_FIELD = '(menu)'

// The field name when the Zentrum document's problem isn't tied to one
// frontmatter key: the file is missing, or a schema issue with no path of its
// own (issue #28).
export const ZENTRUM_FIELD = '(zentrum)'

// The field name when the Viertel order file's (stadt/meta.json) problem
// isn't tied to one listed ID: the file is missing, invalid JSON, or a schema
// issue with no path of its own. A listed ID with no matching Viertel, or a
// Viertel missing from the list, instead names that ID directly, the same way
// every other meta.json does (issue #28).
export const VIERTEL_ORDER_FIELD = '(viertel-order)'

// The field name when a body's problem isn't a frontmatter key at all: a
// relative image a body references (markdown image syntax) doesn't exist
// next to the document (issue #35). A content-referencing component's own
// unknown-ID prop instead names that prop directly (e.g. `ViertelTeaser.id`),
// the same way a frontmatter reference field names itself.
export const BODY_IMAGE_FIELD = '(body-image)'

// The field name when a Kapitel's own Abschnitt order file (its meta.json,
// issue #30) isn't tied to one listed ID: the file is missing, invalid JSON,
// or a schema issue with no path of its own. A listed ID with no matching
// Abschnitt, or an Abschnitt missing from the list, instead names that ID
// directly, the same way the Viertel order file does.
export const ABSCHNITT_ORDER_FIELD = '(abschnitt-order)'

// The field name when a Rundgang's own Station order file (its meta.json,
// issue #32) isn't tied to one listed ID: the file is missing, invalid JSON,
// or a schema issue with no path of its own. A listed ID with no matching
// Station, or a Station missing from the list, instead names that ID
// directly, the same way the Abschnitt order file does.
export const STATION_ORDER_FIELD = '(station-order)'

// The field name when a translation file's problem isn't tied to one
// frontmatter key: it sits next to no document of the configured locale's
// own type (issue #36).
export const TRANSLATION_FIELD = '(translation)'

// The field name when a published document sits inside a Draft that its URL
// depends on (a published Abschnitt in a Draft Kapitel, a published Station
// in a Draft Rundgang): no frontmatter key carries that relationship, since a
// document belongs to its parent by folder location (issue #33).
export const PARENT_FIELD = '(parent)'

export class ContentValidationError extends Error {
	readonly file: string
	readonly field: string
	readonly reason: string

	constructor(file: string, field: string, reason: string) {
		super(`${file}: ${field} — ${reason}`)
		this.name = 'ContentValidationError'
		this.file = file
		this.field = field
		this.reason = reason
	}
}
