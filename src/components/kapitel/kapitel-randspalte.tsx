import Link from 'next/link'
import type * as React from 'react'

import { GangartBox } from '@/components/navigation/gangart-box'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { MonoLabel } from '@/components/ui/mono-label'
import type { ContentGraph, Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface KapitelRandspalteProps extends React.ComponentProps<'div'> {
	graph: ContentGraph
	viertel: Viertel
}

// The Kapitel page's Randspalte (issue #99's slot, issue #100's content): the
// Gangart-Box, left out when the Viertel has no Station in its Schauen
// Rundgang (graph.getSchauenStation), and "Im Viertel außerdem" — the
// Viertel's Aufsätze, left out when it has none. Takes the graph and Viertel
// as props, like KapitelThemenWeg, so a fixture graph can exercise both
// drop-out rules without the real content directory.
function KapitelRandspalte({ graph, viertel, className, ...props }: KapitelRandspalteProps) {
	const rundgang = graph.getSchauenRundgang(viertel.id)
	const station = graph.getSchauenStation(viertel.id)
	const aufsaetze = graph.getAufsaetzeByViertel(viertel.id)

	return (
		<div data-slot="kapitel-randspalte" className={className} {...props}>
			<div className="flex flex-col gap-10">
				{rundgang && station && (
					<GangartBox rundgang={rundgang} station={station} viertel={viertel} />
				)}
				{aufsaetze.length > 0 && (
					<nav aria-label={t('kapitel.imViertelAusserdemHeading')}>
						{/* The heading's text is MonoLabel's own children, not a literal child of
						    this <h2>; jsx-a11y can't see past the render-prop merge. */}
						{/* eslint-disable-next-line jsx-a11y/heading-has-content */}
						<MonoLabel render={<h2 />} tone="muted" className="mb-4">
							{t('kapitel.imViertelAusserdemHeading')}
						</MonoLabel>
						<ul className="flex flex-col gap-2">
							{aufsaetze.map((aufsatz) => (
								<li key={aufsatz.id}>
									<Item render={<Link href={aufsatz.url} />} variant="outline" size="xs">
										<ItemContent>
											<ItemTitle>{shortTitleOrTitle(aufsatz)}</ItemTitle>
											<ItemDescription>
												{t('aufsatz.typeReadingTime', { n: aufsatz.readingTimeMinutes })}
											</ItemDescription>
										</ItemContent>
									</Item>
								</li>
							))}
						</ul>
					</nav>
				)}
			</div>
		</div>
	)
}

export { KapitelRandspalte }
