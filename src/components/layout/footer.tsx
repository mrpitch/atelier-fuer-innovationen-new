import Link from 'next/link'
import type * as React from 'react'

import type { MenuLink, Site } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface FooterProps extends React.ComponentProps<'footer'> {
	site: Site
	menu: readonly MenuLink[]
}

function Footer({ site, menu, ...props }: FooterProps) {
	return (
		<footer data-slot="footer" {...props}>
			<nav data-slot="footer-menu" aria-label={t('layout.footerMenu')}>
				<ul>
					{menu.map((item) => (
						<li key={item.url}>
							<Link href={item.url}>{item.label}</Link>
						</li>
					))}
				</ul>
			</nav>
			<p>{site.copyright}</p>
		</footer>
	)
}

export { Footer }
