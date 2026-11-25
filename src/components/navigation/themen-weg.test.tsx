import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { ThemenWegKapitelItem } from './themen-weg'
import { ThemenWeg } from './themen-weg'

// Plain data, not content IDs or real content-graph URLs
// (restrictions/content-url-literals, content-layer.md): ThemenWeg takes
// already-resolved props, so this test writes its own.
const kapitel: readonly ThemenWegKapitelItem[] = [
	{
		id: 'erstes-kapitel',
		url: '/erstes-kapitel',
		number: 1,
		title: 'Erstes Kapitel',
		viertelId: 'stadt/annaeherung',
		viertelNumber: 1,
		viertelTitle: 'Erste',
		current: false,
	},
	{
		id: 'zweites-kapitel',
		url: '/zweites-kapitel',
		number: 2,
		title: 'Zweites Kapitel',
		viertelId: 'stadt/maerkte-kooperation',
		viertelNumber: 2,
		viertelTitle: 'Zweite',
		current: true,
	},
	{
		id: 'drittes-kapitel',
		url: '/drittes-kapitel',
		number: 3,
		title: 'Drittes Kapitel',
		viertelId: 'stadt/kontexte',
		viertelNumber: 3,
		viertelTitle: 'Dritte',
		current: false,
	},
]

describe('ThemenWeg', () => {
	it('marks only the current Kapitel active, on a Kapitel page', () => {
		const html = renderToStaticMarkup(
			<ThemenWeg leitthemaTitle="Eine Welt für morgen" kapitel={kapitel} />,
		)

		expect(html).toContain('href="/erstes-kapitel"')
		expect(html).toContain('href="/zweites-kapitel"')
		expect(html).toContain('href="/drittes-kapitel"')
		expect(html.match(/data-active=""/g)).toHaveLength(1)
		expect(html.match(/<a[^>]*href="\/zweites-kapitel"[^>]*>/)?.[0]).toContain('data-active=""')
		expect(html.match(/<a[^>]*href="\/erstes-kapitel"[^>]*>/)?.[0]).not.toContain('data-active=""')
	})

	it('expands the current Kapitel to its Abschnitte, with the current one marked, only when given', () => {
		const withAbschnitte: readonly ThemenWegKapitelItem[] = kapitel.map((item) =>
			item.id === 'zweites-kapitel'
				? {
						...item,
						abschnitte: [
							{
								id: 'erster-abschnitt',
								url: '/zweites-kapitel/erster-abschnitt',
								number: '2.1',
								title: 'Erster Abschnitt',
								current: false,
							},
							{
								id: 'zweiter-abschnitt',
								url: '/zweites-kapitel/zweiter-abschnitt',
								number: '2.2',
								title: 'Zweiter Abschnitt',
								current: true,
							},
						],
					}
				: item,
		)

		const withoutAbschnitte = renderToStaticMarkup(
			<ThemenWeg leitthemaTitle="Eine Welt für morgen" kapitel={kapitel} />,
		)
		expect(withoutAbschnitte).not.toContain('Erster Abschnitt')
		expect(withoutAbschnitte).not.toContain('Zweiter Abschnitt')

		const html = renderToStaticMarkup(
			<ThemenWeg leitthemaTitle="Eine Welt für morgen" kapitel={withAbschnitte} />,
		)
		expect(html).toContain('href="/zweites-kapitel/erster-abschnitt"')
		expect(html).toContain('href="/zweites-kapitel/zweiter-abschnitt"')
		expect(html.match(/data-active=""/g)).toHaveLength(1)
		expect(html.match(/<a[^>]*href="\/zweites-kapitel\/zweiter-abschnitt"[^>]*>/)?.[0]).toContain(
			'data-active=""',
		)
		expect(
			html.match(/<a[^>]*href="\/zweites-kapitel\/erster-abschnitt"[^>]*>/)?.[0],
		).not.toContain('data-active=""')
	})
})
