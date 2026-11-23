import { cn } from 'cn'
import type * as React from 'react'

import { HeaderNav } from '@/components/layout/header-nav'
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
// Below 1024px the mobile header takes over (#84); until then this one may
// show at every width.
function Header({ site, homeUrl, menu, className, ...props }: HeaderProps) {
	return (
		<header
			data-slot="header"
			className={cn('flex h-16 items-center bg-background', className)}
			{...props}
		>
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-12 px-6">
				<Wortmarke site={site} homeUrl={homeUrl} />
				<HeaderNav menu={menu} />
			</div>
		</header>
	)
}

export { Header }
