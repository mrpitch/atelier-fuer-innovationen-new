// The pure half of the illustration export (issue #88): turns a Figma
// `Illustration / …` SVG export into the source of a drawing module.
// illustration-export.mts does the fetch and the write; this file touches
// neither the network nor the file system, so a test can feed it a fixture
// string.

// docs/reference/design/kartei-design-system.md, Colors → Illustration: the
// seven colours every drawing is built from, mapped to the Kartei theme tokens
// (theme.css). White is only used on Petrol and maps to `primary-foreground`.
// A path's `fill`/`stroke` becomes a `fill-`/`stroke-` class for the matching token; `none` stays
// literal; anything else is a design error the export must not paper over.
const WHITE_TOKEN = 'primary-foreground'

const TOKEN_BY_HEX: Record<string, string> = {
	'#DCEBE9': 'secondary',
	'#1F2421': 'foreground',
	'#FBFAF7': 'card',
	'#00676B': 'primary',
	'#3D5A80': 'chart-4',
	'#D6D1C5': 'border',
}

// Every token a drawing's classes may name; the test helper builds its regex from this.
const ILLUSTRATION_TOKENS: readonly string[] = [...Object.values(TOKEN_BY_HEX), WHITE_TOKEN]

interface XmlElement {
	tag: string
	attrs: Record<string, string>
	children: XmlElement[]
}

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
}

function decodeXmlEntities(value: string): string {
	return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entity, body: string) => {
		if (body[0] === '#') {
			const codePoint =
				body[1] === 'x' ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10)
			return String.fromCodePoint(codePoint)
		}
		return NAMED_ENTITIES[body] ?? entity
	})
}

// A minimal XML parser for exactly the shape Figma's `/v1/images` SVG export
// produces: nested elements, quoted attributes, no text nodes, no CDATA. Not
// a general XML parser — the export script adds no XML/SVGR dependency for
// this one, narrow, well-known input shape.
function parseXml(source: string): XmlElement {
	let position = 0

	function skipWhitespace(): void {
		while (position < source.length && /\s/.test(source[position]!)) position++
	}

	function parseAttributes(): Record<string, string> {
		const attrs: Record<string, string> = {}
		while (true) {
			skipWhitespace()
			const next = source[position]
			if (next === undefined || next === '/' || next === '>') break

			const nameMatch = /^[A-Za-z_:][-A-Za-z0-9_:.]*/.exec(source.slice(position))
			if (!nameMatch) {
				throw new Error(`Illustration export: malformed attribute near position ${position}`)
			}
			const name = nameMatch[0]
			position += name.length
			skipWhitespace()
			if (source[position] !== '=') {
				throw new Error(`Illustration export: expected "=" after attribute "${name}"`)
			}
			position++
			skipWhitespace()
			const quote = source[position]
			if (quote !== '"' && quote !== "'") {
				throw new Error(`Illustration export: expected a quoted value for attribute "${name}"`)
			}
			position++
			const end = source.indexOf(quote, position)
			if (end === -1) {
				throw new Error(`Illustration export: unterminated value for attribute "${name}"`)
			}
			attrs[name] = decodeXmlEntities(source.slice(position, end))
			position = end + 1
		}
		return attrs
	}

	function parseElement(): XmlElement {
		skipWhitespace()
		if (source[position] !== '<') {
			throw new Error(`Illustration export: expected "<" near position ${position}`)
		}
		position++
		const tagMatch = /^[A-Za-z_][-A-Za-z0-9_]*/.exec(source.slice(position))
		if (!tagMatch) {
			throw new Error(`Illustration export: malformed tag near position ${position}`)
		}
		const tag = tagMatch[0]
		position += tag.length
		const attrs = parseAttributes()
		skipWhitespace()

		if (source[position] === '/' && source[position + 1] === '>') {
			position += 2
			return { tag, attrs, children: [] }
		}
		if (source[position] !== '>') {
			throw new Error(`Illustration export: expected ">" to close <${tag}>`)
		}
		position++

		const children: XmlElement[] = []
		while (true) {
			skipWhitespace()
			if (source[position] === '<' && source[position + 1] === '/') {
				position += 2
				const closeMatch = /^[A-Za-z_][-A-Za-z0-9_]*/.exec(source.slice(position))
				position += closeMatch?.[0].length ?? 0
				skipWhitespace()
				if (source[position] !== '>') {
					throw new Error(`Illustration export: expected ">" to close </${tag}>`)
				}
				position++
				break
			}
			children.push(parseElement())
		}
		return { tag, attrs, children }
	}

	skipWhitespace()
	if (source.startsWith('<?xml', position)) {
		const end = source.indexOf('?>', position)
		position = end === -1 ? position : end + 2
	}
	return parseElement()
}

