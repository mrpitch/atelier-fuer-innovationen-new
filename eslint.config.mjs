import { defineConfig, globalIgnores } from 'eslint/config'
import { builtinRules } from 'eslint/use-at-your-own-risk'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import * as mdx from 'eslint-plugin-mdx'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// The docs the lint messages point to, so moving a doc is a one-line change here.
const DOC = {
	aboutArchitecture: 'docs/explanation/about-architecture.md',
	componentBlueprint: 'docs/reference/components/component-blueprint.md',
	contentLayer: 'docs/reference/content/content-layer.md',
	dictionary: 'docs/reference/i18n/dictionary.md',
	folderStructure: 'docs/reference/global/folder-structure.md',
	fontSystem: 'docs/reference/design/font-system.md',
	iconRegistry: 'docs/reference/components/icon-registry.md',
	karteiDesignSystem: 'docs/reference/design/kartei-design-system.md',
	staticExport: 'docs/reference/react/static-export.md',
	tailwindConventions: 'docs/reference/design/tailwind-conventions.md',
	themeSystem: 'docs/reference/design/theme-system.md',
}

// Flat config doesn't merge two blocks that configure the same rule for one file: the later
// block's options replace the earlier one's. A per-file override that disables one check's
// restrictions would silently disable another check's restrictions on the same rule too. So
// each restriction check gets the core `no-restricted-imports` or `no-restricted-syntax` rule
// under its own name here, and configures only its own instance below. The next check that
// needs to restrict imports or syntax adds its own instance rather than extending an existing
// one. An instance's name ends in what it restricts: `-imports` or `-syntax`. The `*-classes`
// instances are better-tailwindcss's `no-restricted-classes` rule: each one checks the classes
// in `className`, `cn()` and `cva()` for one Kartei class rule.
const noRestrictedClasses = betterTailwindcss.rules['no-restricted-classes']

// `no-array-index-key` from eslint-plugin-react, which eslint-config-next loads, with its message
// replaced: the plugin's text doesn't say what to use as the key, and config can't change it.
const reactNoArrayIndexKey = nextVitals.find((config) => config.plugins?.react).plugins.react.rules[
	'no-array-index-key'
]
const noArrayIndexKey = {
	...reactNoArrayIndexKey,
	meta: {
		...reactNoArrayIndexKey.meta,
		messages: {
			noArrayIndex:
				"Key list items by a stable id from the data, such as a slug or the item's own id, not by array index.",
		},
	},
}

