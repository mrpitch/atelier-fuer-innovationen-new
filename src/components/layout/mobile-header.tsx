'use client'

import { cn } from 'cn'
import { usePathname } from 'next/navigation'
import type * as React from 'react'
import { useEffect, useId, useRef, useState } from 'react'

import { HeaderMenu } from '@/components/layout/header-menu'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import type { MenuLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface MobileHeaderProps extends React.ComponentProps<'header'> {
	wortmarke: React.ReactNode
	menu: readonly MenuLink[]
}

// Xenia / Site / Header (Mobile) (Figma 36622:8752): a 64px navbar with the
// Wortmarke and a menu button; the open panel (36622:10621) drops down under
// it with the header Menu, the current area marked as on desktop. Takes
// the current path from the router and hands it to HeaderMenu.
//
// The panel stays in the markup and is hidden while closed, so the button's
// aria-controls always resolves. The panel is open only for the path it was
// opened on: following a link changes the path and closes it, with no effect.
function MobileHeader({ wortmarke, menu, className, ...props }: MobileHeaderProps) {
	const currentPath = usePathname()
	const [openedAt, setOpenedAt] = useState<string | null>(null)
	const open = openedAt === currentPath
	const panelId = useId()
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Escape closes from anywhere on the page, not just from inside the header,
	// and hands focus back to the button.
	useEffect(() => {
		if (!open) return
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== 'Escape') return
			setOpenedAt(null)
			buttonRef.current?.focus()
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [open])

	function handleToggle() {
		setOpenedAt(open ? null : currentPath)
	}

	return (
		<header
			data-slot="mobile-header"
			className={cn('relative bg-background', className)}
			{...props}
		>
			<div className="flex h-16 items-center justify-between gap-4 px-6">
				{wortmarke}
				<Button
					ref={buttonRef}
					variant="ghost"
					size="icon"
					aria-expanded={open}
					aria-controls={panelId}
					aria-label={open ? t('layout.closeMenu') : t('layout.openMenu')}
					onClick={handleToggle}
				>
					<Icon iconName={open ? 'x' : 'menu'} />
				</Button>
			</div>
			<div
				id={panelId}
				hidden={!open}
				className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-6 pb-4"
			>
				<HeaderMenu
					menu={menu}
					currentPath={currentPath}
					className="max-w-none"
					listClassName="flex-col items-stretch justify-start"
					linkClassName="w-full"
				/>
			</div>
		</header>
	)
}

export { MobileHeader, type MobileHeaderProps }
