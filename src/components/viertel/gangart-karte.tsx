import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'

interface GangartKarteLink {
	readonly label: string
	readonly href: string
}

interface GangartKarteProps extends Omit<React.ComponentProps<'div'>, 'title'> {
	readonly badge: string
	readonly title: string
	readonly primary: GangartKarteLink
	readonly secondary: GangartKarteLink
	readonly previous?: GangartKarteLink
	readonly next?: GangartKarteLink
}

// Xenia / Viertel / Gangart-Karte (Figma 36698:47266, the kit Card, issue
// #97): one Gangart (glossary) through this Viertel — Schauen or Lesen — its
// Rundgang's or Themen-Weg's name, its Station or Kapitel here, and the way
// onward. The Figma mock also carries a Fortschritt bar and a bookmark line
// ("Stationen 0–2 gesehen …, Ihr Lesezeichen: …"); both read reading state
// this static site never tracks, so neither renders (issue #97's acceptance
// criteria: "no bookmark line", "no 'gelesen' line").
function GangartKarte({
	badge,
	title,
	primary,
	secondary,
	previous,
	next,
	className,
	...props
}: GangartKarteProps) {
	return (
		<Card data-slot="gangart-karte" className={cn('flex-1', className)} {...props}>
			<CardHeader>
				<Badge variant="secondary">{badge}</Badge>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardFooter className="flex flex-col items-start gap-3 border-t-0 bg-transparent">
				<div className="flex flex-wrap items-center gap-3">
					<Link href={primary.href} className={buttonVariants({ variant: 'default', size: 'sm' })}>
						{primary.label}
						<Icon iconName="arrowRight" data-icon="inline-end" />
					</Link>
					<Link
						href={secondary.href}
						className={buttonVariants({ variant: 'outline', size: 'sm' })}
					>
						{secondary.label}
						<Icon iconName="arrowRight" data-icon="inline-end" />
					</Link>
				</div>
				{(previous !== undefined || next !== undefined) && (
					<div className="flex flex-wrap items-center gap-3">
						{previous && (
							<Link
								href={previous.href}
								className={buttonVariants({ variant: 'ghost', size: 'sm' })}
							>
								<Icon iconName="arrowLeft" data-icon="inline-start" />
								{previous.label}
							</Link>
						)}
						{next && (
							<Link href={next.href} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
								{next.label}
								<Icon iconName="arrowRight" data-icon="inline-end" />
							</Link>
						)}
					</div>
				)}
			</CardFooter>
		</Card>
	)
}

export { GangartKarte, type GangartKarteLink, type GangartKarteProps }
