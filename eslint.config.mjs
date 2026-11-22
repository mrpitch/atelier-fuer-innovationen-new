import { defineConfig, globalIgnores } from 'eslint/config'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// Flat config doesn't merge two blocks that configure the same rule for one file: the later
// block's options replace the earlier one's. A per-file override that disables one check's
// restrictions would silently disable another check's restrictions on the same rule too. So
// each restriction check gets the core `no-restricted-imports` or `no-restricted-syntax` rule
// under its own name here, and configures only its own instance below. The next check that
// needs to restrict imports or syntax adds its own instance rather than extending an existing
// one. The `*-classes` instances are better-tailwindcss's `no-restricted-classes` rule: each one
// checks the classes in `className`, `cn()` and `cva()` for one Kartei token rule.
const noRestrictedClasses = betterTailwindcss.rules['no-restricted-classes']
const restrictions = {
	rules: {
		'icon-registry-imports': builtinRules.get('no-restricted-imports'),
		'base-ui-imports': builtinRules.get('no-restricted-imports'),
		'base-ui-subpath-imports': builtinRules.get('no-restricted-imports'),
		'cn-package-imports': builtinRules.get('no-restricted-imports'),
		'cn-alias-imports': builtinRules.get('no-restricted-imports'),
		'relative-parent-imports': builtinRules.get('no-restricted-imports'),
		'global-css-imports': builtinRules.get('no-restricted-imports'),
		'legacy-ref-api': builtinRules.get('no-restricted-syntax'),
		'as-child-prop': builtinRules.get('no-restricted-syntax'),
		'button-anchor-render': builtinRules.get('no-restricted-syntax'),
		'html-attributes-props': builtinRules.get('no-restricted-syntax'),
		'default-exports': builtinRules.get('no-restricted-syntax'),
		'component-export-declarations': builtinRules.get('no-restricted-syntax'),
		'template-literal-classnames': builtinRules.get('no-restricted-syntax'),
		'font-variables-on-html': builtinRules.get('no-restricted-syntax'),
		'unmeasured-memoization': builtinRules.get('no-restricted-syntax'),
		'inline-jsx-handlers': builtinRules.get('no-restricted-syntax'),
		'multiple-exports-per-file': builtinRules.get('no-restricted-syntax'),
		'multiple-component-exports-per-file': builtinRules.get('no-restricted-syntax'),
		'next-headers-imports': builtinRules.get('no-restricted-imports'),
		'server-actions-syntax': builtinRules.get('no-restricted-syntax'),
		'revalidate-syntax': builtinRules.get('no-restricted-syntax'),
		'dynamic-params-syntax': builtinRules.get('no-restricted-syntax'),
		'use-client-route-syntax': builtinRules.get('no-restricted-syntax'),
		'static-export-config-syntax': builtinRules.get('no-restricted-syntax'),
		'palette-color-classes': noRestrictedClasses,
		'arbitrary-color-classes': noRestrictedClasses,
		'arbitrary-radius-classes': noRestrictedClasses,
		'arbitrary-font-classes': noRestrictedClasses,
		'arbitrary-size-classes': noRestrictedClasses,
		'signal-text-classes': noRestrictedClasses,
		'desktop-first-classes': noRestrictedClasses,
		'dark-variant-classes': noRestrictedClasses,
		'unnamed-group-classes': noRestrictedClasses,
	},
}

// Class patterns are regular expressions matched against each whole class, variants included
// (`md:hover:text-white`). `(?:^|:)` anchors on the start of the class or a variant boundary, so
// `max-w-sm` and `data-[size=sm]:h-8` stay out of reach.
const colorUtility =
	'(?:text|bg|border(?:-[xytrblse])?|ring|ring-offset|outline|divide|accent|caret|fill|stroke|shadow|inset-shadow|inset-ring|drop-shadow|from|via|to|decoration)'
const paletteColor =
	'(?:black|white|(?:slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3})'
const sizeUtility =
	'(?:p[xytrbles]?|m[xytrbles]?|gap(?:-[xy])?|space-[xy]|size|w|h|min-[wh]|max-[wh]|inset(?:-[xy])?|top|right|bottom|left|start|end|basis)'