// The `Illustration / …` group may sit directly under the root `<svg>`, or
// nested under a parent section's own wrapper — either way, everything else
// at or around it (that section's background, its border) is dropped.
function findIllustrationGroup(node: XmlElement): XmlElement | undefined {
	if (node.tag === 'g' && node.attrs.id?.startsWith('Illustration / ')) return node
	for (const child of node.children) {
		const found = findIllustrationGroup(child)
		if (found) return found
	}
	return undefined
}

function kebabToCamel(name: string): string {
	return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

// The module is named after the content ID it's registered under (issue #87:
// "each in its own module named after the ID"), never after the Figma layer:
// `stadt/maerkte-kooperation` becomes maerkte-kooperation.tsx exporting
// MaerkteKooperation.
function moduleNames(contentId: string): { name: string; slug: string } {
	const slug = contentId.split('/').pop() ?? ''
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		throw new Error(
			`Illustration export: content ID "${contentId}" doesn't end in a kebab-case slug`,
		)
	}
	const camel = kebabToCamel(slug)
	return { name: camel[0]!.toUpperCase() + camel.slice(1), slug }
}

function colorToken(value: string): string | undefined {
	if (value.toLowerCase() === 'white') return WHITE_TOKEN
	return TOKEN_BY_HEX[value.toUpperCase()]
}

function convertAttributes(attrs: Record<string, string>, nodeLabel: string): [string, string][] {
	const classes: string[] = []
	const jsxAttrs: [string, string][] = []

	for (const [name, value] of Object.entries(attrs)) {
		if (name === 'id') continue
		if (name === 'fill' || name === 'stroke') {
			if (value === 'none') {
				jsxAttrs.push([name, 'none'])
				continue
			}
			const token = colorToken(value)
			if (!token) {
				throw new Error(`Illustration export: unknown colour "${value}" on node "${nodeLabel}"`)
			}
			classes.push(`${name}-${token}`)
			continue
		}
		jsxAttrs.push([kebabToCamel(name), value])
	}

	// A stroke-only path relies on the root's default `fill: none` in the
	// Figma export; made explicit here so it can't flip if a caller passes a
	// `fill` prop into the wrapping <svg> (that prop must not cascade down).
	if (!('fill' in attrs) && 'stroke' in attrs) {
		jsxAttrs.unshift(['fill', 'none'])
	}

	if (classes.length > 0) jsxAttrs.push(['className', classes.join(' ')])

	return jsxAttrs
}

