import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Illustration } from '@/components/ui/illustration'
import { MonoLabel } from '@/components/ui/mono-label'
import type { Rundgang, Station, Viertel } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface GangartBoxProps extends React.ComponentProps<'div'> {
	rundgang: Rundgang
	station: Station
	viertel: Viertel
}

// Xenia / Weg / Gangart-Box (Figma 36588:15830, issue #100): the Randspalte's
// "you can switch Gangart here too" card, naming the Viertel's own Station in
// its Schauen Rundgang (glossary: Gangart). The caller leaves this out
// entirely when the Viertel has none (graph.getSchauenStation undefined),
// rather than this component returning null, since there is then no Rundgang
// to illustrate either.
//
// The Figma instance also carries a "Hinweis" bookmark line ("Ihr Lesezeichen
// im Rundgang: Station n.") and reads the action "Zurück zu Station n", and
// its Viertel line reads "... – der Rundgang ist hier pausiert." — all three
// describe a visitor who already started the Rundgang. The issue's
// acceptance criteria exclude that state ("no bookmark line") in favour of
// the first-visit copy built here: "Station n ansehen" and a Viertel line
// that only names the Rundgang connection, not a paused one.
function GangartBox({ rundgang, station, viertel, className, ...props }: GangartBoxProps) {
	return (
		<div
			data-slot="gangart-box"
			className={cn('flex flex-col gap-3 rounded-xl bg-secondary p-4', className)}
			{...props}
		>
			<MonoLabel>{t('gangart.label')}</MonoLabel>
			<div className="flex items-center gap-3">
				<Illustration id={rundgang.id} label={rundgang.title} className="size-12 shrink-0" />
				<div className="flex flex-col gap-1">
					<p className="text-sm font-medium text-foreground">
						{t('gangart.titel', { number: station.number })}
					</p>
					<p className="text-xs text-muted-foreground">
						{t('gangart.viertelLine', { title: viertel.title })}
					</p>
				</div>
			</div>
			<Link
				href={station.url}
				className={buttonVariants({ variant: 'outline', className: 'w-full' })}
			>
				{t('gangart.ansehen', { number: station.number })}
				<Icon iconName="arrowRight" data-icon="inline-end" />
			</Link>
		</div>
	)
}

export { GangartBox }
