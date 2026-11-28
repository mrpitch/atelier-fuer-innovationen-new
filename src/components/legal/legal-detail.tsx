import { cn } from 'cn'
import type * as React from 'react'

import { Ortsleiste } from '@/components/navigation/ortsleiste'
import { PageSection } from '@/components/stadt/page-section'
import { SectionTitle } from '@/components/stadt/section-title'
import { RichText } from '@/components/ui/rich-text'
import type { Seite } from '@/lib/content'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'
import { bodyImageComponents } from '@/mdx-components'

interface LegalDetailProps extends React.ComponentProps<'div'> {
	seite: Seite
	locale?: string
}

// A legal Seite's own page (Impressum, Datenschutz; issue #135): an
// Ortsleiste whose right side is the other footer-legal pages instead of a
// previous/next pair — a legal page has no neighbour sequence of its own —
// then a Section Title XL ("Rechtliches" kicker, the page's own h1) and the
// MDX body in the Typography Rich Text style, replacing the generic Seite's
// bare Breadcrumbs/h1/body/PreviousNext for just these two Seiten.
async function LegalDetail({ seite, locale, className, ...props }: LegalDetailProps) {
	const graph = contentGraph()
	const Body = await graph.getBody(seite.id, locale)
	const actions = graph.getMenu('footer-legal').filter((link) => link.url !== seite.url)

	return (
		<div data-slot="legal-detail" className={cn(className)} {...props}>
			<Ortsleiste breadcrumbs={graph.getBreadcrumbs(seite.id)} actions={actions} />
			<PageSection data-slot="legal-detail-section" className="flex flex-col gap-10">
				<SectionTitle tagline={t('legal.kicker')} title={seite.title} titleAs="h1" size="xl" />
				<RichText>
					<Body components={bodyImageComponents(seite.id)} />
				</RichText>
			</PageSection>
		</div>
	)
}

export { LegalDetail }
