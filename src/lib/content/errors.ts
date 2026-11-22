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
