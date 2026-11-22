import Link from 'next/link'
import type * as React from 'react'

import type { Station } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface StationenListeProps extends React.ComponentProps<'nav'> {
	stationen: readonly Station[]
}

// The Stationen set at a Viertel or the Zentrum (issue #32) — derived by the
// content graph from each Station's Ort reference, never listed by hand on
// the Viertel/Zentrum itself. The same shape as AufsaetzeListe.
function StationenListe({ stationen, ...props }: StationenListeProps) {
	if (stationen.length === 0) return null

	return (
		<nav data-slot="stationen-liste" aria-label={t('ort.stationenHeading')} {...props}>
			<h2>{t('ort.stationenHeading')}</h2>
			<ul>
				{stationen.map((station) => (
					<li key={station.id}>
						<Link href={station.url}>{shortTitleOrTitle(station)}</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

export { StationenListe }
