import { ContentValidationError } from './errors'
import { documentFile } from './locations'
import type { ContentDocument, Visibility } from './types'

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

// Targets for a reference that may name a document of any type (a Menu
// entry, issue #27; a Viertel's Hinweis, issue #93), as opposed to
// resolveReference's single same-type collection: `known` holds every
// document's ID, Draft or not; `visible` only those the graph exposes,
// mapped to their resolved shape. An ID in `known` but not `visible` is a
// Draft in a production graph.
export interface AnyTargets {
	readonly known: ReadonlySet<string>
	readonly visible: ReadonlyMap<string, ContentDocument>
}

// Resolves a reference that may name a document of any type, returning its
// resolved shape: a missing ID fails naming the referring file, the field
// and the ID, the same as resolveReference. `strict` decides whether a
// Draft target fails too, instead of resolving to `undefined` — a Menu
// entry is always strict (issue #27: a Menu can't publish a link to an
// unpublished Draft, so passing the literal `true` below also types the
// result as never undefined), while a Viertel's Hinweis is strict only when
// the Viertel itself is visible, so a Draft Viertel may still name a Draft
// Hinweis (issue #93, the same "Draft may reference a Draft" rule
// resolveReference's assertNotDraft gives a same-type reference).
export function resolveAnyReference(
	file: string,
	field: string,
	id: string,
	targets: AnyTargets,
	strict: true,
): ContentDocument
export function resolveAnyReference(
	file: string,
	field: string,
	id: string,
	targets: AnyTargets,
	strict: boolean,
): ContentDocument | undefined
export function resolveAnyReference(
	file: string,
	field: string,
	id: string,
	targets: AnyTargets,
	strict: boolean,
): ContentDocument | undefined {
	const target = targets.visible.get(id)
	if (target) return target
	if (!targets.known.has(id)) {
		throw new ContentValidationError(file, field, `references an unknown ID: ${id}`)
	}
	if (strict) {
		throw new ContentValidationError(file, field, `references a Draft: ${documentFile(id)}`)
	}
	return undefined
}
