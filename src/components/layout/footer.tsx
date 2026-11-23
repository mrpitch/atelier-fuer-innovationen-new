import Link from 'next/link'
import type * as React from 'react'

import type { MenuGroupLink, MenuLink, Site } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface FooterProps extends React.ComponentProps<'footer'> {
	site: Site
	groups: readonly MenuGroupLink[]
	legalMenu: readonly MenuLink[]
}

function Footer({ site, groups, legalMenu, ...props }: FooterProps) {
	return (
		<footer data-slot="footer" {...props}>
			<nav data-slot="footer-menu" aria-label={t('layout.footerMenu')}>
				{groups.map((group) => (
					<div data-slot="footer-menu-group" key={group.label}>
						<p>{group.label}</p>
						<ul>
							{group.links.map((item) => (
								<li key={item.url}>
									<Link href={item.url}>{item.label}</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
			<nav data-slot="footer-legal-menu" aria-label={t('layout.footerLegalMenu')}>
				<ul>
					{legalMenu.map((item) => (
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
