'use client'

import { usePathname } from 'next/navigation'

import { MobileHeader, type MobileHeaderProps } from '@/components/layout/mobile-header'

// Same split as HeaderNav: the router read lives here so MobileHeader stays a
// plain function of its props.
function MobileHeaderNav(props: Omit<MobileHeaderProps, 'currentPath'>) {
	return <MobileHeader currentPath={usePathname()} {...props} />
}

export { MobileHeaderNav }
