import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ChevronRight,
	type LucideIcon,
	type LucideProps,
	Menu,
	X,
} from 'lucide-react'

// The only file that imports lucide-react: docs/reference/components/icon-registry.md.
// The arrows mark movement on buttons and links (DESIGN.md, Buttons).
const icons = {
	arrowDown: ArrowDown,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
	chevronRight: ChevronRight,
	menu: Menu,
	x: X,
} satisfies Record<string, LucideIcon>

type IconType = keyof typeof icons

function Icon({ iconName, ...props }: LucideProps & { iconName: IconType }) {
	const LucideComponent = icons[iconName]
	return <LucideComponent {...props} />
}

export { Icon, type IconType }
