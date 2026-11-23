import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ContentValidationError } from './errors'
import { buildContentGraph } from './graph'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildContentGraph', () => {
	it('resolves a valid Seite to its ID and URL', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'valid'))

		const start = graph.getSeite('')
		expect(start?.id).toBe('')
		expect(start?.url).toBe('/')
		expect(start?.title).toBe('Start')

		const kontakt = graph.getSeite('kontakt')
		expect(kontakt?.id).toBe('kontakt')
		expect(kontakt?.url).toBe('/kontakt')
		expect(kontakt?.shortTitle).toBe('Kontakt')
		expect(kontakt?.body).toContain('Testinhalt')
	})

	it('fails invalid frontmatter with the file, field and reason', () => {
		expect.assertions(4)

		try {
			buildContentGraph(path.join(fixturesDir, 'invalid'))
		} catch (error) {
			expect(error).toBeInstanceOf(ContentValidationError)
			const validationError = error as ContentValidationError
			expect(validationError.file).toBe(path.join('kontakt', 'index.mdx'))
			expect(validationError.field).toBe('description')
			expect(validationError.reason).toMatch(/string/i)
		}
	})

	describe('Navigation', () => {
		it('orders children by meta.json, builds the tree and resolves breadcrumbs and previous/next, preferring the Short title', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'navigation-ordered'))

			expect(graph.navigation.id).toBe('')
			expect(graph.navigation.title).toBe('Start')
			expect(graph.navigation.children.map((child) => child.id)).toEqual([
				'zweite',
				'erste',
				'dritte',
			])
			expect(graph.navigation.children.map((child) => child.title)).toEqual([
				'Zweite',
				'Erste',
				'Dritte Testseite',
			])

			expect(graph.getBreadcrumbs('erste')).toEqual([
				{ id: '', url: '/', title: 'Start' },
				{ id: 'erste', url: '/erste', title: 'Erste' },
			])

			expect(graph.getPrevious('erste')).toEqual({ id: 'zweite', url: '/zweite', title: 'Zweite' })
			expect(graph.getNext('erste')).toEqual({
				id: 'dritte',
				url: '/dritte',
				title: 'Dritte Testseite',
			})
			expect(graph.getPrevious('zweite')).toBeUndefined()
			expect(graph.getNext('dritte')).toBeUndefined()
		})

		it('orders a nested folder by its meta.json, which lists full document IDs', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'navigation-nested'))

			expect(graph.getBreadcrumbs('eltern/erstes')).toEqual([
				{ id: '', url: '/', title: 'Start' },
				{ id: 'eltern', url: '/eltern', title: 'Eltern' },
				{ id: 'eltern/erstes', url: '/eltern/erstes', title: 'Erstes Kind' },
			])
			expect(graph.getPrevious('eltern/erstes')).toEqual({
				id: 'eltern/zweites',
				url: '/eltern/zweites',
				title: 'Zweites Kind',
			})
			expect(graph.getNext('eltern/zweites')).toEqual({
				id: 'eltern/erstes',
				url: '/eltern/erstes',
				title: 'Erstes Kind',
			})
		})

		it('sorts a folder without meta.json by its natural key (title, for Seite)', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'navigation-natural-order'))

			expect(graph.navigation.children.map((child) => child.title)).toEqual(['Apfel', 'Zeder'])
		})

		it('fails when meta.json lists an unknown ID, naming the file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'navigation-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('meta.json')
				expect(validationError.field).toBe('nichtvorhanden')
				expect(validationError.reason).toMatch(/unknown|no matching/i)
			}
		})

		it('fails when meta.json omits an actual child, naming the file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'navigation-unlisted-child'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('meta.json')
				expect(validationError.field).toBe('zweite')
				expect(validationError.reason).toMatch(/missing/i)
			}
		})
	})

	describe('Sitemap', () => {
		it("defaults a Seite's draft to false", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'valid'))

			expect(graph.getSeite('')?.draft).toBe(false)
		})

		it('lists the Navigation tree flattened, in order, leaving out a Draft but keeping its published children', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'))

			expect(graph.sitemap).toEqual([
				{ id: '', url: '/', title: 'Start' },
				{ id: 'entwurf/kind', url: '/entwurf/kind', title: 'Kind' },
				{ id: 'veroeffentlicht', url: '/veroeffentlicht', title: 'Veröffentlicht' },
				// The fixture's mandatory Zentrum (#28): no Viertel here, so this is
				// the whole Stadt block.
				{ id: 'stadt/zentrum', url: '/stadt/zentrum', title: 'Zentrum' },
			])
		})

		it('lists every content type in its own area block, in the order each type documents', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'sitemap-all-types'))

			expect(graph.sitemap.map((item) => item.id)).toEqual([
				'',
				'stadt/zentrum',
				'stadt/ein-viertel',
				'bibliothek/aufsaetze/ein-aufsatz',
				'leitthema/ein-kapitel',
				'leitthema/ein-kapitel/ein-abschnitt',
				'themen/ein-thema',
				'rundgaenge/ein-rundgang',
				'rundgaenge/ein-rundgang/eine-station',
			])
		})
	})

	describe('Drafts', () => {
		it('renders a Draft like any Seite in dev, but hides it (and reparents its children) everywhere else', () => {
			const dev = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'), {
				development: true,
			})
			const production = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'))

			expect(dev.getSeite('entwurf')).toBeDefined()
			expect(dev.seiten.map((seite) => seite.id)).toContain('entwurf')
			expect(dev.navigation.children.map((child) => child.id)).toEqual([
				'entwurf',
				'veroeffentlicht',
			])

			expect(production.getSeite('entwurf')).toBeUndefined()
			expect(production.seiten.map((seite) => seite.id)).not.toContain('entwurf')
			expect(production.navigation.children.map((child) => child.id)).toEqual([
				'entwurf/kind',
				'veroeffentlicht',
			])
		})

		it('omits a Draft ancestor from breadcrumbs in production, but keeps it in dev', () => {
			const dev = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'), {
				development: true,
			})
			const production = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'))

			expect(dev.getBreadcrumbs('entwurf/kind').map((link) => link.id)).toEqual([
				'',
				'entwurf',
				'entwurf/kind',
			])
			expect(production.getBreadcrumbs('entwurf/kind').map((link) => link.id)).toEqual([
				'',
				'entwurf/kind',
			])
		})

		it('links previous/next across a hidden Draft parent in production, matching the reparented tree', () => {
			const dev = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'), {
				development: true,
			})
			const production = buildContentGraph(path.join(fixturesDir, 'sitemap-draft'))

			expect(dev.getNext('entwurf')?.id).toBe('veroeffentlicht')
			expect(dev.getNext('entwurf/kind')).toBeUndefined()

			expect(production.getNext('entwurf/kind')?.id).toBe('veroeffentlicht')
			expect(production.getPrevious('veroeffentlicht')?.id).toBe('entwurf/kind')
			expect(production.getPrevious('entwurf/kind')).toBeUndefined()
		})

		it('fails a Draft with invalid frontmatter the same way any Seite does', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'draft-invalid'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('entwurf', 'index.mdx'))
				expect(validationError.field).toBe('description')
				expect(validationError.reason).toMatch(/string/i)
			}
		})

		it('still fails a Draft with invalid frontmatter in dev — being unpublished never skips validation', () => {
			expect(() =>
				buildContentGraph(path.join(fixturesDir, 'draft-invalid'), { development: true }),
			).toThrow(ContentValidationError)
		})

		it('fails a Menu entry referencing a Draft in production, naming the Menu file and the Draft', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-draft'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.field).toBe('entwurf')
				expect(validationError.reason).toContain(path.join('entwurf', 'index.mdx'))
			}
		})

		it('resolves the same Menu entry in dev, the one restriction development lifts', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'menu-draft'), {
				development: true,
			})

			expect(graph.getMenu('header')).toEqual([{ url: '/entwurf', label: 'Entwurf' }])
		})
	})

	describe('site data', () => {
		it('reads the site name, tagline, base URL and copyright from site.json', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'valid'))

			expect(graph.site).toEqual({
				name: 'Testname',
				tagline: 'Test-Tagline',
				baseUrl: 'https://example.com',
				copyright: '© Test',
			})
		})
	})

	describe('Menus', () => {
		it("resolves a content entry's label from the target's Short title, falling back to its title, and keeps an external entry's own label", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'menu-valid'))

			expect(graph.getMenu('header')).toEqual([
				{ url: '/mit-kurztitel', label: 'Kurz' },
				{ url: '/ohne-kurztitel', label: 'Testseite ohne Kurztitel' },
				{ url: 'https://extern.example.com', label: 'Extern' },
			])
		})

		it('returns an empty list for a Menu with no file', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'menu-valid'))

			expect(graph.getMenu('footer')).toEqual([])
		})

		it('fails when a Menu lists an unknown ID, naming the Menu file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.field).toBe('nichtvorhanden')
				expect(validationError.reason).toMatch(/unknown|no matching/i)
			}
		})
	})

	describe('Viertel and Zentrum', () => {
		it('numbers the Viertel by their position in the Viertel order file, ignoring any frontmatter number', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.viertel.map((viertel) => viertel.id)).toEqual([
				'stadt/erste-viertel',
				'stadt/zweite-viertel',
			])
			expect(graph.viertel.map((viertel) => viertel.number)).toEqual([1, 2])
			// erste-viertel's frontmatter sets `number: 99`; its real number still
			// comes from its position (1), proving frontmatter can't set it.
			expect(graph.getViertel('stadt/erste-viertel')?.number).toBe(1)
		})

		it('reads the Leitsatz and Steckbrief from structured frontmatter fields', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			const viertel = graph.getViertel('stadt/erste-viertel')
			expect(viertel?.leitsatz).toBe('Platzhalter-Leitsatz.')
			expect(viertel?.steckbrief).toEqual({
				prozessansatz: 'Platzhalter-Prozessansatz.',
				bauform: 'Platzhalter-Bauform.',
				prozessdokument: 'Platzhalter-Prozessdokument.',
				imStadtzentrum: 'Platzhalter.',
			})
		})

		it('loads the Zentrum as its own type, not a Viertel and with no number', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.zentrum.id).toBe('stadt/zentrum')
			expect(graph.zentrum.url).toBe('/stadt/zentrum')
			expect(graph.zentrum.title).toBe('Zentrum')
			expect(graph.zentrum).not.toHaveProperty('number')
		})

		it('still loads the Stadt landing Seite itself as a plain Seite', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			const stadt = graph.getSeite('stadt')
			expect(stadt?.url).toBe('/stadt')
			expect(stadt?.shortTitle).toBe('Stadtplan')
		})

		it('fails when the Viertel order file lists an unknown ID, naming the file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'stadt-order-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('stadt', 'viertel-order.json'))
				expect(validationError.field).toBe('stadt/nichtvorhanden')
				expect(validationError.reason).toMatch(/no matching/i)
			}
		})

		it('fails when the Viertel order file omits an actual Viertel, naming the file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'stadt-order-missing-child'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('stadt', 'viertel-order.json'))
				expect(validationError.field).toBe('stadt/erste-viertel')
				expect(validationError.reason).toMatch(/missing/i)
			}
		})
	})

	describe('Aufsatz', () => {
		it('resolves an Aufsatz to its ID, URL and Viertel reference', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'aufsatz-valid'))

			expect(graph.aufsaetze.map((aufsatz) => aufsatz.id)).toEqual([
				'bibliothek/aufsaetze/erster-aufsatz',
				'bibliothek/aufsaetze/zweiter-aufsatz',
			])

			const erster = graph.getAufsatz('bibliothek/aufsaetze/erster-aufsatz')
			expect(erster?.url).toBe('/bibliothek/aufsaetze/erster-aufsatz')
			expect(erster?.title).toBe('Erster Aufsatz')
			expect(erster?.viertelId).toBe('stadt/erste-viertel')
		})

		it('computes the reading time from the body word count', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'aufsatz-valid'))

			// erster-aufsatz's body is 201 words; at 200 words/minute that rounds
			// up to 2 minutes, proving it's computed, not a fixed value.
			expect(graph.getAufsatz('bibliothek/aufsaetze/erster-aufsatz')?.readingTimeMinutes).toBe(2)
			// zweiter-aufsatz's body is a few words; reading time floors at 1.
			expect(graph.getAufsatz('bibliothek/aufsaetze/zweiter-aufsatz')?.readingTimeMinutes).toBe(1)
		})

		it("derives each Viertel's related Aufsätze from the references, never from the Viertel itself", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'aufsatz-valid'))

			expect(
				graph.getAufsaetzeByViertel('stadt/erste-viertel').map((aufsatz) => aufsatz.id),
			).toEqual(['bibliothek/aufsaetze/erster-aufsatz'])
			expect(
				graph.getAufsaetzeByViertel('stadt/zweite-viertel').map((aufsatz) => aufsatz.id),
			).toEqual(['bibliothek/aufsaetze/zweiter-aufsatz'])
			expect(graph.getViertel('stadt/erste-viertel')).not.toHaveProperty('aufsaetze')
		})

		it('fails when an Aufsatz references a missing Viertel, naming the file, field and ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'aufsatz-missing-viertel'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(
					path.join('bibliothek', 'aufsaetze', 'verwaister-aufsatz', 'index.mdx'),
				)
				expect(validationError.field).toBe('viertelId')
				expect(validationError.reason).toContain('stadt/nichtvorhanden')
			}
		})
	})

	describe('Kapitel and Abschnitt', () => {
		it("derives a Kapitel's number and URL from its Viertel's number", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))

			expect(graph.kapitel.map((kapitel) => kapitel.id)).toEqual([
				'leitthema/erstes-kapitel',
				'leitthema/zweites-kapitel',
			])

			const erstes = graph.getKapitel('leitthema/erstes-kapitel')
			expect(erstes?.viertelId).toBe('stadt/erste-viertel')
			expect(erstes?.number).toBe(1)
			expect(erstes?.url).toBe('/stadt/erste-viertel/kapitel-1')

			const zweites = graph.getKapitelByViertel('stadt/zweite-viertel')
			expect(zweites?.id).toBe('leitthema/zweites-kapitel')
			expect(zweites?.number).toBe(2)
			expect(zweites?.url).toBe('/stadt/zweite-viertel/kapitel-2')
		})

		it("changes a Kapitel's number when the Viertel order changes", () => {
			const valid = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))
			const reordered = buildContentGraph(path.join(fixturesDir, 'leitthema-reordered-viertel'))

			// erstes-kapitel references stadt/erste-viertel in both fixtures; only
			// the Viertel order file differs (erste-viertel is 1st in leitthema-valid,
			// 2nd in leitthema-reordered-viertel).
			expect(valid.getKapitel('leitthema/erstes-kapitel')?.number).toBe(1)
			expect(reordered.getKapitel('leitthema/erstes-kapitel')?.number).toBe(2)
			expect(reordered.getKapitel('leitthema/erstes-kapitel')?.url).toBe(
				'/stadt/erste-viertel/kapitel-2',
			)
		})

		it('fails when a Kapitel references a missing Viertel, naming the file, field and ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'leitthema-missing-viertel'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('leitthema', 'verwaistes-kapitel', 'index.mdx'))
				expect(validationError.field).toBe('viertelId')
				expect(validationError.reason).toContain('stadt/nichtvorhanden')
			}
		})

		it('fails when a second Kapitel references a Viertel that already has one', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'leitthema-duplicate-viertel'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.field).toBe('viertelId')
				expect(validationError.reason).toContain('stadt/erste-viertel')
			}
		})

		it('numbers an Abschnitt as its Kapitel\'s number and its position, e.g. "1.2"', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))

			const abschnitte = graph.getAbschnitteByKapitel('leitthema/erstes-kapitel')
			expect(abschnitte.map((abschnitt) => abschnitt.id)).toEqual([
				'leitthema/erstes-kapitel/erster-abschnitt',
				'leitthema/erstes-kapitel/zweiter-abschnitt',
			])
			expect(abschnitte.map((abschnitt) => abschnitt.number)).toEqual(['1.1', '1.2'])
			expect(abschnitte.map((abschnitt) => abschnitt.url)).toEqual([
				'/stadt/erste-viertel/kapitel-1/1',
				'/stadt/erste-viertel/kapitel-1/2',
			])

			const zweitesKapitel = graph.getAbschnitteByKapitel('leitthema/zweites-kapitel')
			expect(zweitesKapitel.map((abschnitt) => abschnitt.number)).toEqual(['2.1', '2.2'])
		})

		it('derives the Abschnitt count from the resolved list, never from a written field', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))

			expect(graph.getAbschnitteByKapitel('leitthema/erstes-kapitel')).toHaveLength(2)
			expect(graph.getKapitel('leitthema/erstes-kapitel')).not.toHaveProperty('abschnitte')
		})

		it('crosses from the last Abschnitt of one Kapitel to the first of the next, in Kapitel number order', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))

			expect(graph.getNextAbschnitt('leitthema/erstes-kapitel/zweiter-abschnitt')).toEqual({
				id: 'leitthema/zweites-kapitel/erster-abschnitt',
				url: '/stadt/zweite-viertel/kapitel-2/1',
				title: 'Erster Abschnitt',
			})
			expect(graph.getPreviousAbschnitt('leitthema/zweites-kapitel/erster-abschnitt')).toEqual({
				id: 'leitthema/erstes-kapitel/zweiter-abschnitt',
				url: '/stadt/erste-viertel/kapitel-1/2',
				title: 'Zweiter Abschnitt',
			})

			expect(
				graph.getPreviousAbschnitt('leitthema/erstes-kapitel/erster-abschnitt'),
			).toBeUndefined()
			expect(graph.getNextAbschnitt('leitthema/zweites-kapitel/zweiter-abschnitt')).toBeUndefined()
		})

		it("fails when a Kapitel's Abschnitt order lists an unknown ID, naming the file and the ID", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'leitthema-abschnitt-order-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('leitthema', 'erstes-kapitel', 'meta.json'))
				expect(validationError.field).toBe('leitthema/erstes-kapitel/nichtvorhanden')
				expect(validationError.reason).toMatch(/no matching/i)
			}
		})

		it("fails when a Kapitel's Abschnitt order omits an actual child, naming the file and the ID", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'leitthema-abschnitt-order-missing-child'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('leitthema', 'erstes-kapitel', 'meta.json'))
				expect(validationError.field).toBe('leitthema/erstes-kapitel/zweiter-abschnitt')
				expect(validationError.reason).toMatch(/missing/i)
			}
		})
	})

	describe('Rundgang and Station', () => {
		it("numbers a Rundgang's Stationen from 0 when the first stands at the Zentrum", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))

			const stationen = graph.getStationenByRundgang('rundgaenge/besuch-im-zentrum')
			expect(stationen.map((station) => station.id)).toEqual([
				'rundgaenge/besuch-im-zentrum/station-zentrum',
				'rundgaenge/besuch-im-zentrum/station-eins',
				'rundgaenge/besuch-im-zentrum/station-zwei',
			])
			expect(stationen.map((station) => station.number)).toEqual([0, 1, 2])
			expect(stationen.map((station) => station.url)).toEqual([
				'/rundgaenge/besuch-im-zentrum/0',
				'/rundgaenge/besuch-im-zentrum/1',
				'/rundgaenge/besuch-im-zentrum/2',
			])
		})

		it("numbers a Rundgang's Stationen from 1 when the first stands at a Viertel", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))

			const stationen = graph.getStationenByRundgang('rundgaenge/ohne-zentrum')
			expect(stationen.map((station) => station.number)).toEqual([1, 2])
			expect(stationen.map((station) => station.url)).toEqual([
				'/rundgaenge/ohne-zentrum/1',
				'/rundgaenge/ohne-zentrum/2',
			])
		})

		it("derives a Rundgang's Stationen count and duration from its Stationen, never from a written field", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))

			const besuch = graph.getRundgang('rundgaenge/besuch-im-zentrum')
			// station-zentrum and station-eins are short bodies (1 Min. each);
			// station-zwei's 201-word body rounds up to 2 Min. — 1 + 1 + 2 = 4,
			// proving the duration is a real sum, not stationenCount * 1.
			expect(besuch?.stationenCount).toBe(3)
			expect(besuch?.durationMinutes).toBe(4)
			expect(besuch).not.toHaveProperty('stationen')
		})

		it('derives the Stationen set at a Viertel or the Zentrum from the references, never from the Ort itself', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))

			expect(graph.getStationenByOrt('stadt/zentrum').map((station) => station.id)).toEqual([
				'rundgaenge/besuch-im-zentrum/station-zentrum',
			])
			expect(graph.getStationenByOrt('stadt/erste-viertel').map((station) => station.id)).toEqual([
				'rundgaenge/besuch-im-zentrum/station-eins',
				'rundgaenge/ohne-zentrum/station-a',
			])
			expect(graph.getViertel('stadt/erste-viertel')).not.toHaveProperty('stationen')
		})

		it('keeps previous/next within one Rundgang, never crossing into another', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))

			expect(graph.getNextStation('rundgaenge/besuch-im-zentrum/station-zentrum')).toEqual({
				id: 'rundgaenge/besuch-im-zentrum/station-eins',
				url: '/rundgaenge/besuch-im-zentrum/1',
				title: 'Erste Station',
			})
			expect(
				graph.getPreviousStation('rundgaenge/besuch-im-zentrum/station-zentrum'),
			).toBeUndefined()
			expect(graph.getNextStation('rundgaenge/besuch-im-zentrum/station-zwei')).toBeUndefined()

			// ohne-zentrum's first Station has no previous, even though
			// besuch-im-zentrum's own Stationen come right before it in the list.
			expect(graph.getPreviousStation('rundgaenge/ohne-zentrum/station-a')).toBeUndefined()
		})

		it('fails when a Station references a missing Viertel, naming the file, field and ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'rundgang-missing-ort'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(
					path.join('rundgaenge', 'verwaister-rundgang', 'verwaiste-station', 'index.mdx'),
				)
				expect(validationError.field).toBe('ortId')
				expect(validationError.reason).toContain('stadt/nichtvorhanden')
			}
		})

		it("fails when a Rundgang's Station order lists an unknown ID, naming the file and the ID", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'rundgang-station-order-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('rundgaenge', 'einziger-rundgang', 'meta.json'))
				expect(validationError.field).toBe('rundgaenge/einziger-rundgang/nichtvorhanden')
				expect(validationError.reason).toMatch(/no matching/i)
			}
		})

		it("fails when a Rundgang's Station order omits an actual child, naming the file and the ID", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'rundgang-station-order-missing-child'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('rundgaenge', 'einziger-rundgang', 'meta.json'))
				expect(validationError.field).toBe('rundgaenge/einziger-rundgang/zweite-station')
				expect(validationError.reason).toMatch(/missing/i)
			}
		})
	})

	describe('Thema', () => {
		it('resolves the Leitthema and a Themen-Ort to their ID and URL', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'thema-valid'))

			expect(graph.themen.map((thema) => thema.id)).toEqual([
				'themen/ein-themen-ort',
				'themen/eine-welt-fuer-morgen',
			])

			const leitthema = graph.getThema('themen/eine-welt-fuer-morgen')
			expect(leitthema?.url).toBe('/themen/eine-welt-fuer-morgen')
			expect(leitthema?.kapitelId).toBeUndefined()

			const themenOrt = graph.getThema('themen/ein-themen-ort')
			expect(themenOrt?.url).toBe('/themen/ein-themen-ort')
			expect(themenOrt?.kapitelId).toBe('leitthema/erstes-kapitel')
		})

		it("derives a Kapitel's Themen-Ort from the reference, never restated on the Kapitel itself", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'thema-valid'))

			expect(graph.getThemenByKapitel('leitthema/erstes-kapitel').map((thema) => thema.id)).toEqual(
				['themen/ein-themen-ort'],
			)
			expect(graph.getKapitel('leitthema/erstes-kapitel')).not.toHaveProperty('themen')
		})

		it('fails when a Themen-Ort references a missing Kapitel, naming the file, field and ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'thema-missing-kapitel'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('themen', 'verwaister-themen-ort', 'index.mdx'))
				expect(validationError.field).toBe('kapitelId')
				expect(validationError.reason).toContain('leitthema/nichtvorhanden')
			}
		})
	})

	describe('Body (issue #35)', () => {
		it('resolves a <ViertelTeaser id> and a relative image against the content graph', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'body-valid'))

			expect(graph.getViertel('stadt/erste-viertel')?.leitsatz).toBe('Platzhalter-Leitsatz.')
			expect(graph.bodyImages).toEqual(['foto.svg'])
		})

		it('fails a <ViertelTeaser id> that points to an unknown Viertel, naming the file and the ID', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'body-viertel-teaser-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('index.mdx')
				expect(validationError.field).toBe('ViertelTeaser.id')
				expect(validationError.reason).toContain('stadt/nichtvorhanden')
			}
		})

		it('fails a relative body image that does not exist, naming the file and the path', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'body-image-missing'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('index.mdx')
				expect(validationError.field).toBe('(body-image)')
				expect(validationError.reason).toContain('./fehlt.jpg')
			}
		})
	})

	describe('Translations (issue #36)', () => {
		it("inherits a Viertel's number and ID from the German document, taking Leitsatz and Steckbrief from the translation when present", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			const german = graph.getViertel('stadt/erste-viertel')
			const translated = graph.getViertel('stadt/erste-viertel', 'xx')

			expect(german?.number).toBe(1)
			expect(translated?.id).toBe(german?.id)
			expect(translated?.number).toBe(german?.number)
			// title isn't set by the translation, so it falls back to German.
			expect(translated?.title).toBe(german?.title)
			expect(translated?.leitsatz).toBe('Translated leitsatz.')
			expect(translated?.steckbrief.prozessansatz).toBe('Translated prozessansatz.')
			expect(translated?.steckbrief.bauform).toBe('Translated bauform.')
			expect(translated?.body).toContain('Translated Testinhalt.')
			expect(translated?.url).toBe('/xx/stadt/translated-viertel')
		})

		it('resolves a translated Viertel slug to its prefixed localized URL, and lists it among the localized Viertel', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			expect(graph.getLocalizedViertel('xx').map((viertel) => viertel.id)).toEqual([
				'stadt/erste-viertel',
			])

			const resolved = graph.resolveUrl('/xx/stadt/translated-viertel')
			expect(resolved?.kind).toBe('viertel')
			expect(resolved?.kind === 'viertel' && resolved.viertel.id).toBe('stadt/erste-viertel')
			expect(resolved?.locale).toBe('xx')

			// The German Viertel's own URL is unaffected by the translation.
			const german = graph.resolveUrl('/stadt/erste-viertel')
			expect(german?.kind).toBe('viertel')
			expect(german?.locale).toBeUndefined()
		})

		it('falls back to the German document when a locale has no translation', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			const fallback = graph.getSeite('ohne-uebersetzung', 'xx')
			expect(fallback?.title).toBe('Ohne Übersetzung')
			expect(fallback?.description).toBe('Platzhalter für Tests.')
			expect(fallback?.body).toContain('Deutscher Testinhalt.')
			expect(fallback?.url).toBe('/xx/ohne-uebersetzung')
		})

		it('uses a translated slug for a prefixed localized URL, and the translated body', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			const translated = graph.getSeite('mit-uebersetzung', 'xx')
			expect(translated?.title).toBe('With translation')
			expect(translated?.description).toBe('Placeholder for tests.')
			expect(translated?.body).toContain('Translated body.')
			expect(translated?.url).toBe('/xx/with-translation')

			// The German document and its URL are unaffected by the translation.
			const german = graph.getSeite('mit-uebersetzung')
			expect(german?.title).toBe('Mit Übersetzung')
			expect(german?.body).toContain('Deutscher Testinhalt.')
			expect(german?.url).toBe('/mit-uebersetzung')
		})

		it("uses a translated slug for the root Seite's own prefixed URL, instead of dropping it", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			const translated = graph.getSeite('', 'xx')
			expect(translated?.url).toBe('/xx/start')
		})

		it('has no configured locales, and no prefixed Seiten, by default', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'valid'))

			expect(graph.locales).toEqual([])
			expect(graph.getLocalizedSeiten('xx')).toEqual([])
			expect(graph.getSeite('kontakt', 'xx')).toBeUndefined()
		})

		it('fails when a translation sets a non-translatable field, naming the file and the field', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'translation-invalid-field'), { locales: ['xx'] })
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe('index.xx.mdx')
				expect(validationError.field).toBe('draft')
				expect(validationError.reason).toMatch(/translatable/i)
			}
		})
	})
})
