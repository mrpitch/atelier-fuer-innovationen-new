import { describe, expect, it } from 'vitest'

import { transformIllustrationSvg } from './illustration-transform'

// Shaped like a real Figma `/v1/images` export (annaeherung.svg, fetched by
// hand for issue #88): a parent section's background and border sit beside
// the `Illustration / …` group, hex fills and strokes, `white`, and `id` on
// every node.
const FIXTURE_SVG = `<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect id="Section-Hintergrund" width="240" height="240" fill="#FBFAF7"/>
<rect id="Section-Rahmen" width="240" height="240" stroke="#D6D1C5"/>
<g id="Illustration / Viertel / Testviertel">
<path id="Scheibe" d="M0 0H10V10H0Z" fill="#DCEBE9"/>
<path id="Pfeiler" d="M1 1H2V2H1Z" fill="#00676B" stroke="#1F2421" stroke-width="2"/>
<path id="Bodenlinie" d="M0 20H20" stroke-width="2" stroke="#1F2421"/>
<path id="Lichtkante" d="M2 2H4" stroke="white"/>
</g>
</svg>
`

describe('transformIllustrationSvg', () => {
	it('keeps only the Illustration group, dropping the parent section background and border', () => {
		const moduleSource = transformIllustrationSvg(FIXTURE_SVG, 'Testviertel')

		expect(moduleSource).not.toContain('Section-Hintergrund')
		expect(moduleSource).not.toContain('Section-Rahmen')
		expect(moduleSource).toContain('d="M1 1H2V2H1Z"')
	})

	it('maps every known hex to its token class', () => {
		const moduleSource = transformIllustrationSvg(FIXTURE_SVG, 'Testviertel')

		expect(moduleSource).toContain('className="fill-secondary"')
		expect(moduleSource).toContain('className="fill-primary stroke-foreground"')
		expect(moduleSource).toContain('className="stroke-foreground"')
	})

	it('maps fill and stroke on the same path to both classes, in fill-then-stroke order', () => {
		const moduleSource = transformIllustrationSvg(FIXTURE_SVG, 'Testviertel')

		expect(moduleSource).toContain(
			'd="M1 1H2V2H1Z" strokeWidth="2" className="fill-primary stroke-foreground"',
		)
	})

	it('maps the white stroke to the primary-foreground token', () => {
		const moduleSource = transformIllustrationSvg(FIXTURE_SVG, 'Testviertel')

		expect(moduleSource).toContain('className="stroke-primary-foreground"')
	})

	it('throws naming the node and the value for an unknown colour', () => {
		const svgWithUnknownColor = FIXTURE_SVG.replace('#DCEBE9', '#123456')

		expect(() => transformIllustrationSvg(svgWithUnknownColor, 'Testviertel')).toThrow(
			/Scheibe.*#123456|#123456.*Scheibe/,
		)
	})

	it('strips every id from the output', () => {
		const moduleSource = transformIllustrationSvg(FIXTURE_SVG, 'Testviertel')

		expect(moduleSource).not.toMatch(/\sid="/)
	})
})
