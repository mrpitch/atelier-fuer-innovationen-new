import Link from 'next/link'
import type * as React from 'react'

import { Wortmarke } from '@/components/layout/wortmarke'
import type { MenuGroupLink, MenuLink, Site } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface FooterProps extends React.ComponentProps<'footer'> {
	site: Site
	homeUrl: string
	groups: readonly MenuGroupLink[]
	legalMenu: readonly MenuLink[]
}

function Footer({ site, homeUrl, groups, legalMenu, ...props }: FooterProps) {
	return (
		<footer data-slot="footer" {...props}>
			<Wortmarke site={site} homeUrl={homeUrl} />
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
