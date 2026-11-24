import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// Exercises the content-graph boundary restrictions (issue #55) through ESLint's own API against
// virtual files, rather than real fixture files that `pnpm lint` would also pick up and fail on.
const eslint = new ESLint({ cwd: process.cwd() })

async function ruleIdsFor(code: string, filePath: string): Promise<(string | null)[]> {
	const [result] = await eslint.lintText(code, { filePath })
	return result.messages.map((message) => message.ruleId)
}

describe('content-graph boundaries', () => {
	it('fails fs access outside src/lib/content', async () => {
		const ruleIds = await ruleIdsFor(
			`import fs from 'node:fs'\nconsole.log(fs)\n`,
			'src/app/foo.ts',
		)
		expect(ruleIds).toContain('restrictions/content-fs-imports')
	})

	it('passes fs access inside src/lib/content', async () => {
		const ruleIds = await ruleIdsFor(
			`import fs from 'node:fs'\nconsole.log(fs)\n`,
			'src/lib/content/foo.ts',
		)
		expect(ruleIds).not.toContain('restrictions/content-fs-imports')
	})

	it('fails a static import from src/content outside the module', async () => {
		const ruleIds = await ruleIdsFor(
			`import Body from '@/content/index.mdx'\nconsole.log(Body)\n`,
			'src/app/foo.ts',
		)
		expect(ruleIds).toContain('restrictions/content-module-imports')
	})

	it('passes a static import from src/content inside the module', async () => {
		const ruleIds = await ruleIdsFor(
			`import Body from '@/content/index.mdx'\nconsole.log(Body)\n`,
			'src/lib/content/foo.ts',
		)
		expect(ruleIds).not.toContain('restrictions/content-module-imports')
	})

	it('fails a dynamic import of src/content outside the module, literal or templated', async () => {
		const literal = await ruleIdsFor(
			`const x = import('@/content/stadt/zentrum/index.mdx')\nconsole.log(x)\n`,
			'src/app/foo.ts',
		)
		const templated = await ruleIdsFor(
			"const id = 'a'\nconst x = import(`@/content/${id}/index.mdx`)\nconsole.log(x)\n",
			'src/app/foo.ts',
		)
		expect(literal).toContain('restrictions/content-dynamic-imports')
		expect(templated).toContain('restrictions/content-dynamic-imports')
	})

	it('passes a dynamic import of src/content inside the module', async () => {
		const ruleIds = await ruleIdsFor(
			`const x = import('@/content/stadt/zentrum/index.mdx')\nconsole.log(x)\n`,
			'src/lib/content/foo.ts',
		)
		expect(ruleIds).not.toContain('restrictions/content-dynamic-imports')
	})

	it('fails a deep import of a file inside src/lib/content outside the module', async () => {
		const ruleIds = await ruleIdsFor(
			`import { loadSite } from '@/lib/content/loader'\nconsole.log(loadSite)\n`,
			'src/app/foo.ts',
		)
		expect(ruleIds).toContain('restrictions/lib-domain-deep-imports')
	})

	it('fails a dynamic deep import of a file inside src/lib/content, even from inside the module', async () => {
		const outside = await ruleIdsFor(
			`const x = import('@/lib/content/loader')\nconsole.log(x)\n`,
			'src/app/foo.ts',
		)
		const inside = await ruleIdsFor(
			`const x = import('@/lib/content/loader')\nconsole.log(x)\n`,
			'src/lib/content/foo.ts',
		)
		expect(outside).toContain('restrictions/lib-domain-deep-dynamic-imports')
		expect(inside).toContain('restrictions/lib-domain-deep-dynamic-imports')
	})

	it('fails a deep import of a file inside any src/lib domain folder, dictionary included', async () => {
		const dictionary = await ruleIdsFor(
			`import { t } from '@/lib/dictionary/de'\nconsole.log(t)\n`,
			'src/app/foo.ts',
		)
		const dynamic = await ruleIdsFor(
			`const x = import('@/lib/dictionary/de')\nconsole.log(x)\n`,
			'src/app/foo.ts',
		)
		const nested = await ruleIdsFor(
			`import { x } from '@/lib/some-domain/internal/file'\nconsole.log(x)\n`,
			'src/app/foo.ts',
		)
		expect(dictionary).toContain('restrictions/lib-domain-deep-imports')
		expect(dynamic).toContain('restrictions/lib-domain-deep-dynamic-imports')
		expect(nested).toContain('restrictions/lib-domain-deep-imports')
	})

	it('passes importing a type-based src/lib folder file directly, and a domain folder itself', async () => {
		const utils = await ruleIdsFor(
			`import { formatTwoDigits } from '@/lib/utils/format-two-digits'\nconsole.log(formatTwoDigits)\n`,
			'src/app/foo.ts',
		)
		const dynamicUtils = await ruleIdsFor(
			`const x = import('@/lib/utils/format-two-digits')\nconsole.log(x)\n`,
			'src/app/foo.ts',
		)
		const dictionary = await ruleIdsFor(
			`import { t } from '@/lib/dictionary'\nconsole.log(t)\n`,
			'src/app/foo.ts',
		)
		expect(utils).not.toContain('restrictions/lib-domain-deep-imports')
		expect(dynamicUtils).not.toContain('restrictions/lib-domain-deep-dynamic-imports')
		expect(dictionary).not.toContain('restrictions/lib-domain-deep-imports')
	})

	it('passes importing the content module itself, from outside or inside', async () => {
		const outside = await ruleIdsFor(
			`import { buildContentGraph } from '@/lib/content'\nconsole.log(buildContentGraph)\n`,
			'src/app/foo.ts',
		)
		expect(outside).not.toContain('restrictions/lib-domain-deep-imports')
	})

	it('fails a literal ADR-0003 URL outside the module, string or template', async () => {
		const string = await ruleIdsFor(
			`const url = '/stadt/annaeherung'\nconsole.log(url)\n`,
			'src/app/foo.ts',
		)
		const template = await ruleIdsFor(
			"const id = 'a'\nconst url = `/themen/${id}`\nconsole.log(url)\n",
			'src/app/foo.ts',
		)
		expect(string).toContain('restrictions/content-url-literals')
		expect(template).toContain('restrictions/content-url-literals')
	})

	it('passes the same literal inside the module, e.g. a test assertion', async () => {
		const ruleIds = await ruleIdsFor(
			`const url = '/stadt/zentrum'\nconsole.log(url)\n`,
			'src/lib/content/foo.test.ts',
		)
		expect(ruleIds).not.toContain('restrictions/content-url-literals')
	})

	it("passes a route's literal type, Next's own PageProps shape rather than a hand-written URL", async () => {
		const ruleIds = await ruleIdsFor(
			`function f(x: '/stadt/[viertel]') { return x }\nconsole.log(f)\n`,
			'src/app/foo.ts',
		)
		expect(ruleIds).not.toContain('restrictions/content-url-literals')
	})

	it('fails an href with a literal internal path, "/" included', async () => {
		const root = await ruleIdsFor(
			`const el = <a href="/">x</a>\nconsole.log(el)\n`,
			'src/app/foo.tsx',
		)
		const nested = await ruleIdsFor(
			`const el = <a href="/stadt/annaeherung">x</a>\nconsole.log(el)\n`,
			'src/app/foo.tsx',
		)
		expect(root).toContain('restrictions/content-url-literals')
		expect(nested).toContain('restrictions/content-url-literals')
	})

	it('fails an href with a template-literal internal path outside the module', async () => {
		const ruleIds = await ruleIdsFor(
			"const id = 'a'\nconst el = <a href={`/galerie/${id}`}>x</a>\nconsole.log(el)\n",
			'src/app/foo.tsx',
		)
		expect(ruleIds).toContain('restrictions/content-url-literals')
	})

	it('passes an href with an external URL, a "#" anchor, a mailto: link, or a graph-derived value', async () => {
		const results = await Promise.all(
			['https://example.com', '#top', 'mailto:a@example.com'].map((href) =>
				ruleIdsFor(`const el = <a href="${href}">x</a>\nconsole.log(el)\n`, 'src/app/foo.tsx'),
			),
		)
		for (const ruleIds of results) {
			expect(ruleIds).not.toContain('restrictions/content-url-literals')
		}

		const fromGraph = await ruleIdsFor(
			`declare const url: string\nconst el = <a href={url}>x</a>\nconsole.log(el)\n`,
			'src/app/foo.tsx',
		)
		expect(fromGraph).not.toContain('restrictions/content-url-literals')
	})
})

describe('UI strings', () => {
	const ids = (code: string, file = 'src/components/foo/foo.tsx') => ruleIdsFor(code, file)

	it('fails an inline aria-label', async () => {
		expect(await ids(`export function A() { return <nav aria-label="breadcrumb" /> }\n`)).toContain(
			'restrictions/ui-string-syntax',
		)
	})

	it('fails inline visible text, umlauts included', async () => {
		expect(await ids(`export function A() { return <p>Zurück</p> }\n`)).toContain(
			'restrictions/ui-string-syntax',
		)
	})

	it('passes dictionary text and a test file', async () => {
		expect(await ids(`export function A() { return <p>{t('a.b')}</p> }\n`)).not.toContain(
			'restrictions/ui-string-syntax',
		)
		expect(
			await ids(`export function A() { return <p>Hallo</p> }\n`, 'src/components/foo/foo.test.tsx'),
		).not.toContain('restrictions/ui-string-syntax')
	})
})
