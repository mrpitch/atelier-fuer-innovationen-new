// The German UI dictionary (issue #26): every UI string a component shows
// goes here, by key, instead of inline in the component.
export const de = {
	'navigation.youAreHere': 'Sie sind hier',
	'navigation.previous': 'Vorherige Seite',
	'navigation.next': 'Nächste Seite',
	'layout.headerMenu': 'Hauptnavigation',
	'layout.footerMenu': 'Fußzeilen-Navigation',
	'stadt.navigation': 'Viertel und Zentrum der Wissensstadt',
	'stadt.zentrumHeading': 'Zentrum',
	'stadt.viertelHeading': 'Die acht Viertel',
	'viertel.steckbrief.prozessansatz': 'Prozessansatz',
	'viertel.steckbrief.bauform': 'Bauform',
	'viertel.steckbrief.prozessdokument': 'Prozessdokument',
	'viertel.steckbrief.imStadtzentrum': 'Im Stadtzentrum',
} as const

export type DictionaryKey = keyof typeof de
