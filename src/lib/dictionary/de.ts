// The German UI dictionary (issue #26): every UI string a component shows
// goes here, by key, instead of inline in the component.
export const de = {
	'navigation.youAreHere': 'Sie sind hier',
	'navigation.previous': 'Vorherige Seite',
	'navigation.next': 'Nächste Seite',
} as const

export type DictionaryKey = keyof typeof de
