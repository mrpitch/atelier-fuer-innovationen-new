import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import type { Seite } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface RundgaengeHinweisProps extends React.ComponentProps<'div'> {
	rundgaengeHub: Seite
}

// Xenia / Thema / Rundgänge-Hinweis (a Figma frame, not a component — issue
// #149's own "Known Figma limits"): the Themen-Hub's closing box, "Lieber
// geführt als selbst gewählt?" with an outline button to the Rundgänge-Hub.
// Not a Hinweis (glossary): that is a Viertel's own optional link field.
// Stacks at 390 (Kartei design system, Breakpoints, "Themen-Übersicht").
function RundgaengeHinweis({ rundgaengeHub, className, ...props }: RundgaengeHinweisProps) {
	return (
		<div
			data-slot="rundgaenge-hinweis"
			className={cn(
				'flex flex-col gap-6 rounded-xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between',
				className,
			)}
			{...props}
		>
			<div className="flex flex-col gap-2">
				<p className="text-xl font-medium text-foreground">{t('themen.hub.hinweisHeading')}</p>
				<p className="text-base text-muted-foreground">{t('themen.hub.hinweisText')}</p>
			</div>
			<Link
				href={rundgaengeHub.url}
				className={buttonVariants({ variant: 'outline', className: 'shrink-0 self-start' })}
			>
				{t('themen.hub.hinweisAction')}
				<Icon iconName="arrowRight" data-icon="inline-end" />
			</Link>
		</div>
	)
}

export { RundgaengeHinweis }
