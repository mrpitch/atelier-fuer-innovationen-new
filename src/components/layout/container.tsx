import { cn } from 'cn'
import type * as React from 'react'

// The 1280px content column with its 24px side padding that the header and the
// footer share (Figma: Pro Blocks container, desktop). Layout classes beyond
// that stay with the caller.
function Container({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="container"
			className={cn('mx-auto w-full max-w-7xl px-6', className)}
			{...props}
		/>
	)
}

export { Container }
