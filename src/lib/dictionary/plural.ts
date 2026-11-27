const germanPluralRules = new Intl.PluralRules('de')

// German has two plural categories, "one" (a count of 1) and "other"
// (everything else, 0 included) — picks the dictionary key suffix for a
// count-dependent string, e.g. the Themen-Hub eyebrow's Leitthema/Themen-Ort
// counts (issue #149).
export function pluralForm(count: number): 'one' | 'other' {
	return germanPluralRules.select(count) as 'one' | 'other'
}
