import type { Seite } from './loader'
import { loadSeiten } from './loader'

export interface ContentGraph {
	readonly seiten: readonly Seite[]
	getSeite(id: string): Seite | undefined
}

// The one public interface for content (ADR-0002): built from loader output,
// and able to load any content directory so tests can point it at fixtures.
export function buildContentGraph(contentDir: string): ContentGraph {
	const seiten = loadSeiten(contentDir)

	return {
		seiten,
		getSeite(id) {
			return seiten.find((seite) => seite.id === id)
		},
	}
}
