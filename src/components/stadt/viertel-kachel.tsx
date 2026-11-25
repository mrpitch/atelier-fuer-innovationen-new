import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Card } from '@/components/ui/card'
import { Illustration } from '@/components/ui/illustration'

const viertelKachelVariants = cva('flex h-full flex-col justify-between gap-6 rounded-none p-7', {
	variants: {
		variant: {
			viertel: 'bg-card',
			zentrum: 'bg-primary text-primary-foreground',
		},
	},
	defaultVariants: { variant: 'viertel' },
})

const viertelKachelTitleVariants = cva('font-heading leading-tight', {
	variants: {
		variant: {
			viertel: 'text-[34px]',
			zentrum: 'text-[40px] italic',
		},
	},
	defaultVariants: { variant: 'viertel' },
})

interface ViertelKachelProps
	extends
		Omit<React.ComponentProps<typeof Link>, 'href'>,
		VariantProps<typeof viertelKachelVariants> {
	href: string
	// "VIERTEL 0n" or "ZENTRUM", uppercase DM Mono (Kartei design system,
	// Viertel-Kachel).
	nummer: string
	// The mono pointer at the top right: a Viertel's Hinweis arrow ("→
	// Idee"), shown only when `hinweisId` is set, or the Zentrum's own "↗".
	pointer?: React.ReactNode
	title: string
	untertitel?: string
	illustrationId: string
	illustrationLabel: string
}

// Xenia / Stadtplan / Viertel-Kachel (Figma 36581:7654, component set
// 36581:7678): a Stadtplan tile — square-cornered, 28px padding, the Nummer
// and an optional pointer on top, the Illustration (128px), the name and
// Untertitel below. Built on the installed Card (its ring-based border is
// Kartei-flat, Kartei design system, Elevation), overriding its corners square and
// its surface inverted for the Zentrum variant, with its own Italic 40px
// name (issue #95).
function ViertelKachel({
	href,
	nummer,
	pointer,
	title,
	untertitel,
	illustrationId,
	illustrationLabel,
	variant = 'viertel',
	className,
	...props
}: ViertelKachelProps) {
	return (
		<Link href={href} data-slot="viertel-kachel" data-variant={variant} {...props}>
			<Card className={cn(viertelKachelVariants({ variant }), className)}>
				<div className="flex items-start justify-between gap-3 font-mono text-xs uppercase">
					<span>{nummer}</span>
					{pointer && <span>{pointer}</span>}
				</div>
				<Illustration id={illustrationId} label={illustrationLabel} className="size-32" />
				<div className="flex flex-col gap-1">
					<p className={viertelKachelTitleVariants({ variant })}>{title}</p>
					{untertitel && (
						<p className={cn('text-sm', variant !== 'zentrum' && 'text-muted-foreground')}>
							{untertitel}
						</p>
					)}
				</div>
			</Card>
		</Link>
	)
}

export { ViertelKachel }
