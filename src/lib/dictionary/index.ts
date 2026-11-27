import type { DictionaryKey } from './de'
import { de } from './de'
import { interpolate } from './interpolate'

export type { DictionaryKey }
export { pluralForm } from './plural'

// The one public interface for UI copy (issue #26): a component looks up a
// string by key instead of writing it inline, so every German UI string
// goes through this dictionary.
export function t(key: DictionaryKey, params?: Readonly<Record<string, string | number>>): string {
	const template = de[key]
	return params ? interpolate(template, params) : template
}
