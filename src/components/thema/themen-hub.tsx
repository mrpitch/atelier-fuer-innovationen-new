import { cn } from 'cn'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { PageSection } from '@/components/stadt/page-section'
import { MonoLabel } from '@/components/ui/mono-label'
import type { Seite } from '@/lib/content'
import { contentGraph, RUNDGAENGE_SEITE_ID, shortTitleOrTitle } from '@/lib/content'
import { pluralForm, t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'
import { bodyImageComponents } from '@/mdx-components'

import { RundgaengeHinweis } from './rundgaenge-hinweis'
import { ThemenTriptychon } from './themen-triptychon'

interface ThemenHubProps extends React.ComponentProps<'div'> {
	seite: Seite
	locale?: string
}

// A count-dependent eyebrow fragment ("1 LEITTHEMA", "2 THEMEN-ORTE"),
// `.one`/`.other` picked by the dictionary's own `pluralForm` helper
// (`Intl.PluralRules('de')`) — the Leitthema count is always 1 today, but
// the Themen-Ort count is derived the same way so a third Themen-Ort would
// still read correctly.
function eyebrowLeitthemaFragment(n: number): string {
	return pluralForm(n) === 'one'
		? t('themen.hub.eyebrowLeitthema.one', { n })
		: t('themen.hub.eyebrowLeitthema.other', { n })
}

function eyebrowThemenOrtFragment(n: number): string {
	return pluralForm(n) === 'one'
		? t('themen.hub.eyebrowThemenOrt.one', { n })
		: t('themen.hub.eyebrowThemenOrt.other', { n })
}

// /themen, the Themen-Hub (Figma T10 "Themen-Übersicht", issue #149): an
// Ortsleiste, a Seitenkopf (mono eyebrow, title, introduction) and the
// Themen-Triptychon of three Thema-Kacheln, closed by the Rundgänge-Hinweis —
// the Themen area's landing Seite, replacing the placeholder ThemenListe.
// Everything but the introduction (the Themen index document's own body) and
// each Thema's optional Teaser is derived from the content graph: nothing
// here is hand-typed.
async function ThemenHub({ seite, locale, className, ...props }: ThemenHubProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)

	const { leitthema } = graph
	if (!leitthema) throw new Error('ThemenHub: content graph has no Leitthema')
	const rundgaengeHub = graph.getSeite(RUNDGAENGE_SEITE_ID)
	if (!rundgaengeHub) throw new Error(`ThemenHub: unknown Seite ID: ${RUNDGAENGE_SEITE_ID}`)
	// "Themen-Weg beginnen" goes to Kapitel 1 (ADR-0003: "Kapitel n = Viertel
	// n"), the same helper the Stadtplan-Hub's and the Leitthema hero's own
	// actions use.
	const erstesKapitel = graph.kapitel.find((kapitel) => kapitel.number === 1)
	if (!erstesKapitel) throw new Error('ThemenHub: content graph has no Kapitel 1')

	// The Leitthema's own label ("K1–K8") and meta line ("n Kapitel in n
	// Vierteln · n Abschnitte") — the Kapitel range and counts, not the
	// hardcoded "8" every Thema-page placeholder still carries.
	const kapitelNumbers = graph.kapitel.map((kapitel) => kapitel.number)
	const vierteltCount = new Set(
		graph.kapitel.map((kapitel) => graph.getViertelOfKapitel(kapitel).id),
	).size
	const abschnitteCount = graph.kapitel.reduce(
		(sum, kapitel) => sum + graph.getAbschnitteByKapitel(kapitel.id).length,
		0,
	)

	// The Leitthema count is derived, not hand-typed: `graph.themen` is the
	// Leitthema plus every Themen-Ort, so subtracting the Themen-Orte leaves
	// just the Leitthema (always 1, by the content model's own Thema split).
	const leitthemaCount = graph.themen.length - graph.themenOrte.length
	const eyebrow = t('themen.hub.eyebrow', {
		leitthema: eyebrowLeitthemaFragment(leitthemaCount),
		themenOrte: eyebrowThemenOrtFragment(graph.themenOrte.length),
	})

	const tiles = [
		{
			id: leitthema.id,
			typ: 'leitthema' as const,
			label: t('themen.hub.kachelLeitthemaLabel', {
				von: Math.min(...kapitelNumbers),
				bis: Math.max(...kapitelNumbers),
			}),
			illustrationId: leitthema.id,
			illustrationLabel: leitthema.title,
			titel: leitthema.title,
			teaser: leitthema.teaser,
			meta: t('themen.hub.kachelLeitthemaMeta', {
				kapitel: graph.kapitel.length,
				viertel: vierteltCount,
				abschnitte: abschnitteCount,
			}),
			action: { label: t('themenWeg.beginnen'), href: erstesKapitel.url },
		},
		// Every Themen-Ort in Ortsleiste order (graph.themenOrte): the Leitthema
		// first, then by its own branch Kapitel's number (trail.ts).
		...graph.themenOrte.map((themenOrt) => {
			const kapitel = graph.getKapitel(themenOrt.kapitelId)
			if (!kapitel) throw new Error(`ThemenHub: unknown Kapitel ID: ${themenOrt.kapitelId}`)
			const viertel = graph.getViertelOfKapitel(kapitel)

			return {
				id: themenOrt.id,
				typ: 'themen-ort' as const,
				label: t('themen.hub.kachelThemenOrtLabel', { number: formatTwoDigits(viertel.number) }),
				illustrationId: themenOrt.id,
				illustrationLabel: themenOrt.title,
				titel: themenOrt.title,
				teaser: themenOrt.teaser,
				meta: t('themen.hub.kachelThemenOrtMeta', { number: kapitel.number }),
				action: {
					label: t('themen.hub.kachelAction', { title: shortTitleOrTitle(themenOrt) }),
					href: themenOrt.url,
				},
			}
		}),
	]

	return (
		<div data-slot="themen-hub" className={cn(className)} {...props}>
			<Ortsleiste
				breadcrumbs={graph.getBreadcrumbs(seite.id)}
				previous={graph.getPrevious(seite.id)}
				next={graph.getNext(seite.id)}
			/>
			<PageSection data-slot="themen-hub-section" className="flex flex-col gap-14">
				{/* The Seitenkopf: title left, introduction right from `lg`, stacked
				    below (Kartei design system, Breakpoints, "Seitenkopf"). */}
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
					<div className="flex flex-col gap-3">
						<MonoLabel>{eyebrow}</MonoLabel>
						<h1 className="heading-xl text-foreground">{seite.title}</h1>
					</div>
					<div className="text-lg text-muted-foreground lg:max-w-md">
						<Body components={bodyImageComponents(seite.id)} />
					</div>
				</div>
				<ThemenTriptychon tiles={tiles} />
				<RundgaengeHinweis rundgaengeHub={rundgaengeHub} />
			</PageSection>
		</div>
	)
}

export { ThemenHub }
