import Link from 'next/link'
import type * as React from 'react'

import { Illustration } from '@/components/ui/illustration'
import type { Viertel, Zentrum } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface ViertelListeProps extends React.ComponentProps<'nav'> {
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
}

// The Stadt landing Seite's list of all 8 Viertel and the Zentrum, in number
// order (ADR-0003, issue #28) — derived from the content graph, not written
// by hand in the Seite's MDX body. The Zentrum is absent in a production build
// while it is a Draft (issue #33).
function ViertelListe({ viertel, zentrum, ...props }: ViertelListeProps) {
	return (
		<nav data-slot="viertel-liste" aria-label={t('stadt.navigation')} {...props}>
			{zentrum && (
				<>
					<h2>{t('stadt.zentrumHeading')}</h2>
					<Link href={zentrum.url}>
						<Illustration id={zentrum.id} label={zentrum.title} />
						{shortTitleOrTitle(zentrum)}
					</Link>
				</>
			)}

			<h2>{t('stadt.viertelHeading')}</h2>
			<ol>
				{viertel.map((item) => (
					<li key={item.id}>
						<Link href={item.url}>
							<Illustration id={item.id} label={item.title} />
							{t('viertel.numberedTitle', {
								number: formatTwoDigits(item.number),
								title: shortTitleOrTitle(item),
							})}
						</Link>
					</li>
				))}
			</ol>
		</nav>
	)
}

export { ViertelListe }
