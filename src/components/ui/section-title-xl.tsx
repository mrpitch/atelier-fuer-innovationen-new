import { cn } from 'cn'
import type * as React from 'react'

import { MonoLabel } from '@/components/ui/mono-label'

interface SectionTitleXlProps extends Omit<React.ComponentProps<'div'>, 'title'> {
	kicker: React.ReactNode
	title: React.ReactNode
	description?: React.ReactNode
}

// The page-level Seitenkopf (Kartei design system, Seitenkopf: "the uppercase
// mono eyebrow in Petrol, the page title, then a Schibsted Grotesk
// introduction"), stacked — not SectionTitle's section-heading shape (Tagline
// + heading-sm), which never carries an h1. First built for the Sitemap page
// (issue #136); the Impressum and Datenschutz tickets reuse it.
function SectionTitleXl({ kicker, title, description, className, ...props }: SectionTitleXlProps) {
	return (
		<div
			data-slot="section-title-xl"
			className={cn('section-title-gap-xl flex flex-col', className)}
			{...props}
		>
			<MonoLabel>{kicker}</MonoLabel>
			<h1 className="heading-xl text-foreground">{title}</h1>
			{description && <p className="text-lg text-muted-foreground">{description}</p>}
		</div>
	)
}

export { SectionTitleXl }
