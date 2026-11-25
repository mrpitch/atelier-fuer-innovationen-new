import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

// The bar under the header that the Ortsleiste (#82) and the Ebenen-Leiste
// (#85) both are: a bottom Haarlinie, 20px side padding (96px once it is a
// row, so it lines up with the header), stacked below `switchAt` and a row
// from there. The Ebenen-Leiste switches at lg (1024, Figma); the Ortsleiste
// at xl (1280), because at 1024 long neighbour names don't fit beside the
// breadcrumb (issue #110, Kartei design system, Breakpoints). Each bar adds
// its own content and `data-slot`.
const placeBarVariants = cva('flex flex-col gap-3 border-b border-border px-5 py-3', {
	variants: {
		switchAt: {
			lg: 'lg:flex-row lg:items-center lg:px-24',
			xl: 'xl:flex-row xl:items-center xl:px-24',
		},
	},
	defaultVariants: { switchAt: 'lg' },
})

type PlaceBarProps = React.ComponentProps<'div'> & VariantProps<typeof placeBarVariants>

function PlaceBar({ switchAt = 'lg', className, ...props }: PlaceBarProps) {
	return (
		<div
			data-slot="place-bar"
			data-switch-at={switchAt}
			className={cn(placeBarVariants({ switchAt }), className)}
			{...props}
		/>
	)
}

export { PlaceBar, placeBarVariants }
