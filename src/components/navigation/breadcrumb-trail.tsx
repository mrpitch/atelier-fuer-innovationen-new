import Link from 'next/link'
import type * as React from 'react'
import { Fragment } from 'react'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface BreadcrumbTrailProps extends React.ComponentProps<typeof Breadcrumb> {
	// graph.getBreadcrumbs's own trail, root Seite included — it never shows
	// here (issue #82, Figma): the Ortsleiste and the Ebenen-Leiste both start
	// their breadcrumb at the area's own hub Seite (Stadtplan, Rundgänge,
	// Themen), not at the root.
	breadcrumbs: readonly NavigationLink[]
}

// The breadcrumb trail shared by the Ortsleiste (issue #82) and the
// Ebenen-Leiste (issue #85): the last item plain text, every other item a
// link, separated by a chevron.
function BreadcrumbTrail({ breadcrumbs, 'aria-label': ariaLabel, ...props }: BreadcrumbTrailProps) {
	const trail = breadcrumbs.filter((item) => item.id !== '')
	const current = trail.at(-1)

	return (
		<Breadcrumb aria-label={ariaLabel ?? t('navigation.youAreHere')} {...props}>
			<BreadcrumbList>
				{trail.map((item, index) => (
					<Fragment key={item.id}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{item.id === current?.id ? (
								<BreadcrumbPage>{item.title}</BreadcrumbPage>
							) : (
								<BreadcrumbLink render={<Link href={item.url} />}>{item.title}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}

export { BreadcrumbTrail }
