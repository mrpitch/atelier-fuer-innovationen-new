import '@/lib/styles/globals.css'

import { cn } from 'cn'
import type { Metadata } from 'next'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Wortmarke } from '@/components/layout/wortmarke'
import { ThemeProvider } from '@/components/utils/theme-provider'
import { contentGraph, siteWordmark } from '@/lib/content'
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
	const headerMenu = graph.getMenu('header')
	const footerMenu = graph.getMenu('footer')
	const footerLegalMenu = graph.getMenu('footer-legal')
	const wortmarke = <Wortmarke site={graph.site} homeUrl={graph.navigation.url} />

	return (
		<html
			lang="de"
			// next-themes sets the `dark` class on <html> before React hydrates.
			suppressHydrationWarning
			className="h-full antialiased"
		>
			{/* Font variables belong on <body>: docs/reference/design/font-system.md */}
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
					<Header wortmarke={wortmarke} menu={headerMenu} />
					{children}
					<Footer
						wortmarke={wortmarke}
						copyright={graph.site.copyright}
						groups={footerMenu}
						legalMenu={footerLegalMenu}
					/>
				</ThemeProvider>
			</body>
		</html>
	)
}
