import type {
	ThemenWegAbschnittItem,
	ThemenWegKapitelItem,
} from '@/components/navigation/themen-weg'
import { ThemenWeg } from '@/components/navigation/themen-weg'
import { Illustration } from '@/components/ui/illustration'
import type { Abschnitt, ContentGraph, Kapitel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'

interface KapitelThemenWegProps {
	graph: ContentGraph
	kapitel: Kapitel
	// Set on an Abschnitt page: that Kapitel's Themen-Weg entry expands to its
	// Abschnitte, the current one marked, instead of being marked active
	// itself (Ansicht=Abschnitt, Figma 36590:9190).
	abschnitt?: Abschnitt
}

// The Themen-Weg resolved from the content graph (issue #99): every Kapitel
// of the Leitthema, the current one marked — expanded to its Abschnitte
// instead when `abschnitt` is given. Kapitel and Abschnitt pages share it,
// the caller passes the graph it already holds.
function KapitelThemenWeg({
	graph,
	kapitel: currentKapitel,
	abschnitt: currentAbschnitt,
}: KapitelThemenWegProps) {
	const leitthema = graph.themen.find((thema) => thema.kapitelId === undefined)
	if (!leitthema) throw new Error('KapitelThemenWeg: no Leitthema in the content graph')

	const kapitel: ThemenWegKapitelItem[] = graph.kapitel.map((item) => {
		const viertel = graph.getViertel(item.viertelId)
		if (!viertel) throw new Error(`KapitelThemenWeg: unknown Viertel ID: ${item.viertelId}`)
		const current = item.id === currentKapitel.id

		const abschnitte: readonly ThemenWegAbschnittItem[] | undefined =
			current && currentAbschnitt
				? graph.getAbschnitteByKapitel(item.id).map((abschnitt): ThemenWegAbschnittItem => ({
						id: abschnitt.id,
						url: abschnitt.url,
						number: abschnitt.number,
						title: shortTitleOrTitle(abschnitt),
						current: abschnitt.id === currentAbschnitt.id,
					}))
				: undefined

		return {
			id: item.id,
			url: item.url,
			number: item.number,
			title: shortTitleOrTitle(item),
			illustration: <Illustration id={viertel.id} label={viertel.title} className="size-full" />,
			viertelNumber: viertel.number,
			viertelTitle: shortTitleOrTitle(viertel),
			current,
			abschnitte,
		}
	})

	return <ThemenWeg leitthemaTitle={shortTitleOrTitle(leitthema)} kapitel={kapitel} />
}

export { KapitelThemenWeg }
