import Link from 'next/link'
import type * as React from 'react'

import type { Viertel } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'

interface ViertelTeaserCardProps extends React.ComponentProps<'article'> {
	viertel: Viertel
}

// The presentational half of ViertelTeaser (issue #35): purely data-driven, so
// a test can render it against a Viertel straight from a fixture graph
// (Testing conventions) without going through ViertelTeaser's own, hardcoded
// content directory.
function ViertelTeaserCard({ viertel, ...props }: ViertelTeaserCardProps) {
	return (
		<article data-slot="viertel-teaser" {...props}>
			<Link href={viertel.url}>
				<span>{String(viertel.number).padStart(2, '0')}</span>
				<h3>{shortTitleOrTitle(viertel)}</h3>
			</Link>
			<p>{viertel.leitsatz}</p>
		</article>
	)
}

export { ViertelTeaserCard }
