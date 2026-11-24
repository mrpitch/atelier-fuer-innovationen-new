import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu'
import { cn } from 'cn'

// Only Root, List, Item and Link: the header Menu is flat (docs/reference/content/content-layer.md,
// menu.ts's FLAT_MENU_NAMES), so the kit's Trigger/Content/Positioner/Indicator for submenus
// are left uninstalled rather than kept as dead code.
function NavigationMenu({ className, ...props }: NavigationMenuPrimitive.Root.Props) {
	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			className={cn(
				'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
				className,
			)}
			{...props}
		/>
	)
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
			{...props}
		/>
	)
}

function NavigationMenuItem({ className, ...props }: NavigationMenuPrimitive.Item.Props) {
	return (
		<NavigationMenuPrimitive.Item
			data-slot="navigation-menu-item"
			className={cn('relative', className)}
			{...props}
		/>
	)
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cn(
				// The current area's Pappe pill is the same bg-muted the kit already
				// uses for Hover (Kartei design system, Open deviations): Figma draws the active
				// item as its own Hover variant, with no separate active state.
				"flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 data-active:bg-muted data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	)
}

export { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList }
