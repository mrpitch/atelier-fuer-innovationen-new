import { cn } from 'cn'
import type * as React from 'react'

// The bar under the header that the Ortsleiste (#82) and the Ebenen-Leiste
// (#85) both are: a bottom Haarlinie, 20px side padding (96px from 1024 up, so
// it lines up with the header), stacked on mobile and tablet (768) and a row
// from 1024 up (Figma). Each bar adds its own content and `data-slot`; the
// Ortsleiste moves its switch to 1280 (issue #110).
function PlaceBar({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="place-bar"
			className={cn(
				'flex flex-col gap-3 border-b border-border px-5 py-3 lg:flex-row lg:items-center lg:px-24',
				className,
			)}
			{...props}
		/>
	)
}

export { PlaceBar }
