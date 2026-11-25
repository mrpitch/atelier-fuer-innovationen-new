import Link from 'next/link'
import type * as React from 'react'

import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Aufsatz } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface AufsaetzeListeProps extends React.ComponentProps<'nav'> {
	aufsaetze: readonly Aufsatz[]
}

// A Card for one Aufsatz: its type, title and meta (issue #96) — the kit
// Card, the same one ViertelKachel builds on, with no override beyond its
// own content.
function aufsatzKarte(aufsatz: Aufsatz) {
	return (
		<Link href={aufsatz.url}>
			<Card>
				<CardHeader>
					<Badge variant="secondary">{t('aufsatz.type')}</Badge>
					<CardTitle className="font-serif text-2xl">{shortTitleOrTitle(aufsatz)}</CardTitle>
					<CardDescription>
						{t('aufsatz.readingTime', { n: aufsatz.readingTimeMinutes })}
					</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	)
}

// A Viertel's related Aufsätze, "Mehr aus dem Viertel" (issue #29, restyled
// into kit Cards for issue #96) — derived by the content graph from each
// Aufsatz's Viertel reference, never listed by hand on the Viertel itself.
function AufsaetzeListe({ aufsaetze, className, ...props }: AufsaetzeListeProps) {
	if (aufsaetze.length === 0) return null

	return (
		<PageSection
			as="nav"
			data-slot="aufsaetze-liste"
			aria-label={t('viertel.aufsaetzeHeading')}
			className={className}
			{...props}
		>
			<SectionTitle tagline={t('viertel.aufsaetzeHeading')} className="mb-10" />
			<h2 className="sr-only">{t('viertel.aufsaetzeHeading')}</h2>
			<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{aufsaetze.map((aufsatz) => (
					<li key={aufsatz.id}>{aufsatzKarte(aufsatz)}</li>
				))}
			</ul>
		</PageSection>
	)
}

export { AufsaetzeListe }
