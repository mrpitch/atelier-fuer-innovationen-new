import { EbenenLeiste } from '@/components/navigation/ebenen-leiste'
import { Illustration } from '@/components/ui/illustration'
import type { Abschnitt, Kapitel } from '@/lib/content'
import { contentGraph } from '@/lib/content'

interface KapitelEbenenLeisteProps {
	kapitel: Kapitel
	// Set on an Abschnitt page: the bar then counts its position among the
	// Kapitel's Abschnitte instead of the Kapitel's own number.
	abschnitt?: Abschnitt
}

// The Ebenen-Leiste for a Kapitel or one of its Abschnitte, resolved from the
// content graph: the Viertel with its Illustration (the one lookup keyed by a
// real Viertel ID, icon-registry.md), the breadcrumb and the counts. Kapitel
// and Abschnitt pages share it instead of each repeating the lookup.
function KapitelEbenenLeiste({ kapitel, abschnitt }: KapitelEbenenLeisteProps) {
	const graph = contentGraph()
	const ort = graph.getViertel(kapitel.viertelId)
	if (!ort) throw new Error(`KapitelEbenenLeiste: unknown Viertel ID: ${kapitel.viertelId}`)

	return (
		<EbenenLeiste
			ort={ort}
			illustration={<Illustration id={ort.id} label={ort.title} />}
			breadcrumbs={graph.getBreadcrumbs((abschnitt ?? kapitel).id)}
			// The Viertel count, not graph.kapitel.length: ADR-0003's "Kapitel n =
			// Viertel n" makes a Kapitel's own number range over every Viertel, not
			// just the ones that already have a Kapitel.
			kapitel={{ number: kapitel.number, total: graph.viertel.length }}
			abschnitt={
				abschnitt && {
					position: abschnitt.position,
					total: graph.getAbschnitteByKapitel(kapitel.id).length,
				}
			}
		/>
	)
}

export { KapitelEbenenLeiste }
