import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	resolve: {
		alias: {
			'@': path.join(rootDir, 'src'),
			'@scripts': path.join(rootDir, 'scripts'),
			// Next special-cases this bare import at build time; vitest needs its
			// own stand-in (vitest.server-only-stub.ts) for a test that imports
			// @/lib/content, which pulls it in.
			'server-only': path.join(rootDir, 'vitest.server-only-stub.ts'),
		},
	},
})
