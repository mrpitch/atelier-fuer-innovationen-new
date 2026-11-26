import { cn } from 'cn'
import type * as React from 'react'

interface FortschrittProps extends React.ComponentProps<'div'> {
	// The Rundgang's last Station number ("Station n von N") — one segment per
	// leg of the route, the same count for every Station of this Rundgang.
	total: number
	// The current Station's own number: this many segments, from the first,
	// render filled.
	current: number
}

// Xenia / Weg / Fortschritt (Figma component set 36531:11605, named
// "Fortschritt 8" for its own worked example, Besuch im Zentrum's eight
// segments): a segmented bar on the Rundgang-Leiste (issue #120), filled to
// the current Station. Purely decorative — the adjacent "Station n von N"
// text already states the same position in words, so this carries no
// accessible name of its own (aria-hidden). Its own `data-slot`, not the
// generic "fortschritt" the Ebenen-Leiste's own progress dots already claim
// (issue #85, ebenen-leiste.tsx) — a different Figma component, drawn with
// different tokens, that this one doesn't replace.
function Fortschritt({ total, current, className, ...props }: FortschrittProps) {
	function segmentClassName(filled: boolean) {
		// 3px: the Fortschritt segment's own height (Figma 36531:11605).
		// eslint-disable-next-line restrictions/arbitrary-size-classes
		return cn('h-[3px] flex-1 rounded-full', filled ? 'bg-primary' : 'bg-border')
	}

	return (
		<div
			aria-hidden="true"
			data-slot="rundgang-fortschritt"
			className={cn('flex items-center gap-1', className)}
			{...props}
		>
			{Array.from({ length: total }, (_, index) => (
				<span key={index} className={segmentClassName(index < current)} />
			))}
		</div>
	)
}

export { Fortschritt }
