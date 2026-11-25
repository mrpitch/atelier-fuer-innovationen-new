import { cn } from 'cn'
import type * as React from 'react'

import type { Viertel, Zentrum } from '@/lib/content'

import { PlanFeld } from './plan-feld'

interface MiniStadtplanProps extends React.ComponentProps<'div'> {
	// The 8 Viertel, in `stadt/meta.json` number order (ADR-0003), the same
	// shape Stadtplan takes.
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
	// The Viertel whose page this Mini-Stadtplan sits on: its Plan-Feld is
	// "aktuell", every other one "offen" (issue #96 — no reading state to
	// mark a Plan-Feld "besucht" with).
	aktuellId: string
}

function viertelFeld(viertel: Viertel, aktuellId: string) {
	return (
		<PlanFeld
			key={viertel.id}
			nummer={String(viertel.number)}
			status={viertel.id === aktuellId ? 'aktuell' : 'offen'}
		/>
	)
}

function zentrumFeld(zentrum: Zentrum) {
	return <PlanFeld key={zentrum.id} nummer="0" status="offen" />
}

// Xenia / Stadt / Mini-Stadtplan (Figma 36585:8630): the same 3×3 reading
// order as the full Stadtplan (clockwise from Viertel 01, the Zentrum in the
// middle — 1 2 3 / 8 Z 4 / 7 6 5), redrawn as three fixed rows of 26px
// Plan-Felder instead of a responsive grid of tiles — a decorative echo of
// "where this place sits in the city", not a second way to navigate it, so
// it's hidden from assistive tech; the Items beside it carry the real links.
function MiniStadtplan({ viertel, zentrum, aktuellId, className, ...props }: MiniStadtplanProps) {
	const [v1, v2, v3, v4, v5, v6, v7, v8] = viertel

	const reihen = [
		{
			key: 'oben',
			felder: [
				v1 && viertelFeld(v1, aktuellId),
				v2 && viertelFeld(v2, aktuellId),
				v3 && viertelFeld(v3, aktuellId),
			],
		},
		{
			key: 'mitte',
			felder: [
				v8 && viertelFeld(v8, aktuellId),
				zentrum && zentrumFeld(zentrum),
				v4 && viertelFeld(v4, aktuellId),
			],
		},
		{
			key: 'unten',
			felder: [
				v7 && viertelFeld(v7, aktuellId),
				v6 && viertelFeld(v6, aktuellId),
				v5 && viertelFeld(v5, aktuellId),
			],
		},
	]

	return (
		<div
			data-slot="mini-stadtplan"
			aria-hidden="true"
			className={cn('flex flex-col gap-0.5', className)}
			{...props}
		>
			{reihen.map((reihe) => (
				<div key={reihe.key} className="flex gap-0.5">
					{reihe.felder}
				</div>
			))}
		</div>
	)
}

export { MiniStadtplan }
