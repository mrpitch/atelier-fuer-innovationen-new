import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

const monoLabelVariants = cva('font-mono text-xs uppercase', {
	variants: {
		tone: {
			primary: 'text-primary',
			muted: 'text-muted-foreground',
		},
	},
	defaultVariants: { tone: 'primary' },
})

type MonoLabelProps = useRender.ComponentProps<'p'> & VariantProps<typeof monoLabelVariants>

// The Kartei Label role (design system doc, Typography: "DM Mono 500, 12px,
// uppercase as typed") — a page/section eyebrow ("HIER SPIELT KAPITEL …",
// "GANGART WECHSELN") or an in-column section heading ("DIE n ABSCHNITTE",
// "IM VIERTEL AUSSERDEM"), as a `<p>` or an `<h2>` via `render`. One place for
// the class list every reading-page label repeated (tailwind-conventions.md,
// Custom CSS: "A class list repeated across files becomes a component").
function MonoLabel({ className, tone, render, ...props }: MonoLabelProps) {
	return useRender({
		defaultTagName: 'p',
		render,
		props: mergeProps<'p'>(
			{
				'data-slot': 'mono-label',
				className: cn(monoLabelVariants({ tone, className })),
			} as React.ComponentProps<'p'>,
			props,
		),
	})
}

export { MonoLabel }
