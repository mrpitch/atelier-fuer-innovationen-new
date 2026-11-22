// The TypeScript glob, the MDX glob and the catch-all negation never overlap, so no two tasks
// write the same file at once.
const config = {
	'*.{ts,tsx,mts,cts}': [
		// --no-warn-ignored keeps files ESLint ignores, such as the CDK subproject from #4, from
		// failing the commit with an "ignored file" warning.
		'eslint --fix --max-warnings 0 --no-warn-ignored',
		'prettier --write',
		// A function, so lint-staged passes no file names. Given file names, tsc ignores
		// tsconfig.json. The typecheck runs once per commit.
		() => 'pnpm typecheck',
	],
	// Every staged .mdx, content and fixtures alike (content-layer.md): Prettier excludes
	// *.mdx (.prettierignore), so ESLint and cspell are its only pre-commit checks.
	'*.mdx': ['eslint --fix --max-warnings 0 --no-warn-ignored', 'cspell --no-progress'],
	// Content graph inputs (About the architecture): content itself, plus the meta.json, Menus
	// and site data the loader will read alongside it as the Wissensstadt content types arrive.
	// A function, so content:check runs once per commit against the real content directory,
	// rather than once per staged file.
	'{src/content/**,src/lib/content/**,**/meta.json}': () => 'pnpm content:check',
	'!(*.ts|*.tsx|*.mts|*.cts|*.mdx)': 'prettier --write --ignore-unknown',
}

export default config
