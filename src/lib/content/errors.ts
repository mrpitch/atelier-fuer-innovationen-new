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

// The field name when the Viertel order file's problem isn't tied to one
// listed ID: invalid JSON, or a schema issue with no path of its own. A
// listed ID with no matching Viertel, or a Viertel missing from the list,
// instead names that ID directly, the same way meta.json does (issue #28).
export const VIERTEL_ORDER_FIELD = '(viertel-order)'

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
