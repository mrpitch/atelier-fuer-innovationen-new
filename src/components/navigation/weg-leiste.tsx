import { cn } from 'cn'
import type * as React from 'react'

import { MonoLabel } from '@/components/ui/mono-label'
import type { Ort, Viertel, Zentrum } from '@/lib/content'
import { t } from '@/lib/dictionary'

import { Stopp } from './stopp'

interface WegLeisteProps extends React.ComponentProps<'nav'> {
	// The 8 Viertel, in `stadt/meta.json` number order (ADR-0003) — the same
	// shape Stadtplan and MiniStadtplan take.
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
	// The Viertel or the Zentrum whose page this Weg-Leiste sits on (issues
	// #97, #98): its Stopp is "aktuell", every other one "offen" (Stopp's own
	// comment: no reading state to mark one "gesehen" with).
	aktuellId: string
	// "Sie stehen bei n": the current place's own number — a Viertel's own
	// number, or 0 for the Zentrum (issue #98).
	aktuellNummer: number
}

function stoppFor(ort: Ort, nummer: number, aktuellId: string) {
	return (
		<Stopp
			key={ort.id}
			href={ort.url}
			nummer={nummer}
			illustrationId={ort.id}
			illustrationLabel={ort.title}
			status={ort.id === aktuellId ? 'aktuell' : 'offen'}
		/>
	)
}

// Xenia / Weg / Weg-Leiste (Figma component set 36625:9074, issue #97): the
// nine Stopps through the Stadt in number order — the Zentrum first as Stopp
// 0, then Viertel 01–08 ("Stadt order", unlike Stadtplan/MiniStadtplan's own
// clockwise 3×3 reading order) — beside the Info block naming the Weg and
// the visitor's own position. Below `md` Info stacks over wrapping Stopps;
// from `md` every Stopp stays in one un-wrapped row (issue #98 — Figma
// T02@768, 36626:9182, never wraps it, unlike the code before this fix). Info
// only moves beside the Stopps from `lg`: at `md` the page section around
// this component (PageSection) doesn't leave enough width for both side by
// side at the Figma 768 frame's own proportions.
function WegLeiste({
	viertel,
	zentrum,
	aktuellId,
	aktuellNummer,
	className,
	...props
}: WegLeisteProps) {
	return (
		<nav
			data-slot="weg-leiste"
			aria-label={t('stadt.navigation')}
			className={cn(
				'flex flex-col gap-3 rounded-xl bg-muted p-4 md:gap-4 md:px-6 md:py-4 lg:flex-row lg:items-center lg:gap-8',
				className,
			)}
			{...props}
		>
			<div className="flex shrink-0 flex-col gap-1.5">
				<MonoLabel className="font-medium">{t('weg.leiste.label')}</MonoLabel>
				<p className="text-sm font-medium text-foreground">{t('weg.leiste.titel')}</p>
				<p className="text-xs text-muted-foreground">
					{t('weg.leiste.hinweis', { number: aktuellNummer })}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-1.5">
				{zentrum && stoppFor(zentrum, 0, aktuellId)}
				{viertel.map((item) => stoppFor(item, item.number, aktuellId))}
			</div>
		</nav>
	)
}

export { WegLeiste }
