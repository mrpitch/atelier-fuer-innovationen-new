import Link from 'next/link'
import type * as React from 'react'

import type { MenuLink, Site } from '@/lib/content'
import { siteWordmark } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface HeaderProps extends React.ComponentProps<'header'> {
	site: Site
	menu: readonly MenuLink[]
}

function Header({ site, menu, ...props }: HeaderProps) {
	return (
		<header data-slot="header" {...props}>
			<Link href="/">{siteWordmark(site)}</Link>
			<nav data-slot="header-menu" aria-label={t('layout.headerMenu')}>
				<ul>
					{menu.map((item) => (
						<li key={item.url}>
							<Link href={item.url}>{item.label}</Link>
						</li>
					))}
				</ul>
			</nav>
		</header>
	)
}

export { Header }
