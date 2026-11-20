// The two globs never overlap, so no file is written by two tasks at once.
const config = {
	// --no-warn-ignored keeps files under ESLint's ignores (the CDK subproject from #4) from
	// failing the commit with an "ignored file" warning.
	// The typecheck is a function so lint-staged passes it no file names: given files, tsc ignores
	// tsconfig.json. It runs once per commit.
	'*.{ts,tsx,mts,cts}': [
		'eslint --fix --max-warnings 0 --no-warn-ignored',
		'prettier --write',
		() => 'pnpm typecheck',
	],
	'!(*.ts|*.tsx|*.mts|*.cts)': 'prettier --write --ignore-unknown',
}

export default config
