import Link from 'next/link'
import type * as React from 'react'

import type { NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface BreadcrumbsProps extends React.ComponentProps<'nav'> {
	items: readonly NavigationLink[]
}

function Breadcrumbs({ items, ...props }: BreadcrumbsProps) {
	const current = items.at(-1)

	return (
		<nav data-slot="breadcrumbs" aria-label={t('navigation.youAreHere')} {...props}>
			<ol>
				{items.map((item) => (
					<li key={item.id}>
						{item.id === current?.id ? (
							<span aria-current="page">{item.title}</span>
						) : (
							<Link href={item.url}>{item.title}</Link>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}

export { Breadcrumbs }
