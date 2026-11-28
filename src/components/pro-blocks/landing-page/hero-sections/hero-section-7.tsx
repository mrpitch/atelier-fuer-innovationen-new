import type * as React from 'react'

import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { cn } from '@/lib/utils/cn'

interface HeroSection7Props extends React.ComponentProps<'section'> {
	tagline?: React.ReactNode
	heading?: React.ReactNode
	intro?: React.ReactNode
	actions?: React.ReactNode
}

// Pro Blocks / Hero Section / 7 (Figma component set 36577:16723/36622:8940,
// @shadcndesign/hero-section-7, issue #130), written by hand like
// feature-section-9: installing the registry item would overwrite this
// project's own customized tagline.tsx and button.tsx. Figma hides the
// registry's own image, badge dot and button icon slots on every Home / Hero
// instance, so this keeps only the two text columns — tagline+heading, then
// intro+actions — side by side from `lg` (Kartei design system, Breakpoints:
// "Home / Hero" switches at `lg`, unlike Bild-Hero's `xl`), stacked and
// centred below it. The heading is its own 60/48px size (measured off Figma
// 36579:8663/36622:8940), not Bild-Hero's 88/48px page-title scale.
function HeroSection7({
	tagline,
	heading,
	intro,
	actions,
	className,
	...props
}: HeroSection7Props) {
	return (
		<section
			data-slot="hero-section-7"
			className={cn('section-padding-y bg-background', className)}
			{...props}
		>
			<div className="container-padding-x mx-auto flex max-w-7xl flex-col items-center gap-10 text-center lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:text-left">
				<div className="flex flex-col items-center gap-4 lg:max-w-xl lg:items-start">
					{tagline && <Tagline>{tagline}</Tagline>}
					{heading && (
						<h1 className="font-heading text-[48px] leading-none tracking-[-0.02em] hyphens-auto text-foreground lg:text-[60px]">
							{heading}
						</h1>
					)}
				</div>
				<div className="flex max-w-md flex-col items-center gap-6 lg:items-start">
					{intro && <p className="text-lg text-muted-foreground">{intro}</p>}
					{actions && (
						<div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
							{actions}
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

export { HeroSection7 }
