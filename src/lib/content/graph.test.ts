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
})
