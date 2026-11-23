import '@/lib/styles/globals.css'

import { cn } from 'cn'
import type { Metadata } from 'next'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/utils/theme-provider'
import { asFlatMenu, asGroupedMenu, contentGraph, siteWordmark } from '@/lib/content'
import { heading, mono, sans, serif } from '@/lib/styles/fonts'

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
	// menu.ts's resolveMenus guarantees header and footer-legal resolve flat,
	// footer grouped (content:check fails otherwise); asFlatMenu/asGroupedMenu
	// just restate that guarantee to the type checker.
	const headerMenu = asFlatMenu(graph.getMenu('header'))
	const footerMenu = asGroupedMenu(graph.getMenu('footer'))
	const footerLegalMenu = asFlatMenu(graph.getMenu('footer-legal'))

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
					<Header site={graph.site} homeUrl={graph.navigation.url} menu={headerMenu} />
					{children}
					<Footer
						site={graph.site}
						homeUrl={graph.navigation.url}
						groups={footerMenu}
						legalMenu={footerLegalMenu}
					/>
				</ThemeProvider>
			</body>
		</html>
	)
}
