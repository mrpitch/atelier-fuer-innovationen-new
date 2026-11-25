import { cn } from 'cn'
import type * as React from 'react'

import type { Viertel, Zentrum } from '@/lib/content'
import { t } from '@/lib/dictionary'

import { Stopp } from './stopp'

interface WegLeisteProps extends React.ComponentProps<'nav'> {
	// The 8 Viertel, in `stadt/meta.json` number order (ADR-0003) — the same
	// shape Stadtplan and MiniStadtplan take.
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
	// The Viertel whose page this Weg-Leiste sits on (issue #97): its Stopp is
	// "aktuell", every other one "offen" (Stopp's own comment: no reading
	// state to mark one "gesehen" with).
	aktuellId: string
	// "Sie stehen bei n": the current place's own number — always this
	// Viertel's, since the Weg-Leiste only sits on a Viertel page (the
	// Zentrum, whose number would be 0, has none).
	aktuellNummer: number
}

function stoppFor(ort: Viertel | Zentrum, nummer: number, aktuellId: string) {
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
// the visitor's own position. One responsive component covers both of the
// Figma set's Breakpoint variants (Desktop, Mobile 390): a column of Info
// over wrapping Stopps below `md`, a row from `md` up.
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
				'flex flex-col gap-3 rounded-xl bg-muted p-4 md:flex-row md:items-center md:gap-8 md:px-6 md:py-4',
				className,
			)}
			{...props}
		>
			<div className="flex shrink-0 flex-col gap-1.5">
				<p className="font-mono text-xs font-medium text-primary uppercase">
					{t('weg.leiste.label')}
				</p>
				<p className="text-sm font-medium text-foreground">{t('weg.leiste.titel')}</p>
				<p className="text-xs text-muted-foreground">
					{t('weg.leiste.hinweis', { number: aktuellNummer })}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2 md:gap-1.5">
				{zentrum && stoppFor(zentrum, 0, aktuellId)}
				{viertel.map((item) => stoppFor(item, item.number, aktuellId))}
			</div>
		</nav>
	)
}

export { WegLeiste }
