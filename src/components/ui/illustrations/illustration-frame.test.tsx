import { inlineFrameSource } from '@scripts/illustration-transform'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { IllustrationFrame } from './illustration-frame'

describe('IllustrationFrame', () => {
	it('draws the token-coloured outer ring and the ground line', () => {
		const html = renderToStaticMarkup(
			<svg>
				<IllustrationFrame />
			</svg>,
		)

		expect(html).toContain('class="fill-secondary"')
		expect(html).toContain('d="M28 196H212"')
		expect(html).toContain('class="stroke-foreground"')
		expect(html).not.toMatch(/\sid="/)
	})

	// The transform keeps the frame geometry in FRAME_RING_ATTRS /
	// FRAME_GROUND_ATTRS; an edit to either side alone must fail here.
	it('renders what the transform emits for the frame paths when it does not lift them', () => {
		function attributesOf(markup: string, camelToKebab: boolean) {
			return [...markup.matchAll(/<path\b([^>]*)\/?>/g)].map(([, attrs]) =>
				Object.fromEntries(
					[...attrs!.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => {
						const attr = name === 'className' ? 'class' : name!
						return [
							camelToKebab ? attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`) : attr,
							value,
						]
					}),
				),
			)
		}

		const rendered = renderToStaticMarkup(
			<svg>
				<IllustrationFrame />
			</svg>,
		)

		expect(attributesOf(rendered, false)).toEqual(attributesOf(inlineFrameSource(), true))
	})
})
