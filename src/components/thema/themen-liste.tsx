import Link from 'next/link'
import type * as React from 'react'

import type { Thema } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface ThemenListeProps extends React.ComponentProps<'nav'> {
	themen: readonly Thema[]
}

// The Themen landing Seite's list of all three Themen — the Leitthema and
// each Themen-Ort (issue #31, ADR-0003) — derived from the content graph,
// not written by hand in the Seite's MDX body.
function ThemenListe({ themen, ...props }: ThemenListeProps) {
	return (
		<nav data-slot="themen-liste" aria-label={t('themen.navigation')} {...props}>
			<ol>
				{themen.map((thema) => (
					<li key={thema.id}>
						<Link href={thema.url}>{shortTitleOrTitle(thema)}</Link>
					</li>
				))}
			</ol>
		</nav>
	)
}

export { ThemenListe }
