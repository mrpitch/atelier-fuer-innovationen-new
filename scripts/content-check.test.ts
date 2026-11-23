import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const scriptPath = path.join(scriptsDir, 'content-check.mts')
const fixturesDir = path.join(repoRoot, 'src/lib/content/__fixtures__')

function runContentCheck(contentDir: string) {
	execFileSync('node', [scriptPath, contentDir], { encoding: 'utf8', stdio: 'pipe' })
}

describe('content:check', () => {
	it('exits non-zero on the invalid fixture, naming the file, field and reason', () => {
		expect.assertions(4)

		try {
			runContentCheck(path.join(fixturesDir, 'invalid'))
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
			expect(execError.status).not.toBe(0)
			expect(execError.stderr).toContain('kontakt/index.mdx')
			expect(execError.stderr).toContain('description')
			expect(execError.stderr).toMatch(/string/i)
		}
	})

	it('exits non-zero when a published document references a Draft, naming the referring file and the Draft', () => {
		expect.assertions(4)

		try {
			runContentCheck(path.join(fixturesDir, 'draft-ref-aufsatz'))
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
			expect(execError.status).not.toBe(0)
			expect(execError.stderr).toContain(path.join('aufsaetze', 'publiziert', 'index.mdx'))
			expect(execError.stderr).toContain('viertelId')
			expect(execError.stderr).toContain(path.join('stadt', 'entwurf', 'index.mdx'))
		}
	})

	it('exits zero on the valid fixture', () => {
		expect(() => runContentCheck(path.join(fixturesDir, 'valid'))).not.toThrow()
	})

	it('exits zero on the real content directory', () => {
		expect(() => runContentCheck(path.join(repoRoot, 'src/content'))).not.toThrow()
	})
})
