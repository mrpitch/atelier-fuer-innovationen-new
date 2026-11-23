import type * as React from 'react'

import type { ViertelSteckbrief } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface SteckbriefProps extends React.ComponentProps<'div'> {
	leitsatz: string
	steckbrief: ViertelSteckbrief
}

// Renders a Viertel's Leitsatz and Steckbrief (glossary) from the structured
// frontmatter fields, not from the MDX body (issue #28).
function Steckbrief({ leitsatz, steckbrief, ...props }: SteckbriefProps) {
	return (
		<div data-slot="steckbrief" {...props}>
			<blockquote data-slot="leitsatz">{leitsatz}</blockquote>
			<dl>
				<dt>{t('viertel.steckbrief.prozessansatz')}</dt>
				<dd>{steckbrief.prozessansatz}</dd>
				<dt>{t('viertel.steckbrief.bauform')}</dt>
				<dd>{steckbrief.bauform}</dd>
				<dt>{t('viertel.steckbrief.prozessdokument')}</dt>
				<dd>{steckbrief.prozessdokument}</dd>
				<dt>{t('viertel.steckbrief.imStadtzentrum')}</dt>
				<dd>{steckbrief.imStadtzentrum}</dd>
			</dl>
		</div>
	)
}

export { Steckbrief }
