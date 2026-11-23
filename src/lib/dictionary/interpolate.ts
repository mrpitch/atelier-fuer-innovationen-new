const PLACEHOLDER_PATTERN = /\{(\w+)\}/g

// `{name}` placeholders in a dictionary template, filled in from `params`. A
// placeholder with no matching param is left as written.
export function interpolate(
	template: string,
	params: Readonly<Record<string, string | number>>,
): string {
	return template.replace(PLACEHOLDER_PATTERN, (match, key: string) => {
		const value = params[key]
		return value === undefined ? match : String(value)
	})
}
