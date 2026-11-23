import { cn } from 'cn'
import type * as React from 'react'

import { HeaderNav } from '@/components/layout/header-nav'
import { MobileHeaderNav } from '@/components/layout/mobile-header-nav'
import { Wortmarke } from '@/components/layout/wortmarke'
import type { MenuLink, Site } from '@/lib/content'

interface HeaderProps extends React.ComponentProps<'header'> {
	site: Site
	homeUrl: string
	menu: readonly MenuLink[]
}

// Xenia / Site / Header (Figma 36577:16643): the Wortmarke and the header
// Menu, with the reader's current area marked. Stays a Server Component —
// HeaderNav is the only part that needs the router, for the current path.
// From 1024px up (`lg`); below it the mobile header takes over.
function Header({ site, homeUrl, menu, className, ...props }: HeaderProps) {
	return (
		<>
			<header
				data-slot="header"
				className={cn('hidden h-16 items-center bg-background lg:flex', className)}
				{...props}
			>
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-12 px-6">
					<Wortmarke site={site} homeUrl={homeUrl} />
					<HeaderNav menu={menu} />
				</div>
			</header>
			<MobileHeaderNav site={site} homeUrl={homeUrl} menu={menu} className="lg:hidden" />
		</>
	)
}

export { Header }
