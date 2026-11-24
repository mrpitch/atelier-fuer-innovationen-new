import { cn } from 'cn'
import type * as React from 'react'

import { Container } from '@/components/layout/container'
import { HeaderNav } from '@/components/layout/header-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
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
				<Container className="flex items-center justify-between gap-12">
					<Wortmarke site={site} homeUrl={homeUrl} />
					<HeaderNav menu={menu} />
				</Container>
			</header>
			<MobileHeader site={site} homeUrl={homeUrl} menu={menu} className="lg:hidden" />
		</>
	)
}

export { Header }
