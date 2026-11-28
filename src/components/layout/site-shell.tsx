import type * as React from 'react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Wortmarke } from '@/components/layout/wortmarke'
import { contentGraph } from '@/lib/content'

// The site Header and Footer (Kartei design system, Navigation), around
// every page's own content, capped to the 1280px the Header and Footer share
// (Container) — every route calls this except a Station page's
// (issue #120): its own Rundgang-Leiste takes their place, so RootLayout
// stopped rendering them for every route alike.
function SiteShell({ children }: { children: React.ReactNode }) {
	const graph = contentGraph()
	const headerMenu = graph.getMenu('header')
	const footerMenu = graph.getMenu('footer')
	const footerLegalMenu = graph.getMenu('footer-legal')
	const wortmarke = <Wortmarke site={graph.site} homeUrl={graph.navigation.url} />

	return (
		<>
			<Header wortmarke={wortmarke} menu={headerMenu} />
			<div data-slot="site-content" className="mx-auto w-full max-w-7xl">
				{children}
			</div>
			<Footer
				wortmarke={wortmarke}
				copyright={graph.site.copyright}
				groups={footerMenu}
				legalMenu={footerLegalMenu}
			/>
		</>
	)
}

export { SiteShell }