function escapeJsxAttributeValue(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

// The outer ring and ground line every drawing starts with (issue #90). When
// two adjacent paths match them exactly (ids aside), they are emitted as the
// shared <IllustrationFrame /> instead of inline; any difference keeps the
// paths inline.
const FRAME_RING_ATTRS: Record<string, string> = {
	d: 'M120 204C170.81 204 212 162.81 212 112C212 61.1898 170.81 20 120 20C69.1898 20 28 61.1898 28 112C28 162.81 69.1898 204 120 204Z',
	fill: '#DCEBE9',
}
const FRAME_GROUND_ATTRS: Record<string, string> = {
	d: 'M28 196H212',
	'stroke-width': '2',
	'stroke-linecap': 'round',
	'stroke-linejoin': 'round',
	stroke: '#1F2421',
}
const FRAME_ELEMENT = '<IllustrationFrame />'

function isPathWith(node: XmlElement | undefined, expected: Record<string, string>): boolean {
	if (!node || node.tag !== 'path' || node.children.length > 0) return false
	const actual = Object.entries(node.attrs).filter(([name]) => name !== 'id')
	return (
		actual.length === Object.keys(expected).length &&
		actual.every(([name, value]) => expected[name] === value)
	)
}

function serializeElement(node: XmlElement, indent: string): string {
	const nodeLabel = node.attrs.id ?? node.tag
	const jsxAttrs = convertAttributes(node.attrs, nodeLabel)
	const attrsText = jsxAttrs
		.map(([name, value]) => ` ${name}="${escapeJsxAttributeValue(value)}"`)
		.join('')

	if (node.children.length === 0) {
		return `${indent}<${node.tag}${attrsText} />`
	}

	const childrenText = serializeChildren(node.children, `${indent}\t`)
	return `${indent}<${node.tag}${attrsText}>\n${childrenText}\n${indent}</${node.tag}>`
}

function serializeChildren(children: XmlElement[], indent: string): string {
	const lines: string[] = []
	for (let i = 0; i < children.length; i++) {
		if (
			isPathWith(children[i], FRAME_RING_ATTRS) &&
			isPathWith(children[i + 1], FRAME_GROUND_ATTRS)
		) {
			lines.push(`${indent}${FRAME_ELEMENT}`)
			i++
			continue
		}
		lines.push(serializeElement(children[i]!, indent))
	}
	return lines.join('\n')
}

interface TransformedIllustration {
	/** The component's name, e.g. "MaerkteKooperation". */
	name: string
	/** The output file's base name, e.g. "maerkte-kooperation". */
	slug: string
	/** The module source, ready to format and write. */
	source: string
	/** The module's test source, ready to format and write next to it. */
	testSource: string
}

// The per-drawing test every module gets (testing-conventions: one test file
// per component). The shared token-colour contract lives in
// expect-token-coloured-svg.ts; the label is a stand-in, since the real title
// belongs to the content document and the registry test covers that.
function drawingTestSource(name: string, slug: string): string {
	return `import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { expectTokenColouredSvg } from './expect-token-coloured-svg'
import { ${name} } from './${slug}'

describe('${name}', () => {
	it('renders the drawing as an accessible, token-coloured svg', () => {
		const html = renderToStaticMarkup(<${name} label="Beschriftung" />)

		expect(html).toContain('data-slot="illustration-${slug}"')
		expect(html).toContain('aria-label="Beschriftung"')
		expectTokenColouredSvg(html)
	})

	it('passes extra svg props through to the root element', () => {
		const html = renderToStaticMarkup(<${name} label="Beschriftung" data-testid="probe" />)

		expect(html).toContain('data-testid="probe"')
	})
})
`
}

function transformIllustrationSvg(svgSource: string, contentId: string): TransformedIllustration {
	const root = parseXml(svgSource)
	const group = findIllustrationGroup(root)
	if (!group) {
		throw new Error('Illustration export: no "Illustration / …" group found in the SVG')
	}

	const { name, slug } = moduleNames(contentId)
	const groupJsx = serializeElement(group, '\t\t\t')

	const frameImport = groupJsx.includes(FRAME_ELEMENT)
		? "\nimport { IllustrationFrame } from './illustration-frame'\n"
		: ''

	const source = `import type * as React from 'react'
${frameImport}

function ${name}({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg data-slot="illustration-${slug}" role="img" aria-label={label} viewBox="0 0 240 240" {...props}>
${groupJsx}
		</svg>
	)
}

export { ${name} }
`

	return { name, slug, source, testSource: drawingTestSource(name, slug) }
}

export { drawingTestSource, ILLUSTRATION_TOKENS, transformIllustrationSvg }
