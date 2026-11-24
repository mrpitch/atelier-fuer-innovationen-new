import { expect } from 'vitest'

const TOKEN_CLASS =
	/^(?:fill|stroke)-(?:secondary|foreground|card|primary|chart-4|border|primary-foreground)$/

// The contract every drawing shares: an accessible 240 × 240 svg whose colours
// all come from design-token classes, with no ids and no literal colours.
function expectTokenColouredSvg(html: string) {
	expect(html).toContain('role="img"')
	expect(html).toContain('viewBox="0 0 240 240"')
	expect(html).not.toMatch(/\sid="/)
	expect(html).not.toMatch(/(?:fill|stroke)="(?:#|white)/i)

	const classAttributes = [...html.matchAll(/class="([^"]+)"/g)]
	expect(classAttributes.length).toBeGreaterThan(0)
	for (const [, classValue] of classAttributes) {
		for (const className of classValue!.split(' ')) {
			expect(className).toMatch(TOKEN_CLASS)
		}
	}
}

export { expectTokenColouredSvg }
