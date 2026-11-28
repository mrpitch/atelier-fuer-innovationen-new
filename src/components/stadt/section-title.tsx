import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type * as React from 'react'

import { Tagline } from '@/components/pro-blocks/landing-page/tagline'

// The xl rung (Figma "Section Title XL", issue #135): a page's own kicker +
// title, as opposed to the sm rung's in-page section heading. Both reuse the
// heading-*/section-title-gap-* utilities pro-blocks.css already vendors,
// instead of a second gap/font-size pair invented here.
const sectionTitleVariants = cva('flex flex-col', {
	variants: {
		size: {
			sm: 'gap-3',
			xl: 'section-title-gap-xl',
		},
	},
	defaultVariants: { size: 'sm' },
})

const sectionTitleHeadingVariants = cva('text-foreground', {
	variants: {
		size: {
			sm: 'heading-sm',
			xl: 'heading-xl',
		},
	},
	defaultVariants: { size: 'sm' },
})

interface SectionTitleProps
	extends Omit<React.ComponentProps<'div'>, 'title'>, VariantProps<typeof sectionTitleVariants> {
	tagline: React.ReactNode
	title?: React.ReactNode
	// 'h1' for a page's own title (a legal page, issue #135); 'h2' (default)
	// for an in-page section heading below that page's own h1.
	titleAs?: 'h1' | 'h2'
	description?: React.ReactNode
}

// No "Section Title" item exists in the @shadcndesign registry to install
// (issue #95): every Pro Block that has one (e.g. bento-grid-1) composes it
// inline from the already-installed Tagline plus a heading and a paragraph,
// so this is that same shape as its own small component instead of
// repeating the composition per section. `title`/`description` are optional
// for a section whose heading is the Tagline alone (Figma's own Stadtplan
// section).
function SectionTitle({
	tagline,
	title,
	titleAs: TitleTag = 'h2',
	description,
	size = 'sm',
	className,
	...props
}: SectionTitleProps) {
	return (
		<div
			data-slot="section-title"
			className={cn(sectionTitleVariants({ size }), className)}
			{...props}
		>
			<Tagline>{tagline}</Tagline>
			{title && <TitleTag className={cn(sectionTitleHeadingVariants({ size }))}>{title}</TitleTag>}
			{description && <p className="text-base text-muted-foreground">{description}</p>}
		</div>
	)
}

export { SectionTitle, sectionTitleHeadingVariants, sectionTitleVariants }
