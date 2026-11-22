import '@/lib/styles/globals.css'

import { cn } from 'cn'

import { ThemeProvider } from '@/components/utils/theme-provider'
import { heading, mono, sans, serif } from '@/lib/styles/fonts'

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
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
