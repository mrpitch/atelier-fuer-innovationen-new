import Link from 'next/link'

import { SiteShell } from '@/components/layout/site-shell'
import { PageSection } from '@/components/stadt/page-section'
import { buttonVariants } from '@/components/ui/button'
import { contentGraph } from '@/lib/content'
import { t } from '@/lib/dictionary'

// The 404 page. RootLayout renders neither Header nor Footer (a Station page
// has its own Rundgang-Leiste instead, issue #120), so the 404 wraps itself
// in SiteShell like every other non-Station route.
export default function NotFound() {
	return (
		<SiteShell>
			<main>
				<PageSection className="flex flex-col items-start gap-6">
					<h1 className="heading-lg text-foreground">{t('notFound.heading')}</h1>
					<p className="text-muted-foreground">{t('notFound.text')}</p>
					<Link href={contentGraph().navigation.url} className={buttonVariants()}>
						{t('notFound.home')}
					</Link>
				</PageSection>
			</main>
		</SiteShell>
	)
}
