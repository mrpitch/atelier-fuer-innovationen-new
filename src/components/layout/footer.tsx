import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'
import { useId } from 'react'

import { Container } from '@/components/layout/container'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { MenuGroupLink, MenuLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface FooterProps extends React.ComponentProps<'footer'> {
	wortmarke: React.ReactNode
	copyright: string
	groups: readonly MenuGroupLink[]
	legalMenu: readonly MenuLink[]
}

// A footer link is a Button link instance, size sm (DESIGN.md, Navigation;
// Figma 36694:29802), in the muted foreground the Figma footer sets.
function FooterLink({ url, label }: { url: string; label: string }) {
	return (
		<Link
			href={url}
			className={cn(
				buttonVariants({ variant: 'link', size: 'sm' }),
				'text-muted-foreground hover:text-foreground',
			)}
		>
			{label}
		</Link>
	)
}

// Xenia / Site / Footer (Figma 36622:8814): the Wortmarke, a Separator, the
// footer Menu's groups as labelled columns and footer-legal as the bottom
// row. Pro Blocks Footer / 4, Kartei-adapted — flex columns instead of the
// block's fixed-count grid, so a group the footer Menu gains later doesn't
// need a layout change. Below 1024px (the mobile header's own breakpoint,
// #84) everything stacks and centres.
function Footer({ wortmarke, copyright, groups, legalMenu, className, ...props }: FooterProps) {
	const id = useId()

	return (
		<footer
			data-slot="footer"
			className={cn('section-padding-y bg-background text-sm', className)}
			{...props}
		>
			<Container className="flex flex-col gap-12 lg:gap-16">
				<div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
					{wortmarke}
					<nav
						data-slot="footer-menu"
						aria-label={t('layout.footerMenu')}
						className="flex flex-col items-center gap-12 text-center lg:flex-1 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:text-left"
					>
						{groups.map((group, index) => (
							<div
								data-slot="footer-menu-group"
								key={group.label}
								className="flex flex-col items-center gap-4 lg:items-start"
							>
								<p id={`${id}-${index}`} className="text-base font-medium text-foreground">
									{group.label}
								</p>
								<ul
									aria-labelledby={`${id}-${index}`}
									className="flex flex-col items-center gap-4 lg:items-start"
								>
									{group.links.map((item) => (
										<li key={item.url}>
											<FooterLink url={item.url} label={item.label} />
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>
				<Separator role="presentation" />
				<div className="flex flex-col-reverse items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
					<p className="text-muted-foreground">{copyright}</p>
					<nav
						data-slot="footer-legal-menu"
						aria-label={t('layout.footerLegalMenu')}
						className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:gap-8 lg:text-left"
					>
						<ul className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
							{legalMenu.map((item) => (
								<li key={item.url}>
									<FooterLink url={item.url} label={item.label} />
								</li>
							))}
						</ul>
					</nav>
				</div>
			</Container>
		</footer>
	)
}

export { Footer }
