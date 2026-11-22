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
		'content-fs-imports': builtinRules.get('no-restricted-imports'),
		'content-module-imports': builtinRules.get('no-restricted-imports'),
		'content-graph-deep-imports': builtinRules.get('no-restricted-imports'),
		'content-graph-deep-dynamic-imports': builtinRules.get('no-restricted-syntax'),
		'content-dynamic-imports': builtinRules.get('no-restricted-syntax'),
		'content-url-literals': builtinRules.get('no-restricted-syntax'),
	},
}

// Content-graph boundaries (issue #55): only src/lib/content/ reads content (About the
// architecture, ADR-0003) — everywhere else in src/ asks the graph instead of touching the file
// system, src/content or a file inside the module directly. Shared messages, since several
// selectors below report the same violation.
const CONTENT_MODULE_MESSAGE =
	'Only src/lib/content/ reads content, static or dynamic import alike. Import @/lib/content instead. See docs/explanation/about-architecture.md.'
const CONTENT_FS_MESSAGE =
	'File system access belongs in src/lib/content/, the one module that reads content. See docs/explanation/about-architecture.md.'
const CONTENT_DEEP_IMPORT_MESSAGE =
	'Import from @/lib/content, never a file inside it. See docs/reference/global/folder-structure.md.'
const CONTENT_URL_MESSAGE =
	"URLs come from the content graph's per-type rule (ADR-0003), not a hand-built path. Ask @/lib/content for the link instead."
const CONTENT_HREF_MESSAGE =
	'href takes a URL from the content graph (ADR-0003), not a hand-built internal path. Ask @/lib/content for the link instead.'

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
		// Content-graph boundaries (issue #55): only src/lib/content/ reads content (About the
		// architecture, ADR-0003). Scoped to src/ (not the repo-wide glob above) because
		// scripts/, which runs under plain Node outside the bundle, reads files and the content
		// graph by its own convention (content-layer.md) and isn't part of this boundary.
		files: ['src/**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
		plugins: { restrictions },
		rules: {
			'restrictions/content-fs-imports': [
				'error',
				{
					paths: [
						{ name: 'fs', message: CONTENT_FS_MESSAGE },
						{ name: 'node:fs', message: CONTENT_FS_MESSAGE },
						{ name: 'fs/promises', message: CONTENT_FS_MESSAGE },
						{ name: 'node:fs/promises', message: CONTENT_FS_MESSAGE },
					],
				},
			],

			'restrictions/content-module-imports': [
				'error',
				{
					paths: [{ name: '@/content', message: CONTENT_MODULE_MESSAGE }],
					patterns: [{ group: ['@/content/*'], message: CONTENT_MODULE_MESSAGE }],
				},
			],

			// `no-restricted-imports` only checks static `import`/`require`; the content module's
			// own MDX-body loading (graph.ts) uses dynamic `import()`, so that needs its own
			// `no-restricted-syntax` selectors to catch the same `@/content` boundary.
			'restrictions/content-dynamic-imports': [
				'error',
				{
					selector: 'ImportExpression[source.value=/^@\\/content(\\/|$)/]',
					message: CONTENT_MODULE_MESSAGE,
				},
				{
					selector:
						'ImportExpression > TemplateLiteral > TemplateElement:first-child[value.raw=/^@\\/content\\//]',
					message: CONTENT_MODULE_MESSAGE,
				},
			],

			// Folder structure (folder-structure.md): a domain folder's index.ts is its public
			// API; consumers import `@/lib/content`, never a file inside it. A separate rule name
			// from the deep *static* import below (not just a second selector on it), even though
			// both report the same message: nothing inside src/lib/content legitimately needs a
			// deep import of itself, static or dynamic, so unlike `content-dynamic-imports` this
			// one has no `src/lib/content/**` override to protect from accidentally disabling.
			'restrictions/content-graph-deep-dynamic-imports': [
				'error',
				{
					selector: 'ImportExpression[source.value=/^@\\/lib\\/content\\//]',
					message: CONTENT_DEEP_IMPORT_MESSAGE,
				},
			],

			'restrictions/content-graph-deep-imports': [
				'error',
				{
					patterns: [{ group: ['@/lib/content/*'], message: CONTENT_DEEP_IMPORT_MESSAGE }],
				},
			],

			// ADR-0003: a string or template literal that starts with a content-graph URL prefix,
			// and any literal internal path in an `href` (`/` included), are hand-built URLs. The
			// `:not(TSLiteralType > Literal)` guard excludes a type position such as
			// `PageProps<'/stadt/[viertel]'>`, which Next generates from the route's file path, not
			// a literal a caller wrote to link somewhere.
			'restrictions/content-url-literals': [
				'error',
				{
					selector:
						'Literal[value=/^\\/(stadt|rundgaenge|themen|bibliothek)\\//]:not(TSLiteralType > Literal)',
					message: CONTENT_URL_MESSAGE,
				},
				{
					selector:
						'TemplateElement:first-child[value.raw=/^\\/(stadt|rundgaenge|themen|bibliothek)\\//]',
					message: CONTENT_URL_MESSAGE,
				},
				{
					selector: 'JSXAttribute[name.name="href"] > Literal[value=/^\\/(?!\\/)/]',
					message: CONTENT_HREF_MESSAGE,
				},
				{
					selector:
						'JSXAttribute[name.name="href"] > JSXExpressionContainer > TemplateLiteral > TemplateElement:first-child[value.raw=/^\\/(?!\\/)/]',
					message: CONTENT_HREF_MESSAGE,
				},
			],
		},
	},
	{
		// The module itself reads content, builds URLs and loads MDX bodies; the restrictions
		// above guard everywhere else in src/ (issue #55).
		files: ['src/lib/content/**'],
		rules: {
			'restrictions/content-fs-imports': 'off',
			'restrictions/content-module-imports': 'off',
			'restrictions/content-dynamic-imports': 'off',
			'restrictions/content-url-literals': 'off',
		},
	},
	{
		files: ['src/components/ui/icons.tsx'],
		rules: { 'restrictions/icon-registry-imports': 'off' },
	},
	{
		// Body images (content-layer.md, issue #35): a body image's dimensions
		// are unknown and optimization is off anyway (static export), so this
		// is the one place a plain <img> is correct instead of next/image.
		files: ['src/components/content/body-image.tsx'],
		rules: { '@next/next/no-img-element': 'off' },
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