const restrictions = {
	rules: {
		'icon-registry-imports': builtinRules.get('no-restricted-imports'),
		'base-ui-imports': builtinRules.get('no-restricted-imports'),
		'base-ui-subpath-imports': builtinRules.get('no-restricted-imports'),
		'cn-package-imports': builtinRules.get('no-restricted-imports'),
		'cn-alias-imports': builtinRules.get('no-restricted-imports'),
		'relative-imports': builtinRules.get('no-restricted-imports'),
		'global-css-imports': builtinRules.get('no-restricted-imports'),
		'legacy-ref-syntax': builtinRules.get('no-restricted-syntax'),
		'as-child-syntax': builtinRules.get('no-restricted-syntax'),
		'button-anchor-syntax': builtinRules.get('no-restricted-syntax'),
		'html-attributes-syntax': builtinRules.get('no-restricted-syntax'),
		'ui-string-syntax': builtinRules.get('no-restricted-syntax'),
		'default-exports-syntax': builtinRules.get('no-restricted-syntax'),
		'component-export-syntax': builtinRules.get('no-restricted-syntax'),
		'template-literal-syntax': builtinRules.get('no-restricted-syntax'),
		'font-variables-syntax': builtinRules.get('no-restricted-syntax'),
		'memoization-syntax': builtinRules.get('no-restricted-syntax'),
		'inline-handlers-syntax': builtinRules.get('no-restricted-syntax'),
		'multiple-exports-syntax': builtinRules.get('no-restricted-syntax'),
		'multiple-component-exports-syntax': builtinRules.get('no-restricted-syntax'),
		'array-index-key': noArrayIndexKey,
		'next-headers-imports': builtinRules.get('no-restricted-imports'),
		'server-actions-syntax': builtinRules.get('no-restricted-syntax'),
		'revalidate-syntax': builtinRules.get('no-restricted-syntax'),
		'dynamic-params-syntax': builtinRules.get('no-restricted-syntax'),
		'use-client-route-syntax': builtinRules.get('no-restricted-syntax'),
		'static-export-config-syntax': builtinRules.get('no-restricted-syntax'),
		'content-mdx-import-export': builtinRules.get('no-restricted-syntax'),
		'content-fs-imports': builtinRules.get('no-restricted-imports'),
		'content-module-imports': builtinRules.get('no-restricted-imports'),
		'lib-domain-deep-imports': builtinRules.get('no-restricted-imports'),
		'lib-domain-deep-dynamic-imports': builtinRules.get('no-restricted-syntax'),
		'content-dynamic-imports': builtinRules.get('no-restricted-syntax'),
		'content-url-literals': builtinRules.get('no-restricted-syntax'),
		'ui-layer-imports': builtinRules.get('no-restricted-imports'),
		'ui-layer-dynamic-syntax': builtinRules.get('no-restricted-syntax'),
		'pro-blocks-layer-imports': builtinRules.get('no-restricted-imports'),
		'pro-blocks-layer-dynamic-syntax': builtinRules.get('no-restricted-syntax'),
		'app-imports': builtinRules.get('no-restricted-imports'),
		'app-dynamic-syntax': builtinRules.get('no-restricted-syntax'),
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
// `max-w-sm` and `data-[size=sm]:h-8` stay out of reach. An arbitrary property such as
// `[color:red]` is a class of its own, and its patterns anchor the same way.
const colorUtility =
	'(?:text-shadow|text|bg|border(?:-[xytrblse])?|ring|ring-offset|outline|divide|accent|caret|fill|stroke|shadow|inset-shadow|inset-ring|drop-shadow|from|via|to|decoration)'
const paletteColor =
	'(?:black|white|(?:slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3})'
// The CSS Color 4 keywords, for `bg-[red]`.
const cssColorNames = `
	aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
	blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
	crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
	darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
	darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue
	dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
	gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
	lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
	lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
	lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen
	magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
	mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
	mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
	palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
	powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
	seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
	steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`
const namedColor = `(?:${cssColorNames.trim().split(/\s+/).join('|')})`
const sizeUtility =
	'(?:p[xytrbles]?|m[xytrbles]?|scroll-[mp][xytrbles]?|gap(?:-[xy])?|space-[xy]|size|w|h|min-[wh]|max-[wh]|inset(?:-[xy])?|top|right|bottom|left|start|end|basis)'
// The CSS properties behind those utilities, for `[padding:13px]`.
const sizeProperty =
	'(?:padding|margin|gap|row-gap|column-gap|(?:min-|max-)?(?:width|height)|inset|top|right|bottom|left|scroll-margin|scroll-padding)(?:-[a-z]+)*'

// The layer checks (about-architecture.md) come in pairs: `no-restricted-imports` sees `import`
// and `export … from` but not `import()`, so each has a `no-restricted-syntax` twin for that.
const appImportsMessage =
	'Nothing imports from src/app/, because routes are entry points. Move what you share into src/components/ or src/lib/ and import it from there.'
const uiLayerMessage = `A shadcn primitive doesn't import a Pro Block or a feature component. Move what both need into src/components/ui/, or pass it in as props or children. See ${DOC.aboutArchitecture}.`
const proBlocksLayerMessage = `A Pro Block doesn't import a feature component. Move what both need into src/components/ui/ or src/components/pro-blocks/, or pass it in as props or children. See ${DOC.aboutArchitecture}.`

// Content-graph boundaries (issue #55): only src/lib/content/ reads content (About the
// architecture, ADR-0003) — everywhere else in src/ asks the graph instead of touching the file
// system, src/content or a file inside the module directly. Shared messages, since several
// selectors below report the same violation.
const CONTENT_MODULE_MESSAGE = `Only src/lib/content/ reads content, static or dynamic import alike. Import @/lib/content instead. See ${DOC.aboutArchitecture}.`
const CONTENT_FS_MESSAGE = `File system access belongs in src/lib/content/, the one module that reads content. See ${DOC.aboutArchitecture}.`
const LIB_DOMAIN_DEEP_IMPORT_MESSAGE = `Import from the domain folder's public API, @/lib/<domain>, never a file inside it. See ${DOC.folderStructure}.`
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
							message: `Render icons with <Icon iconName="..." /> from @/components/ui/icons. See ${DOC.iconRegistry}.`,
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
							message: `shadcn here runs on Base UI: import primitives from @base-ui/react and use the render prop instead of asChild. See ${DOC.componentBlueprint}.`,
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
							message: `Read browser state in a Client Component instead: it needs a server. A preview needs a new build. See ${DOC.staticExport}.`,
						},
					],
				},
			],

			// Static export (static-export.md): no Server Actions, because the site has no writes.
			'restrictions/server-actions-syntax': [
				'error',
				{
					selector: 'ExpressionStatement[expression.value="use server"]',
					message: `'use server' is unused here: there are no Server Actions, because the site has no writes. See ${DOC.staticExport}.`,
				},
			],

			// Static export (static-export.md): no incremental regeneration; a content change
			// needs a new build.
			'restrictions/revalidate-syntax': [
				'error',
				{
					selector:
						'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="revalidate"]',
					message: `\`export const revalidate\` is unused here: there is no incremental regeneration; a content change needs a new build. See ${DOC.staticExport}.`,
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
					message: `\`export const dynamicParams = true\` is unused here: every dynamic segment exports \`generateStaticParams()\` from the content graph. Use \`export const dynamicParams = false\`. See ${DOC.staticExport}.`,
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
			// API; consumers import `@/lib/<domain>`, never a file inside it. Every folder in
			// src/lib/ is a domain folder except the type-based ones (utils/, styles/, hooks/),
			// whose files are imported directly. A separate rule name from the deep *static*
			// import below (not just a second selector on it), even though both report the same
			// message: nothing inside a domain folder legitimately needs a deep import of itself,
			// static or dynamic, so unlike `content-dynamic-imports` this one has no override to
			// protect from accidentally disabling.
			'restrictions/lib-domain-deep-dynamic-imports': [
				'error',
				{
					selector:
						'ImportExpression[source.value=/^@\\x2flib\\x2f(?!(?:utils|styles|hooks)\\x2f)[^\\x2f]+\\x2f/]',
					message: LIB_DOMAIN_DEEP_IMPORT_MESSAGE,
				},
			],

			'restrictions/lib-domain-deep-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^@/lib/(?!(?:utils|styles|hooks)/)[^/]+/',
							message: LIB_DOMAIN_DEEP_IMPORT_MESSAGE,
						},
					],
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
		// is the one place a plain <img> is correct instead of next/image
		// (bodyImageComponents, next to the MDX component map).
		files: ['src/mdx-components.tsx'],
		rules: { '@next/next/no-img-element': 'off' },
	},
	{
		// Component and file conventions, everywhere in src/. Installed shadcn primitives and Pro
		// Blocks are owned by the repo and follow the same blueprint, so they're in scope too.
		files: ['src/**/*.{ts,tsx}'],
		rules: {
			// Functions are declarations; arrow functions are for callbacks.
			'func-style': ['error', 'declaration'],

			// Kartei class rules (kartei-design-system.md), everywhere in src/: installed shadcn primitives
			// and Pro Blocks follow them too. No palette colours.
			'restrictions/palette-color-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?${colorUtility}-${paletteColor}(?:/[^:]*)?!?$`,
							message: `Palette colours bypass the theme and break dark mode. Use a token utility such as bg-card, text-foreground or text-muted-foreground. See ${DOC.karteiDesignSystem}.`,
						},
					],
				},
			],

			// No arbitrary colours: bg-[#00676b] and bg-[red] as utilities, [color:#00676b] as a
			// property.
			'restrictions/arbitrary-color-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?(?:${colorUtility}-\\[(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\\(|color:|${namedColor}\\])|\\[(?:[a-z-]*color|background|fill|stroke):)`,
							message: `Arbitrary colours bypass the theme and break dark mode. Use a token utility such as bg-primary or text-muted-foreground. See ${DOC.karteiDesignSystem}.`,
						},
					],
				},
			],

			// No arbitrary radii: rounded-[6px] as a utility, [border-radius:6px] as a property.
			'restrictions/arbitrary-radius-classes': [
				'error',
				{
					restrict: [
						{
							pattern:
								'(?:^|:)!?(?:rounded(?:-(?:s|e|t|r|b|l|ss|se|ee|es|tl|tr|br|bl))?-\\[|\\[[a-z-]*radius:)',
							message: `Arbitrary radii bypass the theme. Use the radius scale: rounded-sm, rounded-lg (4px), rounded-xl (8px) or rounded-none. See ${DOC.themeSystem} for the scale and ${DOC.karteiDesignSystem} (Shapes) for which element gets which.`,
						},
					],
				},
			],

			// No arbitrary font families: font-['Inter'] as a utility, [font-family:Inter] as a
			// property.
			'restrictions/arbitrary-font-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)!?(?:font-\\[(?!\\d|number:|var\\()|\\[font-family:)',
							message: `Arbitrary font families bypass the theme. Use font-sans, font-serif, font-mono or font-heading. See ${DOC.fontSystem}.`,
						},
					],
				},
			],

			// No arbitrary spacing or sizes: p-[13px] as a utility, [padding:13px] as a property.
			'restrictions/arbitrary-size-classes': [
				'error',
				{
					restrict: [
						{
							pattern: `(?:^|:)!?(?:-?${sizeUtility}-\\[|\\[${sizeProperty}:)`,
							message: `Use the 4px spacing scale: p-3 is 12px, w-24 is 96px. A measured one-off, such as the 416 × 340px Stadtplan tile, gets an eslint-disable comment that states the measurement. See ${DOC.karteiDesignSystem}.`,
						},
					],
				},
			],

			// signal never colours text. Reading the variable, text-(--signal), colours it just the
			// same.
			'restrictions/signal-text-classes': [
				'error',
				{
					restrict: [
						{
							pattern:
								'(?:^|:)!?(?:text-(?:signal|\\((?:color:)?--signal\\)|\\[(?:color:)?var\\(--signal\\)\\])|\\[color:var\\(--signal\\)\\])(?:/[^:]*)?!?$',
							message: `Koralle has 3.4:1 contrast on Archivstein, so signal never colours text. Use text-foreground, text-muted-foreground or text-accent-foreground, and keep bg-signal for the "Sie sind hier" marker. See ${DOC.karteiDesignSystem}.`,
						},
					],
				},
			],

			// Mobile first: unprefixed classes are the mobile layout, so there are no max-* variants.
			'restrictions/desktop-first-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:)max-(?:[a-z0-9]+|\\[[^\\]]*\\])(?:/[a-z0-9-]+)?:',
							message:
								'Write the mobile layout as unprefixed classes and add to it with sm:, md: or lg:. There are no max-* variants.',
						},
					],
				},
			],

			// React 19 passes `ref` as a prop: no forwardRef, no displayName.
			'restrictions/legacy-ref-syntax': [
				'error',
				{
					selector:
						"CallExpression[callee.name='forwardRef'], CallExpression[callee.object.name='React'][callee.property.name='forwardRef']",
					message:
						'React 19 passes `ref` as a prop, so write a plain function component that takes `ref` instead of forwardRef.',
				},
				{
					selector: "AssignmentExpression[left.property.name='displayName']",
					message:
						'Named function declarations already carry a name, so drop the displayName assignment.',
				},
			],

			// Composition goes through Base UI's render prop: no asChild.
			'restrictions/as-child-syntax': [
				'error',
				{
					selector: "JSXAttribute[name.name='asChild']",
					message: `There is no asChild. Compose through Base UI's render prop instead. See ${DOC.componentBlueprint}.`,
				},
			],

			// Base UI imports come from a primitive's own subpath.
			'restrictions/base-ui-subpath-imports': [
				'error',
				{
					paths: [
						{
							name: '@base-ui/react',
							message: `Import a Base UI primitive from its own subpath, e.g. '@base-ui/react/dialog', never the package root. See ${DOC.componentBlueprint}.`,
						},
					],
				},
			],

			// A link styled as a button is a Link with buttonVariants(), not <Button render={<a />}>.
			'restrictions/button-anchor-syntax': [
				'error',
				{
					selector:
						"JSXElement[openingElement.name.name='Button'] > JSXOpeningElement > JSXAttribute[name.name='render'] JSXElement[openingElement.name.name=/^(a|Link)$/]",
					message:
						'A link styled as a button is a Link with buttonVariants() classes; <Button render={<a />}> or render={<Link />} gives the anchor role="button" instead.',
				},
			],

			// Props derive from the element or primitive, not from a *HTMLAttributes type.
			'restrictions/html-attributes-syntax': [
				'error',
				{
					selector:
						'TSTypeReference > TSQualifiedName[right.name=/HTMLAttributes$/], TSTypeReference > Identifier[name=/HTMLAttributes$/], TSInterfaceHeritage > MemberExpression[property.name=/HTMLAttributes$/], TSInterfaceHeritage > Identifier[name=/HTMLAttributes$/]',
					message: `Derive props from React.ComponentProps<'element'> or the primitive's own props type instead of a *HTMLAttributes type. See ${DOC.componentBlueprint}.`,
				},
			],

			// Named exports only; the Next.js route files below are the exception.
			'restrictions/default-exports-syntax': [
				'error',
				{
					selector: 'ExportDefaultDeclaration, ExportSpecifier[exported.name="default"]',
					message:
						'Use a named export: default exports are reserved for Next.js route files (page, layout, not-found, …).',
				},
			],

			// A relative import reaches only a file in the same folder; everything else goes through @/.
			'restrictions/relative-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^\\.\\.(/|$)|^\\./[^/]+/',
							message:
								'Import through the @/ alias. A relative import is only for a file in the same folder, ./file.',
						},
					],
				},
			],

			// Nothing imports from src/app/: routes are entry points, so shared code lives in
			// src/components/ or src/lib/.
			'restrictions/app-imports': [
				'error',
				{
					patterns: [{ regex: '^@/app(?:/|$)', message: appImportsMessage }],
				},
			],
			'restrictions/app-dynamic-syntax': [
				'error',
				{
					selector: 'ImportExpression[source.value=/^@\\x2fapp(?:\\x2f|$)/]',
					message: appImportsMessage,
				},
			],

			// cn() from the 'cn' package merges classes: no clsx, no tailwind-merge.
			'restrictions/cn-package-imports': [
				'error',
				{
					paths: [
						{
							name: 'clsx',
							message: "Use cn() from the 'cn' package instead of clsx.",
						},
						{
							name: 'tailwind-merge',
							message: "Use cn() from the 'cn' package instead of tailwind-merge.",
						},
					],
				},
			],

			// cn comes from the 'cn' package, not the registry alias. Pro Blocks keep the alias
			// (lifted below), because that is how they're installed.
			'restrictions/cn-alias-imports': [
				'error',
				{
					paths: [
						{
							name: '@/lib/utils/cn',
							message: `Import cn from the 'cn' package directly; @/lib/utils/cn is the registry alias Pro Blocks installs use. See ${DOC.folderStructure}.`,
						},
					],
				},
			],

			// Only the root layout imports global CSS (lifted below).
			'restrictions/global-css-imports': [
				'error',
				{
					patterns: [
						{
							regex: '(?<!\\.module)\\.css$',
							message:
								'Only the root layout imports global CSS. Style the component with Tailwind classes, or add an @utility block in src/lib/styles/.',
						},
					],
				},
			],

			// Tailwind finds classes by scanning source text, so no class name is built in a template
			// literal.
			'restrictions/template-literal-syntax': [
				'error',
				{
					selector:
						"JSXAttribute[name.name='className'] TemplateLiteral, CallExpression[callee.name='cn'] TemplateLiteral, CallExpression[callee.name='cva'] TemplateLiteral",
					message: `Tailwind finds classes by scanning source text, so a template literal never reaches the CSS. Map values to complete class names instead. See ${DOC.tailwindConventions}.`,
				},
			],

			// next/font variable classes go on <body>. Any dynamic className on <html> is flagged,
			// because only those classes are ever built there.
			'restrictions/font-variables-syntax': [
				'error',
				{
					selector:
						"JSXOpeningElement[name.name='html'] > JSXAttribute[name.name='className'] > JSXExpressionContainer > :not(Literal)",
					message: `next/font variable classes go on <body>, never <html>: theme.css maps --font-sans: var(--font-sans) and Tailwind also writes that self-reference to :root, so on <html> it would compete with the next/font class at equal specificity and only the order of the CSS chunks would decide which wins. On <body> the class always wins. See ${DOC.fontSystem}.`,
				},
			],
		},
	},
	{
		// Next.js file conventions: https://nextjs.org/docs/app/api-reference/file-conventions.
		files: [
			'src/app/**/{page,layout,template,loading,error,global-error,not-found,global-not-found,forbidden,unauthorized,default,route,sitemap,robots,manifest,opengraph-image,twitter-image,icon,apple-icon}.{ts,tsx}',
		],
		rules: { 'restrictions/default-exports-syntax': 'off' },
	},
	{
		// In src/components/, exports sit in one export list at the bottom of the file, never on
		// a declaration.
		files: ['src/components/**/*.{ts,tsx}'],
		rules: {
			'restrictions/component-export-syntax': [
				'error',
				{
					selector: 'ExportNamedDeclaration[declaration]',
					message: `Export from one list at the bottom of the file instead: export { Name }. See ${DOC.componentBlueprint}.`,
				},
				{
					selector:
						'ExportNamedDeclaration:not([declaration]):not([source]) ~ ExportNamedDeclaration:not([source])',
					message: `Export from one list at the bottom of the file: merge this into the existing export { … } list. See ${DOC.componentBlueprint}.`,
				},
				{
					selector: 'ExportNamedDeclaration:not([declaration]) ~ :not(ExportNamedDeclaration)',
					message: `The export { … } list goes at the bottom of the file, after every declaration. See ${DOC.componentBlueprint}.`,
				},
			],
		},
	},
	{
		// UI strings come from the German dictionary (dictionary.md), so no component carries
		// inline text. Pro Blocks keep their upstream copy; tests assert on rendered markup.
		files: ['src/components/**/*.tsx', 'src/app/**/*.tsx'],
		ignores: ['src/components/pro-blocks/**', '**/*.test.tsx'],
		rules: {
			'restrictions/ui-string-syntax': [
				'error',
				{
					selector:
						'JSXAttribute[name.name=/^(aria-label|aria-description|alt|title|placeholder)$/] > Literal[value=/[A-Za-z]{2}/]',
					message: `Read user-facing attribute text from the dictionary: t('key'). See ${DOC.dictionary}.`,
				},
				{
					selector: 'JSXText[value=/[A-Za-z\\u00C0-\\u024F]{2}/]',
					message: `Read visible text from the dictionary: {t('key')}. See ${DOC.dictionary}.`,
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
					message: `'use client' on a route's page or layout makes the whole route a Client Component: put it on the smallest component that needs interaction instead, so the page stays static HTML. See ${DOC.staticExport}.`,
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
		// Design-system layers (about-architecture.md): a shadcn primitive knows the Tailwind
		// theme, not a Pro Block or a feature folder built on top of it.
		files: ['src/components/ui/**/*.{ts,tsx}'],
		rules: {
			'restrictions/ui-layer-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^@/components/(?!(?:ui|utils)(?:/|$))',
							message: uiLayerMessage,
						},
					],
				},
			],
			'restrictions/ui-layer-dynamic-syntax': [
				'error',
				{
					selector:
						'ImportExpression[source.value=/^@\\x2fcomponents\\x2f(?!(?:ui|utils)(?:\\x2f|$))/]',
					message: uiLayerMessage,
				},
			],
		},
	},
	{
		// Design-system layers (about-architecture.md): a Pro Block knows ui/ but not the feature
		// folder built from it.
		files: ['src/components/pro-blocks/**/*.{ts,tsx}'],
		rules: {
			'restrictions/pro-blocks-layer-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^@/components/(?!(?:ui|pro-blocks|utils)(?:/|$))',
							message: proBlocksLayerMessage,
						},
					],
				},
			],
			'restrictions/pro-blocks-layer-dynamic-syntax': [
				'error',
				{
					selector:
						'ImportExpression[source.value=/^@\\x2fcomponents\\x2f(?!(?:ui|pro-blocks|utils)(?:\\x2f|$))/]',
					message: proBlocksLayerMessage,
				},
			],
		},
	},
	{
		// Project code: everywhere in src/ except the installed shadcn primitives and Pro Blocks,
		// which keep the conventions of the upstream source they were copied from.
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/components/ui/**', 'src/components/pro-blocks/**'],
		rules: {
			// useMemo, useCallback and memo are for a measured performance problem; disabling this
			// rule for the line is how that measurement gets written down.
			'restrictions/memoization-syntax': [
				'error',
				{
					selector:
						"CallExpression[callee.name=/^(useMemo|useCallback|memo)$/], MemberExpression[object.name='React'][property.name=/^(useMemo|useCallback|memo)$/]",
					message:
						'useMemo, useCallback and memo are only for a measured performance problem. Disable this rule for the line with a comment stating what was measured.',
				},
			],

			// Handlers are named handle… and defined in the component body. This rule flags inline
			// arrows; react/jsx-handler-names checks the names.
			'restrictions/inline-handlers-syntax': [
				'error',
				{
					selector:
						'JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > ArrowFunctionExpression',
					message:
						'Define a handle… function in the component body and pass it by reference instead of an inline arrow on an on* prop.',
				},
			],

			// checkLocalVariables also checks handlers declared in the component body. A prop you
			// forward, onSelect, is neither named handle… nor declared there: pass props.onSelect, or
			// rename it when you destructure it, { onSelect: handleSelect }.
			'react/jsx-handler-names': ['error', { checkLocalVariables: true }],

			// Keys are stable ids from the data, never the array index.
			'restrictions/array-index-key': 'error',

			// Tokens switch with the theme, so project code has no dark: classes. A dark: class that
			// no token covers gets a disable comment that says why.
			'restrictions/dark-variant-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '(?:^|:|not-)dark:',
							message: `Tokens switch with the theme, so dark: is unused. Use a token utility, or disable this rule for the line with a comment saying why no token covers the difference. See ${DOC.themeSystem}.`,
						},
					],
				},
			],

			// Name groups and peers, group/button, so nested ones stay apart.
			'restrictions/unnamed-group-classes': [
				'error',
				{
					restrict: [
						{
							pattern: '^(?:group|peer)$',
							message: 'Name the group or peer, e.g. group/button, so nested groups stay apart.',
						},
						{
							pattern: '(?:^|:|not-)(?:group|peer)-(?:[^:/\\[]|\\[[^\\]]*\\])+:',
							message:
								'Name the group or peer in its variants too, e.g. group-hover/button:, and on the element, e.g. group/button.',
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
			'restrictions/multiple-exports-syntax': [
				'error',
				{
					selector:
						'ExportNamedDeclaration ~ ExportNamedDeclaration, ExportSpecifier ~ ExportSpecifier',
					message: `One export per file here. Split the extra export into its own file. See ${DOC.folderStructure}.`,
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
			'restrictions/multiple-component-exports-syntax': [
				'error',
				{
					selector:
						'ExportNamedDeclaration[declaration.id.name=/^[A-Z]/] ~ ExportNamedDeclaration[declaration.id.name=/^[A-Z]/], ExportNamedDeclaration[exportKind="value"] > ExportSpecifier[exportKind="value"][exported.name=/^[A-Z]/] ~ ExportSpecifier[exportKind="value"][exported.name=/^[A-Z]/]',
					message: `One exported component per file here. Split the extra component into its own file. See ${DOC.folderStructure}.`,
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
					message: `\`rewrites\`, \`redirects\` and \`headers\` in next.config.ts are unused here: URLs come from the content graph (ADR-0003), and the host handles redirects. See ${DOC.staticExport}.`,
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
					message: `Content MDX has no imports: it can only use the registered component set. See ${DOC.contentLayer}.`,
				},
				{
					selector: 'ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration',
					message: `Content MDX has no exports: it can only use the registered component set. See ${DOC.contentLayer}.`,
				},
			],
		},
	},
])

export default eslintConfig
