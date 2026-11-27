import type * as React from 'react'

import { LeitthemaDetail } from '@/components/thema/leitthema-detail'
import { ThemenOrtDetail } from '@/components/thema/themen-ort-detail'
import type { Thema } from '@/lib/content'

interface ThemaDetailProps extends React.ComponentProps<'div'> {
	thema: Thema
	locale?: string
}

// A Thema's own page content (issue #31), shared between its dedicated German
// route and the catch-all route's localized rendering (issue #36): deciding
// which of the two Figma designs a Thema gets. A Themen-Ort (`kapitelId` set)
// gets ThemenOrtDetail (Figma T09b, issue #125); the Leitthema (no
// `kapitelId`) gets LeitthemaDetail (Figma T09a, issue #126).
async function ThemaDetail({ thema, locale, ...props }: ThemaDetailProps) {
	// Awaited directly, not rendered as JSX: React's RSC renderer resolves a
	// nested async component on its own, but the plain react-dom/server
	// renderer the component tests use (renderToStaticMarkup) doesn't, so
	// this stays testable the same way RundgangDetail is.
	return thema.kapitelId !== undefined
		? await ThemenOrtDetail({ thema, locale, ...props })
		: await LeitthemaDetail({ thema, locale, ...props })
}

export { ThemaDetail }
