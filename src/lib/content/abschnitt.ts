import { PARENT_FIELD } from './errors'
import type { Loaded } from './loader'
import type { Meta } from './order'
import { reconcileOrder } from './order'
import { computeReadingTime } from './reading-time'
import { assertNotDraft } from './references'
import type { Abschnitt, Kapitel, Visibility } from './types'
import { abschnittUrl } from './urls'

// Orders one Kapitel's Abschnitte by its own meta.json (issue #30): strict —
// every listed ID must match an actual Abschnitt document, and every actual
// document must be listed exactly once — against every Abschnitt, Drafts
// included. Then Drafts are left out (issue #33) and the rest numbered, so
// positions and numbers ("{kapitelNumber}.{position}", e.g. "4.3") run
// without gaps in production; none of these are ever written in frontmatter.
// `kapitel` is the resolved Kapitel, undefined while it is a Draft in a
// production graph: its Abschnitte are validated but not exposed, and a
// published Abschnitt inside it fails, since its URL would have no Kapitel to
// hang off.
export function orderAbschnitte(
	kapitelDocument: Pick<Loaded<'kapitel'>, 'id' | 'draft'>,
	kapitel: Kapitel | undefined,
	meta: Meta,
	documents: readonly Loaded<'abschnitt'>[],
	isVisible: Visibility,
): Abschnitt[] {
	const ordered = reconcileOrder(meta, documents, 'Abschnitt')
	for (const document of ordered) {
		assertNotDraft(document, PARENT_FIELD, kapitelDocument, isVisible)
	}
	if (!kapitel) return []

	return ordered.filter(isVisible).map(({ file: _file, ...document }, index) => {
		const position = index + 1
		return {
			...document,
			kapitelId: kapitel.id,
			url: abschnittUrl(kapitel.url, position),
			position,
			number: `${kapitel.number}.${position}`,
			readingTimeMinutes: computeReadingTime(document.body),
		}
	})
}
