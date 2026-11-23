import Link from 'next/link'
import type * as React from 'react'

import type { Aufsatz } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface AufsaetzeListeProps extends React.ComponentProps<'nav'> {
	aufsaetze: readonly Aufsatz[]
}

// A Viertel's related Aufsätze, "Mehr aus dem Viertel" (issue #29) — derived
// by the content graph from each Aufsatz's Viertel reference, never listed
// by hand on the Viertel itself.
function AufsaetzeListe({ aufsaetze, ...props }: AufsaetzeListeProps) {
	if (aufsaetze.length === 0) return null

	return (
		<nav data-slot="aufsaetze-liste" aria-label={t('viertel.aufsaetzeHeading')} {...props}>
			<h2>{t('viertel.aufsaetzeHeading')}</h2>
			<ul>
				{aufsaetze.map((aufsatz) => (
					<li key={aufsatz.id}>
						<Link href={aufsatz.url}>{shortTitleOrTitle(aufsatz)}</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

export { AufsaetzeListe }
