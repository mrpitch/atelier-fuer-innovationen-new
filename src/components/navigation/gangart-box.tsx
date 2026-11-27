import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { MonoLabel } from '@/components/ui/mono-label'

interface GangartBoxAction {
	readonly label: string
	readonly href: string
}

interface GangartBoxProps extends React.ComponentProps<'div'> {
	label: string
	illustration: React.ReactNode
	titel: string
	text: string
	action: GangartBoxAction
	hinweis?: React.ReactNode
}

// Xenia / Weg / Gangart-Box (Figma 36588:15830): the Randspalte's "you can
// switch Gangart here too" card (glossary: Gangart) — a Label, an
// Illustration beside a Titel/Text pair, and one action button. Fully
// parameterized (issue #125) because the Figma component itself is: its
// Kapitel-Randspalte caller (issue #100) names the Viertel's own Station on
// its Schauen Rundgang, while the Thema page's Randspalte (issue #125) names
// the Themen-Ort's branching Kapitel instead — same shape, different
// content. `hinweis` is the optional line below the action (here, a link to
// the Leitthema); the Schauen variant sets none, since its own Figma
// instance's bookmark line ("Ihr Lesezeichen im Rundgang: Station n.")
// describes a visitor who already started the Rundgang, a state issue #100's
// acceptance criteria exclude ("no bookmark line").
function GangartBox({
	label,
	illustration,
	titel,
	text,
	action,
	hinweis,
	className,
	...props
}: GangartBoxProps) {
	return (
		<div
			data-slot="gangart-box"
			className={cn('flex flex-col gap-3 rounded-xl bg-secondary p-4', className)}
			{...props}
		>
			<MonoLabel>{label}</MonoLabel>
			<div className="flex items-center gap-3">
				{illustration}
				<div className="flex flex-col gap-1">
					<p className="text-sm font-medium text-foreground">{titel}</p>
					<p className="text-xs text-muted-foreground">{text}</p>
				</div>
			</div>
			<Link
				href={action.href}
				className={buttonVariants({ variant: 'outline', className: 'w-full' })}
			>
				{action.label}
				<Icon iconName="arrowRight" data-icon="inline-end" />
			</Link>
			{hinweis}
		</div>
	)
}

export { GangartBox, type GangartBoxAction, type GangartBoxProps }
