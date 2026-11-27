import { cn } from 'cn'
import type * as React from 'react'

import { t } from '@/lib/dictionary'

import type { ThemaKachelContent } from './thema-kachel'
import { ThemaKachel } from './thema-kachel'

// One tile's data plus its React key — the content a Thema-Kachel shows
// (thema-kachel.tsx's own ThemaKachelContent) is the same shape here, not
// redeclared.
interface ThemenTriptychonTile extends ThemaKachelContent {
	readonly id: string
}

interface ThemenTriptychonProps extends React.ComponentProps<'nav'> {
	tiles: readonly ThemenTriptychonTile[]
}

// Xenia / Thema / Themen-Triptychon (Figma component set 36936:10906, issue
// #149): the Leitthema and the two Themen-Orte as three Thema-Kacheln on one
// Karteikarte surface with Haarlinie borders — the same grid-gap-as-border
// technique the Stadtplan's own 3×3 grid uses (stadtplan.tsx). 1440 and 1024:
// three tiles in one row; 768: the Leitthema tile spans the full row, the two
// Themen-Orte below it; 390: all three stacked (Kartei design system,
// Breakpoints, "Themen-Triptychon"). A `nav` landmark named "Die drei Themen"
// (the `themen.navigation` key, reused from the removed ThemenListe), its
// tiles an ordered list — `<li>` stretches to the grid row's height, which is
// what lets each Thema-Kachel's own flex-1 content block push its action to
// the row's shared bottom edge.
function ThemenTriptychon({ tiles, className, ...props }: ThemenTriptychonProps) {
	return (
		<nav
			data-slot="themen-triptychon"
			aria-label={t('themen.navigation')}
			className={className}
			{...props}
		>
			<ol className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
				{tiles.map((tile) => (
					<li
						key={tile.id}
						className={cn(tile.typ === 'leitthema' && 'md:col-span-2 lg:col-span-1')}
					>
						<ThemaKachel {...tile} />
					</li>
				))}
			</ol>
		</nav>
	)
}

export { ThemenTriptychon }
