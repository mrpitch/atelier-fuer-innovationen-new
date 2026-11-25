import { cn } from 'cn'
import type * as React from 'react'

interface PageSectionProps extends React.ComponentProps<'section'> {
	as?: 'section' | 'nav'
}

// The page-level section padding shared by the Stadtplan-Hub and the Viertel
// page (issues #95, #96); `as="nav"` for a section that is a landmark list.
function PageSection({ as: Tag = 'section', className, ...props }: PageSectionProps) {
	return (
		<Tag
			data-slot="page-section"
			className={cn('px-5 py-14 md:px-24 md:py-16', className)}
			{...(props as React.ComponentProps<'nav'>)}
		/>
	)
}

export { PageSection }
