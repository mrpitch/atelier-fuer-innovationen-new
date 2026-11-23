import Link from 'next/link'
import type * as React from 'react'

import type { NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface PreviousNextProps extends React.ComponentProps<'nav'> {
	previous?: NavigationLink
	next?: NavigationLink
}

function PreviousNext({ previous, next, ...props }: PreviousNextProps) {
	if (!previous && !next) return null

	return (
		<nav data-slot="previous-next" {...props}>
			{previous && (
				<Link href={previous.url}>{t('navigation.previousLink', { title: previous.title })}</Link>
			)}
			{next && <Link href={next.url}>{t('navigation.nextLink', { title: next.title })}</Link>}
		</nav>
	)
}

export { PreviousNext }
