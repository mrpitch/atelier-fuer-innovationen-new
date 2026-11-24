import { describe, expect, it } from 'vitest'

import { transformIllustrationSvg } from './illustration-transform'

// Shaped like a real Figma `/v1/images` export (annaeherung.svg, fetched by
// hand for issue #88): a parent section's background and border sit beside
// the `Illustration / …` group, hex fills and strokes covering all seven
// tokens, `white`, and `id` on every node.
const FIXTURE_SVG = `<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect id="Section-Hintergrund" width="240" height="240" fill="#FBFAF7"/>
<rect id="Section-Rahmen" width="240" height="240" stroke="#D6D1C5"/>
<g id="Illustration / Viertel / Testviertel">
<path id="Scheibe" d="M0 0H10V10H0Z" fill="#DCEBE9"/>
<path id="Pfeiler" d="M1 1H2V2H1Z" fill="#00676B" stroke="#1F2421" stroke-width="2"/>
<path id="Bodenlinie" d="M0 20H20" stroke-width="2" stroke="#1F2421"/>
<path id="Lichtkante" d="M2 2H4" stroke="white"/>
<path id="Fenster" d="M5 5H6V6H5Z" fill="#FBFAF7" stroke="#D6D1C5"/>
<path id="Ferne" d="M8 8H9" stroke="#3D5A80"/>
</g>
</svg>
`

describe('transformIllustrationSvg', () => {
	it('keeps only the Illustration group, dropping the parent section background and border', () => {
		const { source } = transformIllustrationSvg(FIXTURE_SVG, 'stadt/testviertel')

		expect(source).not.toContain('Section-Hintergrund')
		expect(source).not.toContain('Section-Rahmen')
		expect(source).toContain('d="M1 1H2V2H1Z"')
	})

	it('maps every one of the seven tokens to its token class', () => {
		const { source } = transformIllustrationSvg(FIXTURE_SVG, 'stadt/testviertel')

		expect(source).toContain('className="fill-secondary"') // #DCEBE9
		expect(source).toContain('className="fill-primary stroke-foreground"') // #00676B / #1F2421
		expect(source).toContain('className="stroke-foreground"') // #1F2421
		expect(source).toContain('className="stroke-primary-foreground"') // white
		expect(source).toContain('className="fill-card stroke-border"') // #FBFAF7 / #D6D1C5
		expect(source).toContain('className="stroke-chart-4"') // #3D5A80
	})

	it('maps fill and stroke on the same path to both classes, in fill-then-stroke order', () => {
		const { source } = transformIllustrationSvg(FIXTURE_SVG, 'stadt/testviertel')

		expect(source).toContain(
			'd="M1 1H2V2H1Z" strokeWidth="2" className="fill-primary stroke-foreground"',
		)
	})

	it('throws naming the node and the value for an unknown colour', () => {
		const svgWithUnknownColor = FIXTURE_SVG.replace('#DCEBE9', '#123456')

		expect(() => transformIllustrationSvg(svgWithUnknownColor, 'stadt/testviertel')).toThrow(
			/Scheibe.*#123456|#123456.*Scheibe/,
		)
	})

	it('strips every id from the output', () => {
		const { source } = transformIllustrationSvg(FIXTURE_SVG, 'stadt/testviertel')

		expect(source).not.toMatch(/\sid="/)
	})

	it('names the module after the content ID, not the Figma layer', () => {
		const { name, slug, source } = transformIllustrationSvg(
			FIXTURE_SVG,
			'stadt/maerkte-kooperation',
		)

		expect(name).toBe('MaerkteKooperation')
		expect(slug).toBe('maerkte-kooperation')
		expect(source).toContain('function MaerkteKooperation(')
		expect(source).toContain('data-slot="illustration-maerkte-kooperation"')
		expect(source).toContain('export { MaerkteKooperation }')
		expect(source).not.toContain('Testviertel')
	})

	it('writes a test that imports the module and its shared token assertion', () => {
		const { testSource } = transformIllustrationSvg(FIXTURE_SVG, 'stadt/maerkte-kooperation')

		expect(testSource).toContain("import { MaerkteKooperation } from './maerkte-kooperation'")
		expect(testSource).toContain("from './expect-token-coloured-svg'")
		expect(testSource).toContain('data-slot="illustration-maerkte-kooperation"')
	})

	it('throws naming the content ID when it does not end in a kebab-case slug', () => {
		expect(() => transformIllustrationSvg(FIXTURE_SVG, 'stadt/Märkte')).toThrow(/stadt\/Märkte/)
	})
})
