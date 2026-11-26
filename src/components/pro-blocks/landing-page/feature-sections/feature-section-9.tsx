import type * as React from 'react'

import { Tagline } from '@/components/pro-blocks/landing-page/tagline'
import { cn } from '@/lib/utils/cn'

interface FeatureSection9Step {
	title: string
	description: string
}

interface FeatureSection9Props extends React.ComponentProps<'section'> {
	tagline: React.ReactNode
	heading: React.ReactNode
	steps: readonly FeatureSection9Step[]
}

// Pro Blocks / Feature Section / 9 (Figma component set 36698:55488,
// @shadcndesign/feature-section-9, issue #119). Installing the registry item
// would overwrite this project's own customized tagline.tsx (issue #92's
// "556681a", dropping its ghost variant's `capitalize`), so this is written
// by hand instead, following the registry's own conventions. Two
// differences from the registry default: three steps, not four — this
// project's own usage always has three (epic #115, "Known deviations from
// Figma") — and no per-step icon, since Figma hides that slot on every one.
// `bg-secondary` instead of the registry's own `bg-background`: Figma's own
// fill here (36893:19984) is the Secondary token, not Background.
function FeatureSection9({ tagline, heading, steps, className, ...props }: FeatureSection9Props) {
	return (
		<section
			data-slot="feature-section-9"
			className={cn('section-padding-y bg-secondary', className)}
			{...props}
		>
			<div className="container-padding-x mx-auto flex max-w-7xl flex-col gap-10 md:gap-12">
				<div className="section-title-gap-lg mx-auto flex max-w-xl flex-col items-center text-center">
					<Tagline>{tagline}</Tagline>
					<h2 className="heading-lg text-foreground">{heading}</h2>
				</div>
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
					{steps.map((step) => (
						<div key={step.title} className="flex flex-col items-center gap-2 text-center">
							<h3 className="font-medium text-foreground">{step.title}</h3>
							<p className="text-pretty text-muted-foreground">{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export { FeatureSection9 }
