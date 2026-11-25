import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ContentValidationError } from './errors'
import { buildContentGraph } from './graph'
import { flattenNavigation } from './sitemap'

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

			expect(flattenNavigation(graph.sitemap)).toEqual([
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

			expect(flattenNavigation(graph.sitemap).map((item) => item.id)).toEqual([
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

		it('resolves a grouped Menu to labelled groups of links', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'menu-groups-valid'))

			expect(graph.getMenu('footer')).toEqual([
				{
					label: 'Entdecken',
					links: [
						{ url: '/mit-kurztitel', label: 'Kurz' },
						{ url: 'https://extern.example.com', label: 'Extern' },
					],
				},
				{ label: 'Lesen', links: [{ url: '/ohne-kurztitel', label: 'Testseite ohne Kurztitel' }] },
			])
		})

		it('fails when a Menu mixes Menu entries and Menu groups', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-groups-mixed'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.reason).toMatch(/mix/i)
			}
		})

		it('fails when a Menu group is empty', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-groups-empty'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.reason).toMatch(/no entries/i)
			}
		})

		it('fails when a Menu group entry lists an unknown ID, the same way a flat entry does', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-groups-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.field).toBe('nichtvorhanden')
				expect(validationError.reason).toMatch(/unknown|no matching/i)
			}
		})

		it('fails when a Menu group entry references a Draft in production, the same way a flat entry does', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-groups-draft'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.field).toBe('entwurf')
				expect(validationError.reason).toContain(path.join('entwurf', 'index.mdx'))
			}
		})

		it('fails when header, which must resolve flat, is grouped instead', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'menu-shape-mismatch'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('menus', 'header.json'))
				expect(validationError.reason).toMatch(/flat/i)
			}
		})
	})

	describe('Viertel and Zentrum', () => {
		it('numbers the Viertel by their position in stadt/meta.json, ignoring any frontmatter number', () => {
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

		it('accepts an optional Untertitel, independent of its Hinweis', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.getViertel('stadt/erste-viertel')?.untertitel).toBe('Platzhalter-Untertitel.')
			// zweite-viertel sets neither; both stay optional.
			expect(graph.getViertel('stadt/zweite-viertel')?.untertitel).toBeUndefined()
		})

		it("resolves a Viertel's Hinweis to the target's Short title, falling back to its title, and its URL", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.getViertel('stadt/erste-viertel')?.hinweis).toEqual({
				shortTitle: 'Idee',
				url: '/idee',
			})
			// zweite-viertel sets no hinweisId; it stays undefined rather than
			// resolving to something.
			expect(graph.getViertel('stadt/zweite-viertel')?.hinweis).toBeUndefined()
		})

		it('loads the Zentrum as its own type, not a Viertel and with no number', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.zentrum?.id).toBe('stadt/zentrum')
			expect(graph.zentrum?.url).toBe('/stadt/zentrum')
			expect(graph.zentrum?.title).toBe('Zentrum')
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
				expect(validationError.file).toBe(path.join('stadt', 'meta.json'))
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
				expect(validationError.file).toBe(path.join('stadt', 'meta.json'))
				expect(validationError.field).toBe('stadt/erste-viertel')
				expect(validationError.reason).toMatch(/missing/i)
			}
		})

		it("fails when a Viertel's Hinweis references an unknown ID, naming the file, field and ID", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'hinweis-unknown-id'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('stadt', 'erste-viertel', 'index.mdx'))
				expect(validationError.field).toBe('hinweisId')
				expect(validationError.reason).toContain('nichtvorhanden')
			}
		})

		it("fails when a published Viertel's Hinweis references a Draft, naming both files", () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'hinweis-draft'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('stadt', 'erste-viertel', 'index.mdx'))
				expect(validationError.field).toBe('hinweisId')
				expect(validationError.reason).toContain(path.join('entwurf', 'index.mdx'))
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

		it('accepts an optional Untertitel on a Kapitel and Leitsatz/Jahr on an Abschnitt', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))

			expect(graph.getKapitel('leitthema/erstes-kapitel')?.untertitel).toBe(
				'Platzhalter-Untertitel.',
			)
			expect(graph.getKapitel('leitthema/zweites-kapitel')?.untertitel).toBeUndefined()

			const abschnitt = graph.getAbschnitt('leitthema/erstes-kapitel/erster-abschnitt')
			expect(abschnitt?.leitsatz).toBe('Platzhalter-Leitsatz.')
			expect(abschnitt?.jahr).toBe(1996)
			expect(
				graph.getAbschnitt('leitthema/erstes-kapitel/zweiter-abschnitt')?.leitsatz,
			).toBeUndefined()
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

			expect(graph.getNext('leitthema/erstes-kapitel/zweiter-abschnitt')).toEqual({
				id: 'leitthema/zweites-kapitel/erster-abschnitt',
				url: '/stadt/zweite-viertel/kapitel-2/1',
				title: 'Erster Abschnitt',
			})
			expect(graph.getPrevious('leitthema/zweites-kapitel/erster-abschnitt')).toEqual({
				id: 'leitthema/erstes-kapitel/zweiter-abschnitt',
				url: '/stadt/erste-viertel/kapitel-1/2',
				title: 'Zweiter Abschnitt',
			})

			expect(graph.getPrevious('leitthema/erstes-kapitel/erster-abschnitt')).toBeUndefined()
			expect(graph.getNext('leitthema/zweites-kapitel/zweiter-abschnitt')).toBeUndefined()
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

			expect(graph.getNext('rundgaenge/besuch-im-zentrum/station-zentrum')).toEqual({
				id: 'rundgaenge/besuch-im-zentrum/station-eins',
				url: '/rundgaenge/besuch-im-zentrum/1',
				title: 'Erste Station',
			})
			expect(graph.getPrevious('rundgaenge/besuch-im-zentrum/station-zentrum')).toBeUndefined()
			expect(graph.getNext('rundgaenge/besuch-im-zentrum/station-zwei')).toBeUndefined()

			// ohne-zentrum's first Station has no previous, even though
			// besuch-im-zentrum's own Stationen come right before it in the list.
			expect(graph.getPrevious('rundgaenge/ohne-zentrum/station-a')).toBeUndefined()
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
			expect(translated?.untertitel).toBe('Translated untertitel.')
			expect(translated?.body).toContain('Translated Testinhalt.')
			expect(translated?.url).toBe('/xx/stadt/translated-viertel')
		})

		it('resolves a translated Viertel slug to its prefixed localized URL, and lists it among the localized documents', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'translation-valid'), {
				locales: ['xx'],
			})

			expect(
				graph
					.getLocalizedDocuments('xx')
					.filter((entry) => entry.kind === 'viertel')
					.map((entry) => entry.document.id),
			).toEqual(['stadt/erste-viertel'])

			const resolved = graph.resolveUrl('/xx/stadt/translated-viertel')
			expect(resolved?.kind).toBe('viertel')
			expect(resolved?.document.id).toBe('stadt/erste-viertel')
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
			expect(graph.getLocalizedDocuments('xx')).toEqual([])
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
	describe('Drafts on every type (issue #33)', () => {
		const dir = path.join(fixturesDir, 'drafts-all-types')
		const production = buildContentGraph(dir)
		const dev = buildContentGraph(dir, { development: true })
		function ids(documents: readonly { readonly id: string }[]) {
			return documents.map((item) => item.id)
		}

		function failure(contentDir: string, options = {}): ContentValidationError {
			try {
				buildContentGraph(path.join(fixturesDir, contentDir), options)
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				return error as ContentValidationError
			}
			throw new Error(`${contentDir}: expected a ContentValidationError`)
		}

		it('defaults draft to false on every type', () => {
			expect(production.viertel.every((item) => !item.draft)).toBe(true)
			expect(production.aufsaetze[0].draft).toBe(false)
			expect(production.getRundgang('rundgaenge/r-a')?.draft).toBe(false)
		})

		it('hides a Draft of every type from the production lists and getters, and shows it in dev', () => {
			expect(ids(production.viertel)).toEqual(['stadt/v-a', 'stadt/v-c'])
			expect(ids(dev.viertel)).toEqual(['stadt/v-a', 'stadt/v-b', 'stadt/v-c'])
			expect(production.getViertel('stadt/v-b')).toBeUndefined()
			expect(dev.getViertel('stadt/v-b')?.draft).toBe(true)

			expect(ids(production.aufsaetze)).toEqual(['bibliothek/aufsaetze/a-pub'])
			expect(ids(dev.aufsaetze)).toHaveLength(3)
			expect(production.getAufsatz('bibliothek/aufsaetze/a-draft')).toBeUndefined()

			expect(ids(production.kapitel)).toEqual(['leitthema/k-a'])
			expect(ids(dev.kapitel)).toEqual(['leitthema/k-a', 'leitthema/k-b'])
			expect(ids(production.themen)).toEqual(['themen/t-ort', 'themen/t-pub'])
			expect(ids(dev.themen)).toHaveLength(3)
			expect(ids(production.rundgaenge)).toEqual(['rundgaenge/r-a'])
			expect(ids(dev.rundgaenge)).toEqual(['rundgaenge/r-a', 'rundgaenge/r-b'])
			expect(production.getAbschnitt('leitthema/k-a/ab-2')).toBeUndefined()
			expect(production.getStation('rundgaenge/r-a/s-2')).toBeUndefined()
		})

		it('numbers the published Viertel without gaps, and a Draft takes its number in dev only', () => {
			expect(production.viertel.map((item) => item.number)).toEqual([1, 2])
			expect(production.getViertel('stadt/v-c')?.number).toBe(2)
			expect(production.getViertel('stadt/v-c')?.url).toBe('/stadt/v-c')
			expect(dev.getViertel('stadt/v-c')?.number).toBe(3)
		})

		it('counts Abschnitte and numbers them without gaps, leaving a Draft out', () => {
			const abschnitte = production.getAbschnitteByKapitel('leitthema/k-a')
			expect(ids(abschnitte)).toEqual(['leitthema/k-a/ab-1', 'leitthema/k-a/ab-3'])
			expect(abschnitte.map((item) => item.number)).toEqual(['1.1', '1.2'])
			expect(abschnitte.map((item) => item.url)).toEqual([
				'/stadt/v-a/kapitel-1/1',
				'/stadt/v-a/kapitel-1/2',
			])
			expect(dev.getAbschnitteByKapitel('leitthema/k-a').map((item) => item.number)).toEqual([
				'1.1',
				'1.2',
				'1.3',
			])
			expect(production.getAbschnitteByKapitel('leitthema/k-b')).toEqual([])
		})

		it('counts Stationen and numbers them from the Zentrum without gaps, leaving a Draft out', () => {
			const rundgang = production.getRundgang('rundgaenge/r-a')
			expect(rundgang?.stationenCount).toBe(2)
			const stationen = production.getStationenByRundgang('rundgaenge/r-a')
			expect(stationen.map((item) => item.number)).toEqual([0, 1])
			expect(stationen.map((item) => item.url)).toEqual(['/rundgaenge/r-a/0', '/rundgaenge/r-a/1'])
			expect(dev.getRundgang('rundgaenge/r-a')?.stationenCount).toBe(3)
			expect(production.getStationenByRundgang('rundgaenge/r-b')).toEqual([])
		})

		it('hides a Draft from the related lists', () => {
			expect(ids(production.getAufsaetzeByViertel('stadt/v-a'))).toEqual([
				'bibliothek/aufsaetze/a-pub',
			])
			expect(ids(dev.getAufsaetzeByViertel('stadt/v-a'))).toEqual([
				'bibliothek/aufsaetze/a-draft',
				'bibliothek/aufsaetze/a-pub',
			])
			expect(ids(production.getStationenByOrt('stadt/v-a'))).toEqual(['rundgaenge/r-a/s-3'])
			expect(ids(dev.getStationenByOrt('stadt/v-a'))).toEqual([
				'rundgaenge/r-a/s-2',
				'rundgaenge/r-a/s-3',
			])
			expect(ids(production.getThemenByKapitel('leitthema/k-a'))).toEqual(['themen/t-ort'])
			expect(ids(dev.getThemenByKapitel('leitthema/k-a'))).toEqual([
				'themen/t-draft',
				'themen/t-ort',
			])
			expect(production.getKapitelByViertel('stadt/v-c')).toBeUndefined()
			expect(dev.getKapitelByViertel('stadt/v-c')?.id).toBe('leitthema/k-b')
		})

		it('hides a Draft from Navigation, breadcrumbs and previous/next', () => {
			expect(production.getBreadcrumbs('stadt/v-b')).toEqual([])
			expect(dev.getBreadcrumbs('stadt/v-b').map((link) => link.id)).toEqual([
				'',
				'stadt',
				'stadt/v-b',
			])
			expect(production.getNext('stadt/v-a')).toEqual({
				id: 'stadt/v-c',
				url: '/stadt/v-c',
				title: 'Viertel C',
				number: 2,
			})
			expect(dev.getNext('stadt/v-a')?.id).toBe('stadt/v-b')
			expect(production.getNext('leitthema/k-a/ab-1')?.id).toBe('leitthema/k-a/ab-3')
			expect(dev.getNext('leitthema/k-a/ab-1')?.id).toBe('leitthema/k-a/ab-2')
			expect(production.getNext('rundgaenge/r-a/s-1')?.id).toBe('rundgaenge/r-a/s-3')
		})

		it('skips a Draft Viertel as a previous/next neighbour, leaving the remaining numbers as assigned', () => {
			expect(production.getNext('stadt/v-a')).toMatchObject({ id: 'stadt/v-c', number: 2 })
			expect(production.getPrevious('stadt/v-c')).toMatchObject({ id: 'stadt/v-a', number: 1 })
			expect(dev.getNext('stadt/v-a')).toMatchObject({ id: 'stadt/v-b', number: 2 })
			expect(dev.getNext('stadt/v-b')).toMatchObject({ id: 'stadt/v-c', number: 3 })
		})

		it('hides a Draft from resolveUrl', () => {
			expect(production.resolveUrl('/stadt/v-b')).toBeUndefined()
			expect(production.resolveUrl('/stadt/v-c')?.kind).toBe('viertel')
			expect(dev.resolveUrl('/stadt/v-b')?.kind).toBe('viertel')
			expect(production.resolveUrl('/rundgaenge/r-b')).toBeUndefined()
		})

		it('keeps a Draft out of the Sitemap, in or out of dev', () => {
			const expected = [
				'',
				'rundgaenge',
				'rundgaenge/r-a',
				'rundgaenge/r-a/s-1',
				'rundgaenge/r-a/s-3',
				'stadt',
				'stadt/zentrum',
				'stadt/v-a',
				'stadt/v-c',
				'themen',
				'themen/t-ort',
				'themen/t-pub',
				'bibliothek/aufsaetze/a-pub',
				'leitthema/k-a',
				'leitthema/k-a/ab-1',
				'leitthema/k-a/ab-3',
			]
			expect(ids(flattenNavigation(production.sitemap))).toEqual(expected)
			// In dev the Viertel are numbered with their Drafts, so the published
			// ones' URLs can differ, but the same documents are listed.
			expect(ids(flattenNavigation(dev.sitemap))).toEqual(expected)
		})

		it('hides a Draft from Menus: an entry naming one fails in production only', () => {
			const error = failure('menu-draft')
			expect(error.file).toBe(path.join('menus', 'header.json'))
			expect(error.reason).toContain(path.join('entwurf', 'index.mdx'))
		})

		it('fails a published Aufsatz referencing a Draft Viertel, naming both files', () => {
			const error = failure('draft-ref-aufsatz')
			expect(error.file).toBe(path.join('bibliothek', 'aufsaetze', 'publiziert', 'index.mdx'))
			expect(error.field).toBe('viertelId')
			expect(error.reason).toContain(path.join('stadt', 'entwurf', 'index.mdx'))
			expect(() =>
				buildContentGraph(path.join(fixturesDir, 'draft-ref-aufsatz'), { development: true }),
			).not.toThrow()
		})

		it('fails a published body component naming a Draft Viertel, naming both files', () => {
			const error = failure('draft-ref-body')
			expect(error.file).toBe(path.join('idee', 'index.mdx'))
			expect(error.field).toBe('ViertelTeaser.id')
			expect(error.reason).toContain(path.join('stadt', 'entwurf', 'index.mdx'))
		})

		it('fails a published Station standing at a Draft Zentrum', () => {
			const error = failure('draft-ref-station')
			expect(error.file).toBe(path.join('rundgaenge', 'r', 's', 'index.mdx'))
			expect(error.field).toBe('ortId')
			expect(error.reason).toContain(path.join('stadt', 'zentrum', 'index.mdx'))
		})

		it('fails a published Abschnitt inside a Draft Kapitel, naming both files', () => {
			const error = failure('draft-ref-parent')
			expect(error.file).toBe(path.join('leitthema', 'k', 'ab', 'index.mdx'))
			expect(error.field).toBe('(parent)')
			expect(error.reason).toContain(path.join('leitthema', 'k', 'index.mdx'))
		})

		it('exposes no Zentrum in production while it is a Draft', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'draft-ref-station'), {
				development: true,
			})
			expect(graph.zentrum?.draft).toBe(true)
		})

		it('still validates a Draft of a non-Seite type in full', () => {
			expect(failure('draft-invalid-viertel').field).toBe('leitsatz')
			expect(failure('draft-invalid-viertel', { development: true }).field).toBe('leitsatz')
		})
	})

	describe('Menus naming any type (issue #23)', () => {
		it('resolves an entry naming a Viertel or the Zentrum to its URL and Short title or title', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'menu-any-type'))

			expect(graph.getMenu('header')).toEqual([
				{ url: '/stadt/ein-viertel', label: 'Viertelkurz' },
				{ url: '/stadt/zentrum', label: 'Zentrum' },
			])
		})
	})

	describe('Translations of every type (issue #36)', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'translation-all-types'), {
			locales: ['xx'],
		})

		it('validates and localizes an Aufsatz, with a prefixed URL under the translated area slug', () => {
			const aufsatz = graph.getAufsatz('bibliothek/aufsaetze/ein-aufsatz', 'xx')
			expect(aufsatz?.title).toBe('Translated Aufsatz')
			expect(aufsatz?.body).toContain('Translated body.')
			expect(aufsatz?.url).toBe('/xx/bibliothek/aufsaetze/an-essay')
			expect(aufsatz?.viertelId).toBe('stadt/erste-viertel')
			expect(graph.getAufsatz('bibliothek/aufsaetze/ein-aufsatz')?.url).toBe(
				'/bibliothek/aufsaetze/ein-aufsatz',
			)
		})

		it("uses an ancestor Seite's translated slug wherever the URL contains it", () => {
			expect(graph.getViertel('stadt/erste-viertel', 'xx')?.url).toBe('/xx/city/first-quarter')
			expect(graph.getSeite('stadt', 'xx')?.url).toBe('/xx/city')
			expect(
				graph.getLocalizedDocuments('xx').find((entry) => entry.kind === 'zentrum')?.document.url,
			).toBe('/xx/city/zentrum')
		})

		it("builds a Kapitel's, Abschnitt's and Station's URL from their translated parent", () => {
			expect(graph.getKapitel('leitthema/ein-kapitel', 'xx')?.url).toBe(
				'/xx/city/first-quarter/kapitel-1',
			)
			expect(graph.getKapitel('leitthema/ein-kapitel', 'xx')?.title).toBe('Translated Kapitel')
			expect(graph.getKapitel('leitthema/ein-kapitel', 'xx')?.untertitel).toBe(
				'Translated untertitel.',
			)
			const abschnitt = graph.getAbschnitt('leitthema/ein-kapitel/ein-abschnitt', 'xx')
			expect(abschnitt?.url).toBe('/xx/city/first-quarter/kapitel-1/1')
			expect(abschnitt?.leitsatz).toBe('Translated leitsatz.')
			expect(abschnitt?.jahr).toBe(1997)
			expect(graph.getStation('rundgaenge/ein-rundgang/eine-station', 'xx')?.url).toBe(
				'/xx/rundgaenge/ein-rundgang/a-station',
			)
		})

		it('falls back to the German document where a locale has no translation', () => {
			const fallback = graph.getAufsatz('bibliothek/aufsaetze/ohne-uebersetzung', 'xx')
			expect(fallback?.title).toBe('Ohne Übersetzung')
			expect(fallback?.url).toBe('/xx/bibliothek/aufsaetze/ohne-uebersetzung')
		})

		it('resolves a localized URL of any type, and lists every type among the localized documents', () => {
			const resolved = graph.resolveUrl('/xx/rundgaenge/ein-rundgang/a-station')
			expect(resolved?.kind).toBe('station')
			expect(resolved?.document.id).toBe('rundgaenge/ein-rundgang/eine-station')
			expect(resolved?.locale).toBe('xx')

			const kinds = new Set(graph.getLocalizedDocuments('xx').map((entry) => entry.kind))
			expect([...kinds].sort()).toEqual(
				[
					'abschnitt',
					'aufsatz',
					'kapitel',
					'rundgang',
					'seite',
					'station',
					'viertel',
					'zentrum',
				].sort(),
			)
			expect(graph.getLocalizedDocuments('xx').every((entry) => entry.locale === 'xx')).toBe(true)
		})

		it('fails a translation setting a non-translatable field of an Aufsatz, naming file and field', () => {
			expect.assertions(4)

			try {
				buildContentGraph(path.join(fixturesDir, 'translation-invalid-aufsatz'), {
					locales: ['xx'],
				})
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(
					path.join('bibliothek', 'aufsaetze', 'ein-aufsatz', 'index.xx.mdx'),
				)
				expect(validationError.field).toBe('viertelId')
				expect(validationError.reason).toMatch(/translatable/i)
			}
		})

		it('fails a translation file next to no document, instead of skipping it', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'translation-orphan'), { locales: ['xx'] })
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('idee', 'index.xx.mdx'))
				expect(validationError.field).toBe('(translation)')
			}
		})

		it('ignores a translation file of an unconfigured locale', () => {
			expect(() => buildContentGraph(path.join(fixturesDir, 'translation-orphan'))).not.toThrow()
		})

		it("validates a Draft's translation but exposes neither", () => {
			const draftGraph = buildContentGraph(path.join(fixturesDir, 'translation-draft'), {
				locales: ['xx'],
			})
			expect(draftGraph.getSeite('entwurf', 'xx')).toBeUndefined()
			expect(
				draftGraph
					.getLocalizedDocuments('xx')
					.filter((entry) => entry.kind === 'seite')
					.map((entry) => entry.document.id),
			).toEqual([''])
		})
	})

	describe('Viertel order from stadt/meta.json (issue #28)', () => {
		it('is not mistaken for a Seite order by Navigation', () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'stadt-valid'))

			expect(graph.viertel.map((item) => item.id)).toEqual([
				'stadt/erste-viertel',
				'stadt/zweite-viertel',
			])
			expect(graph.getSeite('stadt')).toBeDefined()
		})

		it('fails when stadt/meta.json is missing', () => {
			expect.assertions(3)

			try {
				buildContentGraph(path.join(fixturesDir, 'stadt-order-missing-file'))
			} catch (error) {
				expect(error).toBeInstanceOf(ContentValidationError)
				const validationError = error as ContentValidationError
				expect(validationError.file).toBe(path.join('stadt', 'meta.json'))
				expect(validationError.reason).toMatch(/not found/i)
			}
		})
	})

	describe('Sitemap nesting (issue #60)', () => {
		it("nests each type under its area's Seite, in the documented order", () => {
			const graph = buildContentGraph(path.join(fixturesDir, 'drafts-all-types'), {
				development: false,
			})
			const ids = flattenNavigation(graph.sitemap).map((link) => link.id)

			// Stadt's documents directly follow the Stadt Seite, before Themen.
			expect(ids.indexOf('stadt/zentrum')).toBe(ids.indexOf('stadt') + 1)
			expect(ids.indexOf('stadt/v-c')).toBeLessThan(ids.indexOf('themen'))
			// Each Kapitel is followed by its own Abschnitte.
			expect(ids.slice(ids.indexOf('leitthema/k-a'))).toEqual([
				'leitthema/k-a',
				'leitthema/k-a/ab-1',
				'leitthema/k-a/ab-3',
			])
		})
	})

	describe('Sitemap tree (issue #60)', () => {
		it('nests each type under its area as NavigationNode children', () => {
			const { sitemap } = buildContentGraph(path.join(fixturesDir, 'drafts-all-types'))
			function child(node: typeof sitemap, id: string) {
				const found = node.children.find((item) => item.id === id)
				if (!found) throw new Error(`no sitemap child ${id}`)
				return found
			}

			expect(sitemap.id).toBe('')
			expect(sitemap.children.map((item) => item.id)).toEqual([
				'rundgaenge',
				'stadt',
				'themen',
				'bibliothek/aufsaetze/a-pub',
				'leitthema/k-a',
			])
			expect(child(sitemap, 'stadt').children.map((item) => item.id)).toEqual([
				'stadt/zentrum',
				'stadt/v-a',
				'stadt/v-c',
			])
			expect(
				child(child(sitemap, 'rundgaenge'), 'rundgaenge/r-a').children.map((item) => item.id),
			).toEqual(['rundgaenge/r-a/s-1', 'rundgaenge/r-a/s-3'])
			expect(child(sitemap, 'leitthema/k-a').children.map((item) => item.id)).toEqual([
				'leitthema/k-a/ab-1',
				'leitthema/k-a/ab-3',
			])
		})
	})

	describe('Breadcrumbs, previous and next for every type (issue #23, #82)', () => {
		const graph = buildContentGraph(path.join(fixturesDir, 'leitthema-valid'))
		const rundgangGraph = buildContentGraph(path.join(fixturesDir, 'rundgang-valid'))
		const themaGraph = buildContentGraph(path.join(fixturesDir, 'thema-valid'))

		it('walks Start, Stadt-side ancestors and the Kapitel for an Abschnitt', () => {
			expect(
				graph.getBreadcrumbs('leitthema/erstes-kapitel/erster-abschnitt').map((link) => link.id),
			).toEqual([
				'',
				'stadt/erste-viertel',
				'leitthema/erstes-kapitel',
				'leitthema/erstes-kapitel/erster-abschnitt',
			])
		})

		it('walks Start, the Rundgang and the Station for a Station', () => {
			expect(
				rundgangGraph
					.getBreadcrumbs('rundgaenge/besuch-im-zentrum/station-eins')
					.map((link) => link.id),
			).toEqual(['', 'rundgaenge/besuch-im-zentrum', 'rundgaenge/besuch-im-zentrum/station-eins'])
		})

		it('links Kapitel to their neighbours in Kapitel number order', () => {
			expect(graph.getNext('leitthema/erstes-kapitel')).toEqual({
				id: 'leitthema/zweites-kapitel',
				url: '/stadt/zweite-viertel/kapitel-2',
				title: 'Zweites Kapitel',
			})
			expect(graph.getPrevious('leitthema/zweites-kapitel')?.id).toBe('leitthema/erstes-kapitel')
			expect(graph.getPrevious('leitthema/erstes-kapitel')).toBeUndefined()
			expect(graph.getNext('leitthema/zweites-kapitel')).toBeUndefined()
		})

		it('returns nothing for a type without a sequence, and for an unknown ID', () => {
			expect(graph.getNext('stadt/zentrum')).toBeUndefined()
			expect(graph.getPrevious('stadt/zentrum')).toBeUndefined()
			expect(graph.getBreadcrumbs('gibt-es-nicht')).toEqual([])
		})

		it("links Viertel to their neighbours in stadt/meta.json order, each neighbour's number set", () => {
			expect(graph.getNext('stadt/erste-viertel')).toEqual({
				id: 'stadt/zweite-viertel',
				url: '/stadt/zweite-viertel',
				title: 'Zweites Viertel',
				number: 2,
			})
			expect(graph.getPrevious('stadt/zweite-viertel')).toEqual({
				id: 'stadt/erste-viertel',
				url: '/stadt/erste-viertel',
				title: 'Erstes Viertel',
				number: 1,
			})
			expect(graph.getPrevious('stadt/erste-viertel')).toBeUndefined()
			expect(graph.getNext('stadt/zweite-viertel')).toBeUndefined()
		})

		it('links Rundgänge to their neighbours in resolved list order, carrying no number', () => {
			expect(rundgangGraph.getNext('rundgaenge/besuch-im-zentrum')).toEqual({
				id: 'rundgaenge/ohne-zentrum',
				url: '/rundgaenge/ohne-zentrum',
				title: 'Ohne Zentrum',
			})
			expect(rundgangGraph.getPrevious('rundgaenge/ohne-zentrum')?.id).toBe(
				'rundgaenge/besuch-im-zentrum',
			)
			expect(rundgangGraph.getPrevious('rundgaenge/besuch-im-zentrum')).toBeUndefined()
			expect(rundgangGraph.getNext('rundgaenge/ohne-zentrum')).toBeUndefined()
		})

		it('links Themen to their neighbours in resolved list order, carrying no number', () => {
			expect(themaGraph.getNext('themen/ein-themen-ort')).toEqual({
				id: 'themen/eine-welt-fuer-morgen',
				url: '/themen/eine-welt-fuer-morgen',
				title: 'Eine Welt für morgen',
			})
			expect(themaGraph.getPrevious('themen/eine-welt-fuer-morgen')?.id).toBe(
				'themen/ein-themen-ort',
			)
			expect(themaGraph.getPrevious('themen/ein-themen-ort')).toBeUndefined()
			expect(themaGraph.getNext('themen/eine-welt-fuer-morgen')).toBeUndefined()
		})
	})
})
