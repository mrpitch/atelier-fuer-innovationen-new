import { parentId } from './locations'
import { toLink } from './presentation'
import type { ContentDocument, ContentSet, NavigationLink } from './types'

// Breadcrumbs and previous/next for a document of any type (issue #23),
// derived from the published documents alone: nothing here is written down
// per page.
export interface Trail {
	getBreadcrumbs(id: string): readonly NavigationLink[]
	getPrevious(id: string): NavigationLink | undefined
	getNext(id: string): NavigationLink | undefined
}

// The document a breadcrumb trail continues with above this one: where the
// reader reaches it from (ADR-0003). A Kapitel is read inside its Viertel, an
// Abschnitt inside its Kapitel, a Station inside its Rundgang; every other
// type continues with its folder, whose own Seite (Stadt, Themen, Rundgänge,
// …) joins the trail if there is a published one.
function logicalParent(entry: ContentDocument): string | undefined {
	switch (entry.kind) {
		case 'kapitel':
			return entry.document.viertelId
		case 'abschnitt':
			return entry.document.kapitelId
		case 'station':
			return entry.document.rundgangId
		default:
			return parentId(entry.document.id)
	}
}

// `entries` is every published document, one list across the types; `siblingsOf`
// is Navigation's own sibling sequence for a Seite (navigation.ts).
//
// Previous/next walk a sequence per type: Seiten their Navigation siblings;
// Viertel their stadt/meta.json number order; Rundgänge their own
// rundgaenge/meta.json order (issue #116); Kapitel all Kapitel in number
// order; Abschnitte every Abschnitt in Kapitel number order, crossing from
// the last of one Kapitel to the first of the next; Stationen only their own
// Rundgang's; Themen their own resolved list order, since that folder takes
// no meta.json (issue #82). The Zentrum and every other type have none: a
// one-document "sequence" never has a previous or a next.
export function buildTrail(
	set: ContentSet,
	entries: readonly ContentDocument[],
	siblingsOf: (seiteId: string) => readonly NavigationLink[] | undefined,
): Trail {
	const byId = new Map(entries.map((entry) => [entry.document.id, entry]))

	const sequenceById = new Map<string, readonly NavigationLink[]>()
	function addSequence(documents: readonly { readonly id: string }[], links: NavigationLink[]) {
		for (const { id } of documents) sequenceById.set(id, links)
	}

	addSequence(
		set.viertel,
		set.viertel.map((viertel) => ({ ...toLink(viertel), number: viertel.number })),
	)
	addSequence(set.kapitel, set.kapitel.map(toLink))
	addSequence(set.abschnitt, set.abschnitt.map(toLink))
	for (const rundgang of set.rundgang) {
		const stationen = set.station.filter((station) => station.rundgangId === rundgang.id)
		addSequence(stationen, stationen.map(toLink))
	}
	addSequence(set.rundgang, set.rundgang.map(toLink))
	addSequence(set.thema, set.thema.map(toLink))

	function sequenceFor(id: string): readonly NavigationLink[] | undefined {
		return byId.get(id)?.kind === 'seite' ? siblingsOf(id) : sequenceById.get(id)
	}

	// Walks up through hidden or folder-only ancestors (a Draft Seite, the
	// bibliothek/aufsaetze folder) to the next published document.
	function trailFor(id: string | undefined): NavigationLink[] {
		if (id === undefined) return []
		const entry = byId.get(id)
		const above = trailFor(entry ? logicalParent(entry) : parentId(id))
		return entry ? [...above, toLink(entry.document)] : above
	}

	function neighbour(id: string, step: -1 | 1): NavigationLink | undefined {
		const sequence = sequenceFor(id)
		const index = sequence?.findIndex((link) => link.id === id) ?? -1
		return index === -1 ? undefined : sequence?.[index + step]
	}

	return {
		getBreadcrumbs(id) {
			return byId.has(id) ? trailFor(id) : []
		},
		getPrevious(id) {
			return neighbour(id, -1)
		},
		getNext(id) {
			return neighbour(id, 1)
		},
	}
}
