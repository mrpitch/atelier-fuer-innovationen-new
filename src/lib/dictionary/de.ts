// The German UI dictionary (issue #26): every UI string a component shows
// goes here, by key, instead of inline in the component.
export const de = {
	'navigation.youAreHere': 'Sie sind hier',
	'navigation.previous': 'Vorherige Seite',
	'navigation.next': 'Nächste Seite',
	'layout.headerMenu': 'Hauptnavigation',
	'layout.footerMenu': 'Fußzeilen-Navigation',
	'navigation.sitemap': 'Sitemap',
	'stadt.navigation': 'Viertel und Zentrum der Wissensstadt',
	'stadt.zentrumHeading': 'Zentrum',
	'stadt.viertelHeading': 'Die acht Viertel',
	'viertel.steckbrief.prozessansatz': 'Prozessansatz',
	'viertel.steckbrief.bauform': 'Bauform',
	'viertel.steckbrief.prozessdokument': 'Prozessdokument',
	'viertel.steckbrief.imStadtzentrum': 'Im Stadtzentrum',
	'viertel.aufsaetzeHeading': 'Mehr aus dem Viertel',
	'viertel.kapitelHeading': 'Kapitel des Leitthemas',
	'aufsatz.readingTime': 'ca. {n} Min.',
	'kapitel.number': 'Kapitel {n}',
	'kapitel.abschnitteCount': '{n} Abschnitte',
	'kapitel.themenOrtHeading': 'Themen-Ort',
	'abschnitt.readingTime': 'ca. {n} Min.',
	'themen.navigation': 'Die drei Themen',
	'thema.kapitelHeading': 'Kapitel',
} as const

export type DictionaryKey = keyof typeof de
