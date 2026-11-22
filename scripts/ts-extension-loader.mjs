// Node's native TypeScript support resolves a relative specifier exactly as
// written; unlike a bundler, it never appends an extension. This hook retries
// a failed relative resolution with `.ts`, so content-check.mts can import
// the content graph's normal, extensionless internal imports unchanged.
export async function resolve(specifier, context, nextResolve) {
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
