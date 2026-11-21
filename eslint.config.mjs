import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

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
		plugins: { 'simple-import-sort': simpleImportSort },
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

			// shadcn and Pro Blocks installs import lucide-react directly; swap those imports
			// for the registry as part of each install. Primitives come from Base UI (style
			// base-nova), so Radix code copied from elsewhere fails here instead of mixing in.
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'lucide-react',
							message:
								'Render icons with <Icon iconName="..." /> from @/components/ui/icons. See docs/reference/components/icon-registry.md.',
						},
					],
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
		rules: { 'no-restricted-imports': 'off' },
	},
])

export default eslintConfig
