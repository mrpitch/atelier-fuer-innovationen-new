import { parse } from 'yaml'

import { ContentValidationError, FRONTMATTER_FIELD } from './errors'

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export interface SplitDocument {
	readonly frontmatter: unknown
	readonly body: string
}

// gray-matter 4 is unmaintained; the fence is simple enough to split by hand and
// hand the YAML block to the `yaml` package, which is actively maintained.
export function splitDocument(file: string, raw: string): SplitDocument {
	const match = FRONTMATTER_PATTERN.exec(raw)
	const frontmatterText = match ? match[1] : ''
	const body = match ? raw.slice(match[0].length) : raw

	if (frontmatterText.trim() === '') {
		return { frontmatter: {}, body }
	}

	try {
		return { frontmatter: parse(frontmatterText), body }
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error)
		throw new ContentValidationError(file, FRONTMATTER_FIELD, `invalid YAML: ${reason}`)
	}
}
