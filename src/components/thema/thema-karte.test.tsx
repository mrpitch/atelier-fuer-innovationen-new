import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Link from 'next/link'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buttonVariants } from '@/components/ui/button'
import { Illustration } from '@/components/ui/illustration'
import { buildContentGraph } from '@/lib/content'

import { ThemaKarte } from './thema-karte'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const graph = buildContentGraph(path.join(fixturesDir, 'themen-ort-detail-valid'))
const thema = graph.getThema('themen/futursysteme')
if (!thema) throw new Error('fixture content has no themen/futursysteme')
const leitthema = graph.getThema('themen/eine-welt-fuer-morgen')
if (!leitthema) throw new Error('fixture content has no themen/eine-welt-fuer-morgen')
const kapitelEins = graph.getKapitel('leitthema/ankunft')
if (!kapitelEins) throw new Error('fixture content has no leitthema/ankunft')
const netzwerk = graph.getThema('themen/netzwerk-der-innovatoren')
if (!netzwerk) throw new Error('fixture content has no themen/netzwerk-der-innovatoren')

describe('ThemaKarte', () => {
	it('defaults to the Themen-Ort variant, showing its label, title, text and action', () => {
		const html = renderToStaticMarkup(
			<ThemaKarte
				label="Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab"
				illustration={<Illustration id={thema.id} label={thema.title} />}
				titel={thema.title}
				text="Den Wandel wollen: Der Weg ist das Ziel."
				action={
					<Link href={thema.url} className={buttonVariants({ variant: 'outline' })}>
						Futursysteme öffnen
					</Link>
				}
			/>,
		)

		expect(html).toMatch(
			/data-slot="thema-karte" data-size="default" class="[^"]*" data-variant="themen-ort"/,
		)
		expect(html).toContain('Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab')
		expect(html).toContain(thema.title)
		expect(html).toContain('Den Wandel wollen: Der Weg ist das Ziel.')
		expect(html).toContain(`href="${thema.url}"`)
		expect(html).toContain('Futursysteme öffnen')
	})

	it('does not force-capitalize its mixed-case label (kartei-design-system.md, Open deviations)', () => {
		const html = renderToStaticMarkup(
			<ThemaKarte
				label="Themen-Ort · Viertel 05 · zweigt bei Kapitel 5 ab"
				illustration={<Illustration id={thema.id} label={thema.title} />}
				titel={thema.title}
				text="Den Wandel wollen: Der Weg ist das Ziel."
				action={
					<Link href={thema.url} className={buttonVariants({ variant: 'outline' })}>
						Futursysteme öffnen
					</Link>
				}
			/>,
		)

		const label = /<p class="([^"]*)">Themen-Ort/.exec(html)
		expect(label?.[1]).not.toContain('uppercase')
	})

	it('shows the Leitthema variant with its Content slot and both actions (issue #132)', () => {
		const html = renderToStaticMarkup(
			<ThemaKarte
				variant="leitthema"
				label="LEITTHEMA · 2 KAPITEL IN 2 VIERTELN"
				illustration={<Illustration id={leitthema.id} label={leitthema.title} />}
				titel={leitthema.title}
				text="Das Thema als Stadtspaziergang."
				weg={
					<ol aria-label="Der Themen-Weg">
						<li>K1</li>
						<li>K2</li>
					</ol>
				}
				action={
					<>
						<Link href={kapitelEins.url} className={buttonVariants({ variant: 'default' })}>
							Themen-Weg beginnen
						</Link>
						<Link href={netzwerk.url} className={buttonVariants({ variant: 'outline' })}>
							Als Rundgang ansehen
						</Link>
					</>
				}
			/>,
		)

		expect(html).toMatch(
			/data-slot="thema-karte" data-size="default" class="[^"]*" data-variant="leitthema"/,
		)
		expect(html).toContain('LEITTHEMA · 2 KAPITEL IN 2 VIERTELN')
		expect(html).toContain(leitthema.title)
		expect(html).toContain('<ol aria-label="Der Themen-Weg">')
		expect(html).toContain(`href="${kapitelEins.url}"`)
		expect(html).toContain('Themen-Weg beginnen')
		expect(html).toContain(`href="${netzwerk.url}"`)
		expect(html).toContain('Als Rundgang ansehen')
	})
})
