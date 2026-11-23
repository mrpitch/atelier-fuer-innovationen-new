import { cn } from 'cn'
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
import { buttonVariants } from '@/components/ui/button'
import type { NavigationLink } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface OrtsleisteProps extends React.ComponentProps<'div'> {
	// The breadcrumb trail (graph.getBreadcrumbs), root Seite included — the
	// root never shows here (issue #82, Figma): every Ortsleiste screen draws
	// it starting at the area's own hub Seite (Stadtplan, Rundgänge, Themen).
	breadcrumbs: readonly NavigationLink[]
	previous?: NavigationLink
	next?: NavigationLink
}

// A neighbour's visible name: its Short title alone, or, for a Viertel
// neighbour, its number first (NavigationLink.number), the same composition
// viertel-liste.tsx uses for a Viertel's own numbered title.
function neighbourLabel(link: NavigationLink): string {
	return link.number === undefined
		? link.title
		: t('ortsleiste.numberedLabel', { number: formatTwoDigits(link.number), title: link.title })
}

// The breadcrumb on the left and the neighbouring places on the right
// (DESIGN.md, Place bar), replacing the separate Breadcrumbs and
// PreviousNext on the Viertel, Zentrum, Rundgang and Thema pages (issue
// #82). Stacked on mobile and tablet (768), a row from 1024 up (Figma).
function Ortsleiste({ breadcrumbs, previous, next, className, ...props }: OrtsleisteProps) {
	const trail = breadcrumbs.filter((item) => item.id !== '')
	const current = trail.at(-1)

	return (
		<div
			data-slot="ortsleiste"
			className={cn(
				'flex flex-col gap-3 border-b border-border px-5 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-24',
				className,
			)}
			{...props}
		>
			<Breadcrumb aria-label={t('navigation.youAreHere')}>
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
			{(previous !== undefined || next !== undefined) && (
				<div className="flex items-center gap-2">
					{previous && (
						<Link href={previous.url} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
							{t('ortsleiste.previous', { label: neighbourLabel(previous) })}
						</Link>
					)}
					{next && (
						<Link href={next.url} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
							{t('ortsleiste.next', { label: neighbourLabel(next) })}
						</Link>
					)}
				</div>
			)}
		</div>
	)
}

export { Ortsleiste }
