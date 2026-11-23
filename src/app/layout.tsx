import '@/lib/styles/globals.css'

import path from 'node:path'

import { cn } from 'cn'
import type { Metadata } from 'next'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/utils/theme-provider'
import { buildContentGraph, siteWordmark } from '@/lib/content'
import { heading, mono, sans, serif } from '@/lib/styles/fonts'

// `next dev` is the one caller that previews a Draft (issue #33); every other
// command, `next build` included, sees the published-only graph.
const graph = buildContentGraph(path.join(process.cwd(), 'src/content'), {
	development: process.env.NODE_ENV === 'development',
})

export const metadata: Metadata = {
	metadataBase: new URL(graph.site.baseUrl),
	title: {
		template: `%s · ${graph.site.name}`,
		default: siteWordmark(graph.site),
	},
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
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
					<Header site={graph.site} homeUrl={graph.navigation.url} menu={graph.getMenu('header')} />
					{children}
					<Footer site={graph.site} menu={graph.getMenu('footer')} />
				</ThemeProvider>
			</body>
		</html>
	)
}
