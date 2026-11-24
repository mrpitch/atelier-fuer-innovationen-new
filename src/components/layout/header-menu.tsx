import Link from 'next/link'
import type * as React from 'react'

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@/components/ui/navigation-menu'
import type { MenuLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface HeaderMenuProps extends Omit<React.ComponentProps<typeof NavigationMenu>, 'children'> {
	menu: readonly MenuLink[]
	currentPath: string
	// Classes for the list and each link, so a caller (the mobile header's open
	// panel) can restyle the layout without a mode flag here.
	listClassName?: string
	linkClassName?: string
}

// The current area (issue #81): the entry whose URL is the current path, or
// a path prefix of it, so a page nested under an area (a Station under
// Rundgänge) still marks that area. "/" only ever matches itself, so the
// Startseite — which isn't in this Menu anyway — can never mark one by
// prefix.
function isCurrentMenuLink(url: string, currentPath: string): boolean {
	return url === currentPath || (url !== '/' && currentPath.startsWith(`${url}/`))
}

// The header Menu as a NavigationMenu (Kartei design system, Navigation): a flat list
// of areas (menu.ts's FLAT_MENU_NAMES guarantees the header Menu never
// groups), with the current one marked. Takes `currentPath` as a prop
// instead of reading the router itself, so it stays usable from a Server
// Component and testable without a router context; HeaderNav is the thin
// Client Component that supplies the prop.
function HeaderMenu({
	menu,
	currentPath,
	listClassName,
	linkClassName,
	className,
	...props
}: HeaderMenuProps) {
	return (
		<NavigationMenu aria-label={t('layout.headerMenu')} className={className} {...props}>
			<NavigationMenuList className={listClassName}>
				{menu.map((item) => (
					<NavigationMenuItem key={item.url}>
						<NavigationMenuLink
							className={linkClassName}
							active={isCurrentMenuLink(item.url, currentPath)}
							render={<Link href={item.url} />}
						>
							{item.label}
						</NavigationMenuLink>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	)
}

export { HeaderMenu }
