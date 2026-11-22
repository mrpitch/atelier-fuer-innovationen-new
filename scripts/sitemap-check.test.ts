import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const scriptPath = path.join(scriptsDir, 'sitemap-check.mts')
const fixturesDir = path.join(scriptsDir, '__fixtures__/sitemap-check')

function runSitemapCheck(outDir: string) {
	execFileSync('node', [scriptPath, outDir], { encoding: 'utf8', stdio: 'pipe' })
}

describe('sitemap:check', () => {
	it('exits zero when every built page is in sitemap.xml', () => {
		expect(() => runSitemapCheck(path.join(fixturesDir, 'valid'))).not.toThrow()
	})

	it('exits non-zero, naming the page, when a built page is missing from sitemap.xml', () => {
		expect.assertions(2)

		try {
			runSitemapCheck(path.join(fixturesDir, 'missing-page'))
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
			expect(execError.status).not.toBe(0)
			expect(execError.stderr).toContain('/stadt/ein-viertel')
		}
	})
})
