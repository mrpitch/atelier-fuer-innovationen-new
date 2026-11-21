import { ArrowDown, ArrowLeft, ArrowRight, type LucideIcon, type LucideProps } from 'lucide-react'

// The only file that imports lucide-react: docs/reference/components/icon-registry.md.
// The arrows mark movement on buttons and links (DESIGN.md, Buttons).
const icons = {
	arrowDown: ArrowDown,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
} satisfies Record<string, LucideIcon>

type IconType = keyof typeof icons

function Icon({ iconName, ...props }: LucideProps & { iconName: IconType }) {
	const LucideComponent = icons[iconName]
	return <LucideComponent {...props} />
}

export { Icon, type IconType }
