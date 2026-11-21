import { defineConfig, globalIgnores } from 'eslint/config'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
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
	},
}

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
			// Component blueprint: React 19 passes `ref` as a prop.
			'func-style': ['error', 'declaration', { allowArrowFunctions: false }],

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
						'TSTypeReference > TSQualifiedName[right.name=/HTMLAttributes$/], TSTypeReference > Identifier[name=/HTMLAttributes$/]',
					message:
						"Derive props from React.ComponentProps<'element'> or the primitive's own props type instead of a *HTMLAttributes type. See docs/reference/components/component-blueprint.md.",
				},
			],

			'restrictions/default-exports': [
				'error',
				{
					selector: 'ExportDefaultDeclaration',
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
							regex: '(^|/)globals\\.css$',
							message:
								'Only the root layout imports global CSS. See docs/reference/css/theme-system.md.',
						},
					],
				},
			],

			'restrictions/template-literal-classnames': [
				'error',
				{
					selector: "JSXAttribute[name.name='className'] TemplateLiteral",
					message: noTemplateLiteralClassNamesMessage,
				},
				{
					selector:
						"CallExpression[callee.name='cn'] TemplateLiteral, CallExpression[callee.name='cva'] TemplateLiteral",
					message: noTemplateLiteralClassNamesMessage,
				},
			],

			'restrictions/font-variables-on-html': [
				'error',
				{
					selector:
						"JSXOpeningElement[name.name='html'] JSXAttribute[name.name='className'] MemberExpression[property.name='variable']",
					message:
						'next/font variable classes go on <body>, never <html>: on <html> the class would compete with the next/font class at equal specificity, and only the order of the CSS chunks would decide which wins. See docs/reference/css/font-system.md.',
				},
			],
		},
	},
	{
		// Next.js file conventions: https://nextjs.org/docs/app/api-reference/file-conventions.
		files: [
			'src/app/**/{page,layout,template,loading,error,global-error,not-found,default,route,sitemap,robots,manifest,opengraph-image,twitter-image,icon,apple-icon}.{ts,tsx}',
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
						"ImportDeclaration[source.value='react'] ImportSpecifier[imported.name=/^(useMemo|useCallback|memo)$/]",
					message:
						'useMemo, useCallback and memo are only for a measured performance problem. Disable this rule for the line with a comment stating what was measured. See docs/reference/react/react-component-conventions.md.',
				},
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
			'restrictions/multiple-exports-per-file': [
				'error',
				{
					selector:
						'ExportNamedDeclaration[declaration.id.name=/^[A-Z]/] ~ ExportNamedDeclaration[declaration.id.name=/^[A-Z]/]',
					message:
						'One exported component per file here. Split the extra component into its own file. See docs/reference/global/folder-structure.md.',
				},
				{
					selector:
						'ExportSpecifier[exported.name=/^[A-Z]/] ~ ExportSpecifier[exported.name=/^[A-Z]/]',
					message:
						'One exported component per file here. Split the extra component into its own file. See docs/reference/global/folder-structure.md.',
				},
			],
		},
	},
])

export default eslintConfig
