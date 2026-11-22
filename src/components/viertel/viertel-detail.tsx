import Link from 'next/link'
import type * as React from 'react'

import { AufsaetzeListe } from '@/components/aufsatz/aufsaetze-liste'
import { StationenListe } from '@/components/rundgang/stationen-liste'
import type { Aufsatz, Kapitel, Station, Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

import { Illustration } from './illustration'
import { Steckbrief } from './steckbrief'

interface ViertelDetailProps extends React.ComponentProps<'div'> {
	viertel: Viertel
	Body: React.ComponentType
	kapitel: Kapitel | undefined
	aufsaetze: readonly Aufsatz[]
	stationen: readonly Station[]
}

// A Viertel's own page content (issue #28), shared between its unprefixed
// German route (src/app/stadt/[viertel]/page.tsx) and the catch-all route's
// prefixed, localized rendering (issue #36) — the two routes differ only in
// which Viertel view (German or translated) and URL they resolve, not in
// how that view is rendered.
function ViertelDetail({
	viertel,
	Body,
	kapitel,
	aufsaetze,
	stationen,
	...props
}: ViertelDetailProps) {
	return (
		<div data-slot="viertel-detail" {...props}>
			<Illustration id={viertel.id} label={viertel.title} />
			<h1>{viertel.title}</h1>
			<Steckbrief leitsatz={viertel.leitsatz} steckbrief={viertel.steckbrief} />
			<Body />
			{kapitel && (
				<nav aria-label={t('viertel.kapitelHeading')}>
					<h2>{t('viertel.kapitelHeading')}</h2>
					<Link href={kapitel.url}>
						{t('kapitel.number', { n: kapitel.number })}: {shortTitleOrTitle(kapitel)}
					</Link>
				</nav>
			)}
			<AufsaetzeListe aufsaetze={aufsaetze} />
			<StationenListe stationen={stationen} />
		</div>
	)
}

export { ViertelDetail }
