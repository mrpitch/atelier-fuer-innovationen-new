import { cn } from 'cn'
import type * as React from 'react'

import type { Zitat } from '@/lib/content'
import { t } from '@/lib/dictionary'

interface TestimonialsSection1Props extends React.ComponentProps<'section'> {
	zitat: Zitat
}

// Pro Blocks / Testimonials Section / 1 (@shadcndesign/testimonials-section-1,
// issue #126), adapted to Kartei: the registry item centres a quote above an
// Avatar and a "Name • Role" line; the Leitthema's Zitat (issue #124) has no
// avatar field, so this drops the Avatar entirely and keeps only the
// quelle/zusatz attribution, in the same centred column. No lucide import to
// swap here — the registry item itself imports none. The quote reuses
// Bild-Hero's own serif Zitat size (bild-hero.tsx) instead of the registry's
// own smaller one, matching Figma's larger testimonial quote (T09a
// 36603:12965).
function TestimonialsSection1({ zitat, className, ...props }: TestimonialsSection1Props) {
	return (
		<section
			data-slot="testimonials-section-1"
			className={cn(
				'container-padding-x section-padding-y flex flex-col items-center bg-muted/40',
				className,
			)}
			{...props}
		>
			<div className="flex max-w-2xl flex-col items-center gap-8 text-center">
				<blockquote className="font-serif text-[28px] text-foreground xl:text-[40px]">
					{zitat.text}
				</blockquote>
				<p className="text-sm text-muted-foreground">
					{zitat.zusatz
						? t('thema.testimonial.attribution', { quelle: zitat.quelle, zusatz: zitat.zusatz })
						: zitat.quelle}
				</p>
			</div>
		</section>
	)
}

export { TestimonialsSection1 }
