import { ContentValidationError } from './errors'

// Anything a reference field can point at: every content type's loaded shape
// qualifies, since they all carry an `id`.
export interface Referenceable {
	readonly id: string
}

// The one resolution mechanism for a reference field (issue #29): a
// frontmatter field holding another document's ID, checked against the
// collection it targets. A missing target throws naming the referring file,
// the frontmatter field and the missing ID. A later reference field reuses
// this function as-is against its own target collection — no new resolution
// code.
export function resolveReference<T extends Referenceable>(
	file: string,
	field: string,
	id: string,
	targets: readonly T[],
): T {
	const target = targets.find((item) => item.id === id)
	if (!target) {
		throw new ContentValidationError(file, field, `references an unknown ID: ${id}`)
	}
	return target
}
