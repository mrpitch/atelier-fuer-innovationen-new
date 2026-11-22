// Node's native TypeScript support resolves a relative specifier exactly as
// written; unlike a bundler, it never appends an extension. This hook retries
// a failed relative resolution with `.ts`, so content-check.mts can import
// the content graph's normal, extensionless internal imports unchanged.
export async function resolve(specifier, context, nextResolve) {
	if (specifier === 'server-only') {
		// `src/lib/content/index.ts`'s public entry imports 'server-only' so a Client Component
		// fails `next build` (issue #55) — Next's bundler gives that specifier its own meaning and
		// needs no installed package (About the architecture). This script runs under plain Node
		// instead of that bundler, and has none of that, so resolve it to an empty module here —
		// scoped to this hook, so nothing outside content-check.mts and docs-check.mts is affected.
		return { url: 'data:text/javascript,export default undefined', shortCircuit: true }
	}

	try {
		return await nextResolve(specifier, context)
	} catch (error) {
		if (error.code === 'ERR_MODULE_NOT_FOUND' && /^\.\.?\//.test(specifier)) {
			// If the `.ts` retry also fails, the original error names the
			// specifier that was actually written and is the more useful one.
			try {
				return await nextResolve(`${specifier}.ts`, context)
			} catch {
				throw error
			}
		}
		throw error
	}
}
