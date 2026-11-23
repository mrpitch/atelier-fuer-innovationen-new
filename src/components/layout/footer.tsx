import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import { Wortmarke } from '@/components/layout/wortmarke'
import { Separator } from '@/components/ui/separator'
import type { MenuGroupLink, MenuLink, Site } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface FooterProps extends React.ComponentProps<'footer'> {
	site: Site
	homeUrl: string
	groups: readonly MenuGroupLink[]
	legalMenu: readonly MenuLink[]
}

const footerLinkClassName = 'text-muted-foreground transition-colors hover:text-foreground'

// Xenia / Site / Footer (Figma 36622:8814): the Wortmarke, a Separator, the
// footer Menu's groups as labelled columns and footer-legal as the bottom
// row. Pro Blocks Footer / 4, Kartei-adapted — flex columns instead of the
// block's fixed-count grid, so a group the footer Menu gains later doesn't
// need a layout change. Below 1024px (the mobile header's own breakpoint,
// #84) everything stacks and centres.
function Footer({ site, homeUrl, groups, legalMenu, className, ...props }: FooterProps) {
	return (
		<footer
			data-slot="footer"
			className={cn('section-padding-y bg-background text-sm', className)}
			{...props}
		>
			<div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:gap-16">
				<div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
					<Wortmarke site={site} homeUrl={homeUrl} />
					<nav
						data-slot="footer-menu"
						aria-label={t('layout.footerMenu')}
						className="flex flex-col items-center gap-12 text-center lg:flex-1 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:text-left"
					>
						{groups.map((group) => (
							<div
								data-slot="footer-menu-group"
								key={group.label}
								className="flex flex-col items-center gap-4 lg:items-start"
							>
								<h2 className="text-base font-medium text-foreground">{group.label}</h2>
								<ul className="flex flex-col items-center gap-4 lg:items-start">
									{group.links.map((item) => (
										<li key={item.url}>
											<Link href={item.url} className={footerLinkClassName}>
												{item.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>
				<Separator role="presentation" />
				<div className="flex flex-col-reverse items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
					<p className="text-muted-foreground">{site.copyright}</p>
					<nav
						data-slot="footer-legal-menu"
						aria-label={t('layout.footerLegalMenu')}
						className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:gap-8 lg:text-left"
					>
						<ul className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
							{legalMenu.map((item) => (
								<li key={item.url}>
									<Link href={item.url} className={footerLinkClassName}>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	)
}

export { Footer }
