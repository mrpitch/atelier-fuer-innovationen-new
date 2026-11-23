'use client'

import { usePathname } from 'next/navigation'

import { HeaderMenu } from '@/components/layout/header-menu'
import type { MenuLink } from '@/lib/content'

interface HeaderNavProps {
	menu: readonly MenuLink[]
}

// The smallest Client Component in the header (react-component-conventions.md):
// reads the router for the current path, then hands it to HeaderMenu as a
// prop, so HeaderMenu stays a plain function of its props — server-renderable
// and testable without a router context.
function HeaderNav({ menu }: HeaderNavProps) {
	const currentPath = usePathname()
	return <HeaderMenu menu={menu} currentPath={currentPath} />
}

export { HeaderNav }
