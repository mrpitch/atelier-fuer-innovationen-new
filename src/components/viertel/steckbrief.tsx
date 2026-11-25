import { cn } from 'cn'
import type * as React from 'react'

import type { ViertelSteckbrief } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface SteckbriefFaktProps extends React.ComponentProps<'div'> {
	label: string
	wert: string
}

// Xenia / Inhaltsseite / Steckbrief-Fakt (Figma 36584:15363): an uppercase
// DM Mono label over a display serif 22px value, the one fact shape every
// Steckbrief (this Viertel's, and later a Dossier's or Aufsatz's) repeats
// four times.
function SteckbriefFakt({ label, wert, className, ...props }: SteckbriefFaktProps) {
	return (
		<div data-slot="steckbrief-fakt" className={cn('flex flex-col gap-2.5', className)} {...props}>
			<dt className="font-mono text-xs text-muted-foreground uppercase">{label}</dt>
			<dd className="font-serif text-[22px] text-foreground">{wert}</dd>
		</div>
	)
}

interface SteckbriefProps extends React.ComponentProps<'dl'> {
	steckbrief: ViertelSteckbrief
}

// Xenia / Stadt / Steckbrief (Figma component set 36625:9038): the four
// Steckbrief-Fakten (issue #28) in a row from `lg`, stacked on mobile and
// tablet (the set's own Desktop/Mobile variants) — the same 1024px switch
// the Ortsleiste and Ebenen-Leiste use on this page, so four Fakten never
// crowd a 768px column — the Leitsatz moved into the Bild-Hero as its Zitat
// (issue #96), so this component now holds only the facts.
function Steckbrief({ steckbrief, className, ...props }: SteckbriefProps) {
	return (
		<dl
			data-slot="steckbrief"
			className={cn('grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-10', className)}
			{...props}
		>
			<SteckbriefFakt
				label={t('viertel.steckbrief.prozessansatz')}
				wert={steckbrief.prozessansatz}
			/>
			<SteckbriefFakt label={t('viertel.steckbrief.bauform')} wert={steckbrief.bauform} />
			<SteckbriefFakt
				label={t('viertel.steckbrief.prozessdokument')}
				wert={steckbrief.prozessdokument}
			/>
			<SteckbriefFakt
				label={t('viertel.steckbrief.imStadtzentrum')}
				wert={steckbrief.imStadtzentrum}
			/>
		</dl>
	)
}

export { Steckbrief }
