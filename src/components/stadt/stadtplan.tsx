import { cn } from 'cn'
import type * as React from 'react'

import type { Viertel, Zentrum } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

import { ViertelKachel } from './viertel-kachel'

interface StadtplanProps extends React.ComponentProps<'div'> {
	// The 8 Viertel, in `stadt/meta.json` number order (ADR-0003).
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
}

function zentrumKachel(zentrum: Zentrum) {
	return (
		<ViertelKachel
			key={zentrum.id}
			href={zentrum.url}
			nummer={t('stadt.hub.zentrumNummer')}
			pointer={t('stadt.hub.zentrumPointer')}
			title={shortTitleOrTitle(zentrum)}
			illustrationId={zentrum.id}
			illustrationLabel={zentrum.title}
			variant="zentrum"
		/>
	)
}

function viertelKachel(viertel: Viertel) {
	return (
		<ViertelKachel
			key={viertel.id}
			href={viertel.url}
			nummer={t('stadt.hub.kachelNummer', { number: formatTwoDigits(viertel.number) })}
			pointer={
				viertel.hinweis && t('stadt.hub.kachelHinweis', { title: viertel.hinweis.shortTitle })
			}
			title={shortTitleOrTitle(viertel)}
			untertitel={viertel.untertitel}
			illustrationId={viertel.id}
			illustrationLabel={viertel.title}
		/>
	)
}

// The Stadtplan (Figma T08 "Stadtplan" frame, issue #95): the 8 Viertel and
// the Zentrum as Viertel-Kacheln, read in the order the Kartei design system
// draws them — clockwise from Viertel 01, the Zentrum in the middle — which
// is also the order the tiles stack into on mobile ("rows stack at 390"):
// 01 02 03 / 08 Z 04 / 07 06 05. `viertel` is already in its own number
// order (ADR-0003), so this just rearranges it into that reading order; a
// CSS grid of 3 equal columns from `sm` up turns the same, single DOM order
// into the 3×3 map.
function Stadtplan({ viertel, zentrum, className, ...props }: StadtplanProps) {
	const [v1, v2, v3, v4, v5, v6, v7, v8] = viertel
	const tiles = [
		v1 && viertelKachel(v1),
		v2 && viertelKachel(v2),
		v3 && viertelKachel(v3),
		v8 && viertelKachel(v8),
		zentrum && zentrumKachel(zentrum),
		v4 && viertelKachel(v4),
		v7 && viertelKachel(v7),
		v6 && viertelKachel(v6),
		v5 && viertelKachel(v5),
	].filter(Boolean)

	return (
		<div
			data-slot="stadtplan"
			className={cn('grid grid-cols-1 gap-px bg-border sm:grid-cols-3', className)}
			{...props}
		>
			{tiles}
		</div>
	)
}

export { Stadtplan }
