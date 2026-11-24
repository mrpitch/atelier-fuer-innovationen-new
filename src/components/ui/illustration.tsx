import type * as React from 'react'

import { Annaeherung } from '@/components/ui/illustrations/annaeherung'
import { Fuehrung } from '@/components/ui/illustrations/fuehrung'
import { Inszenierung } from '@/components/ui/illustrations/inszenierung'
import { Kontexte } from '@/components/ui/illustrations/kontexte'
import { MaerkteKooperation } from '@/components/ui/illustrations/maerkte-kooperation'
import { Potenziale } from '@/components/ui/illustrations/potenziale'
import { Wertschoepfung } from '@/components/ui/illustrations/wertschoepfung'
import { Zentrum } from '@/components/ui/illustrations/zentrum'
import { Zukunft } from '@/components/ui/illustrations/zukunft'

// Placeholder visual until an entry's real illustration is exported from the
// Figma file (scripts/illustration-export.mts, issue #88). Swapping an entry
// for its real illustration doesn't touch any caller (issue #28).
function Placeholder({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-placeholder"
			role="img"
			aria-label={label}
			viewBox="0 0 64 64"
			{...props}
		>
			<rect width="64" height="64" rx="4" />
		</svg>
	)
}

// Looked up by the owning document's ID (8 Viertel, Zentrum, 3 Themen,
// 3 Rundgänge), so content never names an illustration file (issue #28).
const illustrations = {
	'stadt/annaeherung': Annaeherung,
	'stadt/maerkte-kooperation': MaerkteKooperation,
	'stadt/kontexte': Kontexte,
	'stadt/inszenierung': Inszenierung,
	'stadt/zukunft': Zukunft,
	'stadt/wertschoepfung': Wertschoepfung,
	'stadt/potenziale': Potenziale,
	'stadt/fuehrung': Fuehrung,
	'stadt/zentrum': Zentrum,
	'themen/eine-welt-fuer-morgen': Placeholder,
	'themen/futursysteme': Placeholder,
	'themen/netzwerk-der-innovatoren': Placeholder,
	'rundgaenge/besuch-im-zentrum': Placeholder,
	'rundgaenge/durch-die-viertel': Placeholder,
} satisfies Record<string, React.ComponentType<{ label: string } & React.ComponentProps<'svg'>>>

type IllustrationId = keyof typeof illustrations

interface IllustrationProps extends React.ComponentProps<'svg'> {
	id: string
	label: string
}

// id comes from the content graph (a Viertel's, the Zentrum's, a Thema's or a Rundgang's own ID), not
// from a caller-written literal, so it can't be typed as IllustrationId —
// an unmatched id is a registry gap, not a possible caller mistake to permit
// silently.
function Illustration({ id, label, ...props }: IllustrationProps) {
	const IllustrationComponent = illustrations[id as IllustrationId]
	if (!IllustrationComponent) {
		throw new Error(`Illustration: no illustration registered for ID "${id}"`)
	}
	return <IllustrationComponent label={label} {...props} />
}

export { Illustration }
