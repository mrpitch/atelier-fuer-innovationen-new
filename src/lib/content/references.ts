import { ContentValidationError } from './errors'
import { documentFile } from './locations'
import type { Visibility } from './types'

// Anything a reference field can point at: every loaded document qualifies,
// since they all carry an `id` and a Draft flag.
export interface Referenceable {
	readonly id: string
	readonly draft: boolean
}

// The document holding a reference: the file named in an error, and whether
// it is itself a Draft (a Draft may reference a Draft).
export interface Referrer {
	readonly file: string
	readonly draft: boolean
}

// A published document must not depend on a Draft (issue #33): its link
// would point at a page the build doesn't have. `isVisible` is the graph's
// own predicate, so a development graph, where a Draft renders like any
// document, never fails here. Shared by reference fields and by a body's
// content-referencing components.
export function assertNotDraft(
	referrer: Referrer,
	field: string,
	target: Referenceable,
	isVisible: Visibility,
): void {
	if (isVisible(referrer) && !isVisible(target)) {
		throw new ContentValidationError(
			referrer.file,
			field,
			`references a Draft: ${documentFile(target.id)}`,
		)
	}
}

// The one resolution mechanism for a reference field (issue #29): a
// frontmatter field holding another document's ID, checked against the
// collection it targets — every document of it, Drafts included. A missing
// target throws naming the referring file, the frontmatter field and the
// missing ID; a Draft target of a published referrer throws too. A later
// reference field reuses this function as-is against its own target
// collection — no new resolution code.
export function resolveReference<T extends Referenceable>(
	referrer: Referrer,
	field: string,
	id: string,
	targets: readonly T[],
	isVisible: Visibility,
): T {
	const target = targets.find((item) => item.id === id)
	if (!target) {
		throw new ContentValidationError(referrer.file, field, `references an unknown ID: ${id}`)
	}
	assertNotDraft(referrer, field, target, isVisible)
	return target
}
