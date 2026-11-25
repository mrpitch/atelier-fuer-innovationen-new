import { cn } from 'cn'
import type * as React from 'react'

import { Tagline } from '@/components/pro-blocks/landing-page/tagline'

interface SectionTitleProps extends Omit<React.ComponentProps<'div'>, 'title'> {
	tagline: React.ReactNode
	title?: React.ReactNode
	description?: React.ReactNode
}

// No "Section Title" item exists in the @shadcndesign registry to install
// (issue #95): every Pro Block that has one (e.g. bento-grid-1) composes it
// inline from the already-installed Tagline plus a heading and a paragraph,
// so this is that same shape as its own small component instead of
// repeating the composition per section. `title`/`description` are optional
// for a section whose heading is the Tagline alone (Figma's own Stadtplan
// section).
function SectionTitle({ tagline, title, description, className, ...props }: SectionTitleProps) {
	return (
		<div data-slot="section-title" className={cn('flex flex-col gap-3', className)} {...props}>
			<Tagline>{tagline}</Tagline>
			{title && <h2 className="heading-sm text-foreground">{title}</h2>}
			{description && <p className="text-base text-muted-foreground">{description}</p>}
		</div>
	)
}

export { SectionTitle }
