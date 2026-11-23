import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptsDir, '..')
const scriptPath = path.join(scriptsDir, 'content-images.mts')
const fixturesDir = path.join(repoRoot, 'src/lib/content/__fixtures__')

const tempDirs: string[] = []

function makeTempDir(): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-images-test-'))
	tempDirs.push(dir)
	return dir
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		fs.rmSync(dir, { recursive: true, force: true })
	}
})

function runContentImages(contentDir: string, publicDir: string) {
	execFileSync('node', [scriptPath, contentDir, publicDir], { encoding: 'utf8', stdio: 'pipe' })
}

describe('content:images', () => {
	it('copies every body image into public/content/ of the given public directory', () => {
		const publicDir = makeTempDir()

		runContentImages(path.join(fixturesDir, 'body-valid'), publicDir)

		expect(fs.existsSync(path.join(publicDir, 'content', 'foto.svg'))).toBe(true)
		expect(fs.existsSync(path.join(publicDir, 'foto.svg'))).toBe(false)
	})

	it('exits non-zero on a missing body image, naming the file and the path', () => {
		const publicDir = makeTempDir()
		expect.assertions(3)

		try {
			runContentImages(path.join(fixturesDir, 'body-image-missing'), publicDir)
		} catch (error) {
			const execError = error as NodeJS.ErrnoException & { status: number; stderr: string }
			expect(execError.status).not.toBe(0)
			expect(execError.stderr).toContain('index.mdx')
			expect(execError.stderr).toContain('./fehlt.jpg')
		}
	})

	it('exits zero against the real content directory and copies the start image', () => {
		const publicDir = makeTempDir()
		expect(() => runContentImages(path.join(repoRoot, 'src/content'), publicDir)).not.toThrow()
		expect(fs.existsSync(path.join(publicDir, 'content', 'startbild.svg'))).toBe(true)
	})
})
