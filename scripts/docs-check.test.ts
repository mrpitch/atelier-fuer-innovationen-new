import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const scriptPath = path.join(scriptsDir, 'docs-check.mts')
const fixturesDir = path.join(scriptsDir, '__fixtures__/docs-check')

function runDocsCheck(docsDir: string) {
	execFileSync('node', [scriptPath, docsDir], { encoding: 'utf8', stdio: 'pipe' })
}

describe('docs:check', () => {
	it('exits non-zero on the invalid fixture, naming the file and the missing key', () => {
		expect.assertions(3)

		try {
			runDocsCheck(path.join(fixturesDir, 'invalid'))
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
			expect(execError.status).not.toBe(0)
			expect(execError.stderr).toContain('how-to/broken.md')
			expect(execError.stderr).toContain('description')
		}
	})

	it('exits non-zero naming the key when type does not match its folder', () => {
		expect.assertions(2)

		try {
			runDocsCheck(path.join(fixturesDir, 'invalid'))
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { stderr: string }
			expect(execError.stderr).toContain('how-to/broken.md: type')
			expect(execError.stderr).toContain('how-to')
		}
	})

	it('exits zero on the valid fixture, exempting the index and the README', () => {
		expect(() => runDocsCheck(path.join(fixturesDir, 'valid'))).not.toThrow()
	})

	it('exits zero on the real docs directory', () => {
		expect(() => runDocsCheck(path.join(repoRoot, 'docs'))).not.toThrow()
	})
})
