import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn } from 'cn'

// The page-level section padding shared by the Stadtplan-Hub and the Viertel
// page (issues #95, #96); `render={<nav />}` for a section that is a landmark.
function PageSection({ className, render, ...props }: useRender.ComponentProps<'section'>) {
	return useRender({
		defaultTagName: 'section',
		props: mergeProps<'section'>(
			{ className: cn('px-5 py-14 md:px-24 md:py-16', className) },
			props,
		),
		render,
		state: { slot: 'page-section' },
	})
}

export { PageSection }
