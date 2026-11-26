import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildContentGraph } from '@/lib/content'

const pathname = vi.hoisted(() => ({ current: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }))

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const fixtureGraph = buildContentGraph(path.join(fixturesDir, 'footer-valid'))

vi.mock('@/lib/content', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/content')>()),
	contentGraph: () => fixtureGraph,
}))

const { SiteShell } = await import('./site-shell')

describe('SiteShell', () => {
	it('wraps its children with the site Header and Footer, in that order', () => {
		const html = renderToStaticMarkup(
			<SiteShell>
				<main data-testid="page-content">content</main>
			</SiteShell>,
		)

		const headerIndex = html.indexOf('data-slot="header"')
		const contentIndex = html.indexOf('data-testid="page-content"')
		const footerIndex = html.indexOf('data-slot="footer"')

		expect(headerIndex).toBeGreaterThanOrEqual(0)
		expect(contentIndex).toBeGreaterThan(headerIndex)
		expect(footerIndex).toBeGreaterThan(contentIndex)
	})
})