const noTemplateLiteralClassNamesMessage =
	'Tailwind finds classes by scanning source text, so a template literal never reaches the CSS. Map values to complete class names instead. See docs/reference/css/tailwind-conventions.md.'

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
		// Component and file conventions (react-component-conventions.md, component-blueprint.md,
		// folder-structure.md, tailwind-conventions.md, theme-system.md, font-system.md), everywhere
		// in src/. Installed shadcn primitives and Pro Blocks are owned by the repo and follow the
		// same blueprint, so they're in scope too.
		files: ['src/**/*.{ts,tsx}'],
		rules: {
			'func-style': ['error', 'declaration'],

			// Kartei tokens (design-tokens.md, tailwind-conventions.md), everywhere in src/:
			// installed shadcn primitives and Pro Blocks are owned by the repo and follow them.
			'restrictions/palette-color-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?${colorUtility}-${paletteColor}(?:/[^:]*)?!?$`,
							message:
								'Palette colours bypass the theme and break dark mode. Use a token utility such as bg-card, text-foreground or text-muted-foreground. See docs/reference/css/design-tokens.md.',
						},
					],
				},
			],

			'restrictions/arbitrary-color-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?${colorUtility}-\\[(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\\(|color:)`,
							message:
								'Arbitrary colours bypass the theme and break dark mode. Use a token utility such as bg-primary or text-muted-foreground. See docs/reference/css/design-tokens.md.',
						},
					],
				},
			],

			'restrictions/arbitrary-radius-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)!?rounded(?:-(?:s|e|t|r|b|l|ss|se|ee|es|tl|tr|br|bl))?-\\[',
							message:
								'Arbitrary radii bypass the theme. Use the radius scale: rounded-sm, rounded-lg (4px), rounded-xl (8px) or rounded-none. See docs/reference/css/design-tokens.md.',
						},
					],
				},
			],

			'restrictions/arbitrary-font-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)!?font-\\[(?!\\d|number:|var\\()',
							message:
								'Arbitrary font families bypass the theme. Use font-sans, font-serif, font-mono or font-heading. See docs/reference/css/font-system.md.',
						},
					],
				},
			],

			'restrictions/arbitrary-size-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?-?${sizeUtility}-\\[`,
							message:
								'Use the 4px spacing scale: p-3 is 12px, w-24 is 96px. A measured one-off, such as the 416 × 340px Stadtplan tile, gets an eslint-disable comment that states the measurement. See docs/reference/css/design-tokens.md.',
						},
					],
				},
			],

			'restrictions/signal-text-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)!?text-signal(?:/[^:]*)?!?$',
							message:
								'Koralle has 3.4:1 contrast on Archivstein, so signal never colours text. Use text-foreground, text-muted-foreground or text-accent-foreground, and keep bg-signal for the "Sie sind hier" marker. See docs/reference/css/design-tokens.md.',
						},
					],
				},
			],

			'restrictions/desktop-first-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)max-(?:[a-z0-9]+|\\[[^\\]]*\\])(?:/[a-z0-9-]+)?:',
							message:
								'Write the mobile layout as unprefixed classes and add to it with sm:, md: or lg:. There are no max-* variants. See docs/reference/css/tailwind-conventions.md.',
						},
					],
				},
			],

			// Component blueprint: React 19 passes `ref` as a prop.
			'restrictions/legacy-ref-api': [
				'error',
				{
					selector:
						"CallExpression[callee.name='forwardRef'], CallExpression[callee.object.name='React'][callee.property.name='forwardRef']",
					message:
						'React 19 passes `ref` as a prop; there is no forwardRef. See docs/reference/components/component-blueprint.md.',
				},
				{
					selector: "AssignmentExpression[left.property.name='displayName']",
					message:
						'Named function declarations already carry a name; there is no displayName. See docs/reference/components/component-blueprint.md.',
				},
			],

			'restrictions/as-child-prop': [
				'error',
				{
					selector: "JSXAttribute[name.name='asChild']",
					message:
						"There is no asChild. Compose through Base UI's render prop instead. See docs/reference/components/component-blueprint.md.",
				},
			],

			'restrictions/base-ui-subpath-imports': [
				'error',
				{
					paths: [
						{
							name: '@base-ui/react',
							message:
								"Import a Base UI primitive from its own subpath, e.g. '@base-ui/react/dialog', never the package root. See docs/reference/components/component-blueprint.md.",
						},
					],
				},
			],

			'restrictions/button-anchor-render': [
				'error',
				{
					selector:
						"JSXElement[openingElement.name.name='Button'] > JSXOpeningElement > JSXAttribute[name.name='render'] JSXElement[openingElement.name.name=/^(a|Link)$/]",
					message:
						'A link styled as a button is a Link with buttonVariants() classes; <Button render={<a />}> or render={<Link />} gives the anchor role="button" instead. See docs/reference/components/component-blueprint.md.',
				},
			],

			'restrictions/html-attributes-props': [
				'error',
				{
					selector:
						'TSTypeReference > TSQualifiedName[right.name=/HTMLAttributes$/], TSTypeReference > Identifier[name=/HTMLAttributes$/], TSInterfaceHeritage > MemberExpression[property.name=/HTMLAttributes$/], TSInterfaceHeritage > Identifier[name=/HTMLAttributes$/]',
					message:
						"Derive props from React.ComponentProps<'element'> or the primitive's own props type instead of a *HTMLAttributes type. See docs/reference/components/component-blueprint.md.",
				},
			],

			'restrictions/default-exports': [
				'error',
				{
					selector: 'ExportDefaultDeclaration, ExportSpecifier[exported.name="default"]',
					message:
						'Named exports only here; default exports are reserved for Next.js route files (page, layout, not-found, …). See docs/reference/global/folder-structure.md.',
				},
			],

			'restrictions/relative-parent-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^\\.\\.(/|$)',
							message:
								'Import through the @/ alias instead of a parent-relative path. See docs/reference/global/folder-structure.md.',
						},
					],
				},
			],

			'restrictions/cn-package-imports': [
				'error',
				{
					paths: [
						{
							name: 'clsx',
							message:
								"Use cn() from the 'cn' package instead of clsx. See docs/reference/css/tailwind-conventions.md.",
						},
						{
							name: 'tailwind-merge',
							message:
								"Use cn() from the 'cn' package instead of tailwind-merge. See docs/reference/css/tailwind-conventions.md.",
						},
					],
				},
			],

			'restrictions/cn-alias-imports': [
				'error',
				{
					paths: [
						{
							name: '@/lib/utils/cn',
							message:
								"Import cn from the 'cn' package directly; @/lib/utils/cn is the registry alias Pro Blocks installs use. See docs/reference/global/folder-structure.md.",
						},
					],
				},
			],

			'restrictions/global-css-imports': [
				'error',
				{
					patterns: [
						{
							regex: '(?<!\\.module)\\.css$',
							message:
								'Only the root layout imports global CSS. See docs/reference/css/theme-system.md.',
						},
					],
				},
			],

			'restrictions/template-literal-classnames': [
				'error',
				{
					selector:
						"JSXAttribute[name.name='className'] TemplateLiteral, CallExpression[callee.name='cn'] TemplateLiteral, CallExpression[callee.name='cva'] TemplateLiteral",
					message: noTemplateLiteralClassNamesMessage,
				},
			],

			'restrictions/font-variables-on-html': [
				'error',
				{
					selector:
						"JSXOpeningElement[name.name='html'] JSXAttribute[name.name='className'] MemberExpression[property.name='variable']",
					message:
						'next/font variable classes go on <body>, never <html>: theme.css maps --font-sans: var(--font-sans) and Tailwind also writes that self-reference to :root, so on <html> it would compete with the next/font class at equal specificity and only the order of the CSS chunks would decide which wins. On <body> the class always wins. See docs/reference/css/font-system.md.',
				},
			],
		},
	},
	{
		// Next.js file conventions: https://nextjs.org/docs/app/api-reference/file-conventions.
		files: [
			'src/app/**/{page,layout,template,loading,error,global-error,not-found,global-not-found,forbidden,unauthorized,default,route,sitemap,robots,manifest,opengraph-image,twitter-image,icon,apple-icon}.{ts,tsx}',
		],
		rules: { 'restrictions/default-exports': 'off' },
	},
	{
		// In src/components/, exports sit in one export list at the bottom of the file, never on
		// a declaration.
		files: ['src/components/**/*.{ts,tsx}'],
		rules: {
			'restrictions/component-export-declarations': [
				'error',
				{
					selector: 'ExportNamedDeclaration[declaration]',
					message:
						'Export from one list at the bottom of the file instead: export { Name }. See docs/reference/components/component-blueprint.md.',
				},
				{
					selector:
						'ExportNamedDeclaration:not([declaration]):not([source]) ~ ExportNamedDeclaration:not([source])',
					message:
						'Export from one list at the bottom of the file: merge this into the existing export { … } list. See docs/reference/components/component-blueprint.md.',
				},
				{
					selector: 'ExportNamedDeclaration:not([declaration]) ~ :not(ExportNamedDeclaration)',
					message:
						'The export { … } list goes at the bottom of the file, after every declaration. See docs/reference/components/component-blueprint.md.',
				},
			],
		},
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
		files: ['src/app/layout.tsx'],
		rules: { 'restrictions/global-css-imports': 'off' },
	},
	{
		files: ['src/components/pro-blocks/**/*.{ts,tsx}'],
		rules: { 'restrictions/cn-alias-imports': 'off' },
	},
	{
		// Project code: everywhere in src/ except the installed shadcn primitives and Pro Blocks,
		// which keep the conventions of the upstream source they were copied from.
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/components/ui/**', 'src/components/pro-blocks/**'],
		rules: {
			// Only for a measured performance problem (react-component-conventions.md); disabling
			// this rule for the line is how that measurement gets written down.
			'restrictions/unmeasured-memoization': [
				'error',
				{
					selector:
						"CallExpression[callee.name=/^(useMemo|useCallback|memo)$/], MemberExpression[object.name='React'][property.name=/^(useMemo|useCallback|memo)$/]",
					message:
						'useMemo, useCallback and memo are only for a measured performance problem. Disable this rule for the line with a comment stating what was measured. See docs/reference/react/react-component-conventions.md.',
				},
			],

			// Handler naming on the extracted function; this rule only flags inline arrows.
			'restrictions/inline-jsx-handlers': [
				'error',
				{
					selector:
						'JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > ArrowFunctionExpression',
					message:
						'Define a handle… function in the component body and pass it by reference instead of an inline arrow on an on* prop. See docs/reference/react/react-component-conventions.md.',
				},
			],

			'react/jsx-handler-names': ['error', { checkLocalVariables: true }],
			'react/no-array-index-key': 'error',

			'restrictions/dark-variant-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:|not-)dark:',
							message:
								'Tokens switch with the theme, so dark: is unused. Use a token utility, or disable this rule for the line with a comment saying why no token covers the difference. See docs/reference/css/theme-system.md.',
						},
					],
				},
			],

			'restrictions/unnamed-group-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '^(?:group|peer)$',
							message:
								'Name the group or peer, e.g. group/button, so nested groups stay apart. See docs/reference/css/tailwind-conventions.md.',
						},
						{
							pattern: '(?:^|:|not-)(?:group|peer)-(?:[^:/\\[]|\\[[^\\]]*\\])+:',
							message:
								'Name the group or peer in its variants too, e.g. group-hover/button:, and on the element, e.g. group/button. See docs/reference/css/tailwind-conventions.md.',
						},
					],
				},
			],
		},
	},
	{
		// One export per file in src/lib/utils/: a plain function, no variants helper riding
		// along with it the way a component does.
		files: ['src/lib/utils/**/*.{ts,tsx}'],
		rules: {
			'restrictions/multiple-exports-per-file': [
				'error',
				{
					selector: 'ExportNamedDeclaration ~ ExportNamedDeclaration',
					message:
						'One export per file here. Split the extra export into its own file. See docs/reference/global/folder-structure.md.',
				},
				{
					selector: 'ExportSpecifier ~ ExportSpecifier',
					message:
						'One export per file here. Split the extra export into its own file. See docs/reference/global/folder-structure.md.',
				},
			],
		},
	},
	{
		// One exported component per file in feature folders. Compound primitives such as
		// dialog.tsx export many parts, so ui/ (and pro-blocks/, which follows the same
		// installed-primitive shape) are exempt. A component export is PascalCase; a component
		// may still export a lowercase `…Variants` helper alongside it (component-blueprint.md),
		// so only a second PascalCase export counts as a second component.
		files: ['src/components/**/*.{ts,tsx}'],
		ignores: ['src/components/ui/**', 'src/components/pro-blocks/**'],
		rules: {
			'restrictions/multiple-component-exports-per-file': [
				'error',
				{
					selector:
						'ExportNamedDeclaration[declaration.id.name=/^[A-Z]/] ~ ExportNamedDeclaration[declaration.id.name=/^[A-Z]/]',
					message:
						'One exported component per file here. Split the extra component into its own file. See docs/reference/global/folder-structure.md.',
				},
				{
					selector:
						'ExportNamedDeclaration[exportKind="value"] > ExportSpecifier[exportKind="value"][exported.name=/^[A-Z]/] ~ ExportSpecifier[exportKind="value"][exported.name=/^[A-Z]/]',
					message:
						'One exported component per file here. Split the extra component into its own file. See docs/reference/global/folder-structure.md.',
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
])

export default eslintConfig
