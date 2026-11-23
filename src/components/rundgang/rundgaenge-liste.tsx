import Link from 'next/link'
import type * as React from 'react'

import type { Rundgang } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface RundgaengeListeProps extends React.ComponentProps<'nav'> {
	rundgaenge: readonly Rundgang[]
}

// The Rundgänge landing Seite's list of every Rundgang (issue #32, ADR-0003)
// — derived from the content graph, not written by hand in the Seite's MDX
// body.
function RundgaengeListe({ rundgaenge, ...props }: RundgaengeListeProps) {
	return (
		<nav data-slot="rundgaenge-liste" aria-label={t('rundgaenge.navigation')} {...props}>
			<ul>
				{rundgaenge.map((rundgang) => (
					<li key={rundgang.id}>
						<Link href={rundgang.url}>{shortTitleOrTitle(rundgang)}</Link>
						<p>
							{t('rundgang.summary', {
								stationen: t('rundgang.stationenCount', { n: rundgang.stationenCount }),
								duration: t('rundgang.duration', { n: rundgang.durationMinutes }),
							})}
						</p>
					</li>
				))}
			</ul>
		</nav>
	)
}

export { RundgaengeListe }
