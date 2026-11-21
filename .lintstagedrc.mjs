// The TypeScript glob and its negation never overlap, so no two tasks write the same file at once.
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
	'!(*.ts|*.tsx|*.mts|*.cts)': 'prettier --write --ignore-unknown',
}

export default config
