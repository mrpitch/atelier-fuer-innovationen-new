import '@/lib/styles/globals.css'

import { cn } from 'cn'
import type { Metadata } from 'next'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/utils/theme-provider'
import type { MenuGroupLink, MenuLink, ResolvedMenu } from '@/lib/content'
import { contentGraph, isGroupedMenu, siteWordmark } from '@/lib/content'
import { heading, mono, sans, serif } from '@/lib/styles/fonts'

// header and footer-legal are always flat Menus, footer always a grouped one
// (content convention, not something the content graph itself enforces) — a
// Menu file edited into the wrong shape fails loudly here rather than
// silently rendering an empty nav. An unlisted Menu (empty either way) still
// resolves rather than throwing, matching ContentGraph.getMenu's contract.
function flatMenu(menu: ResolvedMenu, name: string): readonly MenuLink[] {
	if (!isGroupedMenu(menu)) return menu
	throw new Error(`RootLayout: Menu "${name}" is grouped, expected a flat Menu`)
}

function groupedMenu(menu: ResolvedMenu, name: string): readonly MenuGroupLink[] {
	if (menu.length === 0) return menu as readonly MenuGroupLink[]
	if (isGroupedMenu(menu)) return menu
	throw new Error(`RootLayout: Menu "${name}" is flat, expected a grouped Menu`)
}

export function generateMetadata(): Metadata {
	const { site } = contentGraph()
	return {
		metadataBase: new URL(site.baseUrl),
		title: {
			template: `%s · ${site.name}`,
			default: siteWordmark(site),
		},
	}
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	const graph = contentGraph()
	const headerMenu = graph.getMenu('header')
	const footerMenu = graph.getMenu('footer')
	const footerLegalMenu = graph.getMenu('footer-legal')

	return (
		<html
			lang="de"
			// next-themes sets the `dark` class on <html> before React hydrates.
			suppressHydrationWarning
			className="h-full antialiased"
		>
			{/* Font variables belong on <body>: docs/reference/css/font-system.md */}
			<body
				className={cn(
					sans.variable,
					serif.variable,
					heading.variable,
					mono.variable,
					'flex min-h-full flex-col',
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Header
						site={graph.site}
						homeUrl={graph.navigation.url}
						menu={flatMenu(headerMenu, 'header')}
					/>
					{children}
					<Footer
						site={graph.site}
						groups={groupedMenu(footerMenu, 'footer')}
						legalMenu={flatMenu(footerLegalMenu, 'footer-legal')}
					/>
				</ThemeProvider>
			</body>
		</html>
	)
}
