import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils/cn'

const taglineVariants = cva(
	'flex w-fit items-center justify-center gap-1 text-sm font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'h-7 rounded-md border bg-background px-2.5 shadow-xs',
				secondary: 'h-7 rounded-md bg-secondary px-2.5 text-secondary-foreground',
				ghost: 'bg-transparent text-muted-foreground capitalize',
				white: 'text-white',
				link: 'h-7 cursor-pointer gap-1.5 rounded-full border bg-card px-3 py-0 shadow-xs transition-colors hover:bg-accent [&_svg]:size-4',
			},
		},
		defaultVariants: { variant: 'ghost' },
	},
)

interface TaglineProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof taglineVariants> {
	asChild?: boolean
}

function Tagline({ className, variant, asChild = false, children, ...props }: TaglineProps) {
	const Comp = asChild ? Slot.Root : 'div'

	return (
		<Comp className={cn(taglineVariants({ variant, className }))} {...props}>
			{children}
		</Comp>
	)
}

export { Tagline, taglineVariants }
