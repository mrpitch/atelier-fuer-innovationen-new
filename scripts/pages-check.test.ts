import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const scriptPath = path.join(scriptsDir, 'pages-check.mts')
const fixturesDir = path.join(scriptsDir, '__fixtures__/pages-check')

function runPagesCheck(outDir: string) {
	execFileSync('node', [scriptPath, outDir], { encoding: 'utf8', stdio: 'pipe' })
}

function stderrOfFailingRun(outDir: string): string {
	try {
		runPagesCheck(outDir)
	} catch (error) {
		const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
		expect(execError.status).not.toBe(0)
		return execError.stderr
	}
	throw new Error(`pages:check passed on ${outDir}`)
}

describe('pages:check', () => {
	it('exits zero when every built page is in sitemap.xml with its canonical and Open Graph tags', () => {
		expect(() => runPagesCheck(path.join(fixturesDir, 'valid'))).not.toThrow()
	})

	it('exits non-zero, naming the page, when a built page is missing from sitemap.xml', () => {
		expect(stderrOfFailingRun(path.join(fixturesDir, 'missing-page'))).toContain(
			'/stadt/ein-viertel is a built page but missing from sitemap.xml',
		)
	})

	it('exits non-zero, naming the page and tag, when a built page has no Open Graph tags', () => {
		const stderr = stderrOfFailingRun(path.join(fixturesDir, 'missing-og'))

		expect(stderr).toContain('/stadt has no og:url')
		expect(stderr).not.toContain('pages:check: / has')
	})
})
