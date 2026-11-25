import { cn } from 'cn'
import type * as React from 'react'

// Xenia / Typography / Rich Text (Figma component 36698:54377, "Maps to
// shadcn/ui Typography"; issue #101): the Kartei styling for a document's
// MDX body — Literata, the Source Text Rule's face for the original Xenia
// texts (kartei-design-system.md, Typography). The shadcn/ui registry
// serves no base-nova `typography` item yet (404 as of this writing), so
// this styles the body's plain elements by hand instead of installing one.
function RichText({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="rich-text"
			className={cn(
				'flex flex-col gap-5 font-serif text-lg text-foreground',
				'[&_a]:text-primary [&_a]:underline',
				'[&_blockquote]:font-serif [&_blockquote]:text-xl [&_blockquote]:italic',
				'[&_h2]:font-heading [&_h2]:text-3xl [&_h2]:text-foreground',
				'[&_h3]:font-heading [&_h3]:text-2xl [&_h3]:text-foreground',
				'[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
				className,
			)}
			{...props}
		/>
	)
}

export { RichText }
