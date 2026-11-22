// The field name when a problem isn't tied to one frontmatter key: invalid
// YAML, or a schema issue with no path of its own.
export const FRONTMATTER_FIELD = '(frontmatter)'

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
