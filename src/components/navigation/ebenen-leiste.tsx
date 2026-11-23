import { cn } from 'cn'
import type * as React from 'react'

import { BreadcrumbTrail } from '@/components/navigation/breadcrumb-trail'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { NavigationLink, Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface EbenenLeisteProps extends React.ComponentProps<'div'> {
	// The Viertel a Kapitel and its Abschnitte are set in (ADR-0003, "Kapitel n
	// = Viertel n"): shown as the current place with "Sie sind hier"
	// (DESIGN.md, Place bar). The caller renders its own illustration — the
	// one lookup keyed by a real Viertel ID (icon-registry.md's pattern) —
	// rather than this component importing it, so a fixture graph can still
	// render the rest (content-layer.md's content-graph boundary).
	ort: Viertel
	illustration: React.ReactNode
	breadcrumbs: readonly NavigationLink[]
	kapitel: { readonly number: number; readonly total: number }
	// Set only on an Abschnitt page: its position among its Kapitel's own
	// Abschnitte, replacing the Kapitel-only progress count.
	abschnitt?: { readonly position: number; readonly total: number }
}

// The Ebenen-Leiste (issue #85): the current place with "Sie sind hier", the
// breadcrumb, and a progress count with its Fortschritt dots — replacing the
// Breadcrumbs and PreviousNext on the Kapitel and Abschnitt pages. Stacked on
// mobile and tablet (768), a row from 1024 up (Figma), the same breakpoint
// the Ortsleiste (#82) switches at.
function EbenenLeiste({
	ort,
	illustration,
	breadcrumbs,
	kapitel,
	abschnitt,
	className,
	...props
}: EbenenLeisteProps) {
	const progress = abschnitt
		? {
				current: abschnitt.position,
				total: abschnitt.total,
				label: t('ebenenLeiste.abschnittPosition', {
					kapitel: kapitel.number,
					position: abschnitt.position,
					total: abschnitt.total,
				}),
			}
		: {
				current: kapitel.number,
				total: kapitel.total,
				label: t('ebenenLeiste.kapitelPosition', { number: kapitel.number, total: kapitel.total }),
			}

	return (
		<div
			data-slot="ebenen-leiste"
			className={cn(
				'flex flex-col gap-3 border-b border-border px-5 py-3 lg:flex-row lg:items-center lg:gap-6 lg:px-24',
				className,
			)}
			{...props}
		>
			<Item size="sm" className="w-fit">
				<ItemMedia className="size-11">{illustration}</ItemMedia>
				<ItemContent>
					<ItemTitle>
						{t('ebenenLeiste.ortTitle', {
							number: formatTwoDigits(ort.number),
							title: shortTitleOrTitle(ort),
						})}
					</ItemTitle>
					<ItemDescription>{t('navigation.youAreHere')}</ItemDescription>
				</ItemContent>
			</Item>
			<BreadcrumbTrail breadcrumbs={breadcrumbs} className="lg:flex-1" />
			<div data-slot="fortschritt" className="flex flex-col gap-1.5">
				<p className="font-mono text-xs text-muted-foreground">{progress.label}</p>
				<div className="flex gap-1" aria-hidden="true">
					{Array.from({ length: progress.total }, (_, index) => (
						<span
							key={index}
							className={cn(
								'h-1 flex-1 rounded-full',
								index < progress.current ? 'bg-primary' : 'bg-muted',
							)}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export { EbenenLeiste }
