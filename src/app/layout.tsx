import '@/lib/styles/globals.css'

import { cn } from 'cn'
import type { Metadata } from 'next'

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

// The site Header and Footer are not here: a Station page (issue #120) has
// its own Rundgang-Leiste instead, and a single root layout wraps every
// route, so neither can live here unconditionally. Every other route wraps
// its own content with SiteShell (site-shell.tsx).
export default function RootLayout({ children }: LayoutProps<'/'>) {
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
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
