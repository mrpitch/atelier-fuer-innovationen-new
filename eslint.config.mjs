import { defineConfig, globalIgnores } from 'eslint/config'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import * as mdx from 'eslint-plugin-mdx'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// Flat config doesn't merge two blocks that configure the same rule for one file: the later
// block's options replace the earlier one's. A per-file override that disables one check's
// restrictions would silently disable another check's restrictions on the same rule too. So
// each restriction check gets the core `no-restricted-imports` or `no-restricted-syntax` rule
// under its own name here, and configures only its own instance below. The next check that
// needs to restrict imports or syntax adds its own instance rather than extending an existing
// one.
const restrictions = {
	rules: {
		'icon-registry-imports': builtinRules.get('no-restricted-imports'),
		'base-ui-imports': builtinRules.get('no-restricted-imports'),
		'next-headers-imports': builtinRules.get('no-restricted-imports'),
		'server-actions-syntax': builtinRules.get('no-restricted-syntax'),
		'revalidate-syntax': builtinRules.get('no-restricted-syntax'),
		'dynamic-params-syntax': builtinRules.get('no-restricted-syntax'),
		'use-client-route-syntax': builtinRules.get('no-restricted-syntax'),
		'static-export-config-syntax': builtinRules.get('no-restricted-syntax'),
		'content-mdx-import-export': builtinRules.get('no-restricted-syntax'),
	},
}

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
	{
		// The files eslint-config-next registers its plugins for.
		files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
		plugins: { 'simple-import-sort': simpleImportSort, restrictions },
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			// Autofixable: `pnpm lint --fix` or the pre-commit hook sorts them.
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			// Icon registry (icon-registry.md): shadcn and Pro Blocks installs import
			// lucide-react directly; swap those imports for the registry as part of each install.
			'restrictions/icon-registry-imports': [
				'error',
				{
					paths: [
						{
							name: 'lucide-react',
							message:
								'Render icons with <Icon iconName="..." /> from @/components/ui/icons. See docs/reference/components/icon-registry.md.',
						},
					],
				},
			],

			// Component blueprint (component-blueprint.md): primitives come from Base UI (style
			// base-nova), so Radix code copied from elsewhere fails here instead of mixing in.
			'restrictions/base-ui-imports': [
				'error',
				{
					patterns: [
						{
							group: ['radix-ui', '@radix-ui/*'],
							message:
								'shadcn here runs on Base UI: import primitives from @base-ui/react and use the render prop instead of asChild. See docs/reference/components/component-blueprint.md.',
						},
					],
				},
			],

			// Accessibility beyond eslint-config-next's defaults; the site targets WCAG 2.2 AA.
			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/heading-has-content': 'warn',
			'jsx-a11y/label-has-associated-control': 'warn',
			'jsx-a11y/no-noninteractive-element-interactions': 'warn',
			'jsx-a11y/no-redundant-roles': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',

			// Static export (static-export.md): `next/headers` reads the request, which doesn't
			// exist once the site is a build-time export.
			'restrictions/next-headers-imports': [
				'error',
				{
					paths: [
						{
							name: 'next/headers',
							message:
								'Read browser state in a Client Component instead: it needs a server. A preview needs a new build. See docs/reference/react/static-export.md.',
						},
					],
				},
			],

			// Static export (static-export.md): no Server Actions, because the site has no writes.
			'restrictions/server-actions-syntax': [
				'error',
				{
					selector: 'ExpressionStatement[expression.value="use server"]',
					message:
						"'use server' is unused here: there are no Server Actions, because the site has no writes. See docs/reference/react/static-export.md.",
				},
			],

			// Static export (static-export.md): no incremental regeneration; a content change
			// needs a new build.
			'restrictions/revalidate-syntax': [
				'error',
				{
					selector:
						'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="revalidate"]',
					message:
						'`export const revalidate` is unused here: there is no incremental regeneration; a content change needs a new build. See docs/reference/react/static-export.md.',
				},
			],

			// Static export (static-export.md): every dynamic segment exports
			// `generateStaticParams()` from the content graph, so no segment falls back to a
			// server-rendered param at request time.
			'restrictions/dynamic-params-syntax': [
				'error',
				{
					selector:
						'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="dynamicParams"][init.value=true]',
					message:
						'`export const dynamicParams = true` is unused here: every dynamic segment exports `generateStaticParams()` from the content graph. Use `export const dynamicParams = false`. See docs/reference/react/static-export.md.',
				},
			],
		},
	},
	{
		files: ['src/components/ui/icons.tsx'],
		rules: { 'restrictions/icon-registry-imports': 'off' },
	},
	{
		// Static export (static-export.md): `'use client'` on a route's own page or layout file
		// turns the whole route into a Client Component. Put it on the smallest component that
		// needs interaction instead, so the page stays static HTML.
		files: [
			'src/app/**/page.{js,jsx,mjs,ts,tsx,mts,cts}',
			'src/app/**/layout.{js,jsx,mjs,ts,tsx,mts,cts}',
		],
		rules: {
			'restrictions/use-client-route-syntax': [
				'error',
				{
					selector: 'ExpressionStatement[expression.value="use client"]',
					message:
						"'use client' on a route's page or layout makes the whole route a Client Component: put it on the smallest component that needs interaction instead, so the page stays static HTML. See docs/reference/react/static-export.md.",
				},
			],
		},
	},
	{
		// Static export (static-export.md): URLs come from the content graph (ADR-0003), and the
		// host handles redirects, so next.config.ts can't add its own.
		files: ['next.config.{js,mjs,ts,mts}'],
		rules: {
			'restrictions/static-export-config-syntax': [
				'error',
				{
					selector: 'Property[key.name=/^(rewrites|redirects|headers)$/]',
					message:
						'`rewrites`, `redirects` and `headers` in next.config.ts are unused here: URLs come from the content graph (ADR-0003), and the host handles redirects. See docs/reference/react/static-export.md.',
				},
			],
		},
	},
	// Content layer (content-layer.md): lint .mdx with eslint-plugin-mdx. remark-frontmatter is
	// wired up via the `remarkConfig` field in package.json, which eslint-mdx's unified-engine
	// detects automatically — without it, the "---" frontmatter block is misparsed as a heading.
	{
		...mdx.flat,
		files: ['**/*.mdx'],
		processor: mdx.createRemarkProcessor({ lintCodeBlocks: true }),
	},
	{
		...mdx.flatCodeBlocks,
		files: ['**/*.mdx/**'],
	},
	{
		files: ['**/*.mdx'],
		rules: {
			...mdx.native.rules,
		},
	},
	{
		// Content layer (content-layer.md): content MDX only uses the registered component set
		// (passed to the MDX provider), never its own imports or exports.
		files: ['src/content/**/*.mdx'],
		plugins: { restrictions },
		rules: {
			'restrictions/content-mdx-import-export': [
				'error',
				{
					selector: 'ImportDeclaration',
					message:
						'Content MDX has no imports: it can only use the registered component set. See docs/reference/content/content-layer.md.',
				},
				{
					selector: 'ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration',
					message:
						'Content MDX has no exports: it can only use the registered component set. See docs/reference/content/content-layer.md.',
				},
			],
		},
	},
])

export default eslintConfig
