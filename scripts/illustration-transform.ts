// The pure half of the illustration export (issue #88): turns a Figma
// `Illustration / …` SVG export into the source of a drawing module.
// illustration-export.mts does the fetch and the write; this file touches
// neither the network nor the file system, so a test can feed it a fixture
// string.

// DESIGN.md "Illustration": the seven colours every drawing is built from,
// mapped to the Kartei theme tokens (theme.css). A path's `fill`/`stroke`
// becomes a `fill-`/`stroke-` class for the matching token; `none` stays
// literal; anything else is a design error the export must not paper over.
const TOKEN_BY_HEX: Record<string, string> = {
	'#DCEBE9': 'secondary',
	'#1F2421': 'foreground',
	'#FBFAF7': 'card',
	'#00676B': 'primary',
	'#3D5A80': 'chart-4',
	'#D6D1C5': 'border',
}

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

// Figma's `/v1/images` export sometimes writes an umlaut in an `id` as
// mojibake: the name's UTF-8 bytes, decoded a second time as Latin-1 (see
// illustration-transform.test.ts). Reversing that — bytes-as-Latin-1, then
// decoded as UTF-8 — is a no-op on plain ASCII and on a correctly-encoded
// name it produces U+FFFD, which is the signal to leave the value alone.
function fixMojibake(value: string): string {
	const repaired = Buffer.from(value, 'latin1').toString('utf8')
	return repaired.includes('�') ? value : repaired
}

const GERMAN_TRANSLITERATION: Record<string, string> = {
	ä: 'ae',
	Ä: 'Ae',
	ö: 'oe',
	Ö: 'Oe',
	ü: 'ue',
	Ü: 'Ue',
	ß: 'ss',
}

function transliterateGerman(value: string): string {
	return value.replace(/[äÄöÖüÜß]/g, (char) => GERMAN_TRANSLITERATION[char]!)
}

// The module's name comes from the exported group's own Figma layer name —
// its `id` is "Illustration / <section> / <Name>" — not from anything typed
// on the command line, so re-running the export on the same node reproduces
// the same module.
function deriveName(groupId: string): string {
	const label = groupId.split('/').pop()?.trim()
	if (!label) {
		throw new Error(`Illustration export: cannot derive a name from group id "${groupId}"`)
	}
	// Multi-word names ("Märkte & Kooperation") become one identifier.
	const words = transliterateGerman(fixMojibake(label))
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean)
	if (words.length === 0) {
		throw new Error(`Illustration export: cannot derive a name from group id "${groupId}"`)
	}
	return words.join('')
}

function colorToken(value: string): string | undefined {
	if (value.toLowerCase() === 'white') return 'primary-foreground'
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

function serializeElement(node: XmlElement, indent: string): string {
	const nodeLabel = node.attrs.id ?? node.tag
	const jsxAttrs = convertAttributes(node.attrs, nodeLabel)
	const attrsText = jsxAttrs
		.map(([name, value]) => ` ${name}="${escapeJsxAttributeValue(value)}"`)
		.join('')

	if (node.children.length === 0) {
		return `${indent}<${node.tag}${attrsText} />`
	}

	const childrenText = node.children
		.map((child) => serializeElement(child, `${indent}\t`))
		.join('\n')
	return `${indent}<${node.tag}${attrsText}>\n${childrenText}\n${indent}</${node.tag}>`
}

interface TransformedIllustration {
	/** The component's and the module's name, e.g. "Annaeherung". */
	name: string
	/** The output file's base name, e.g. "annaeherung". */
	slug: string
	/** The module source, ready to format and write. */
	source: string
}

function transformIllustrationSvg(svgSource: string): TransformedIllustration {
	const root = parseXml(svgSource)
	const group = findIllustrationGroup(root)
	if (!group) {
		throw new Error('Illustration export: no "Illustration / …" group found in the SVG')
	}

	const name = deriveName(group.attrs.id!)
	const slug = name.toLowerCase()
	const groupJsx = serializeElement(group, '\t\t\t')

	const source = `import type * as React from 'react'

function ${name}({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg data-slot="illustration-${slug}" role="img" aria-label={label} viewBox="0 0 240 240" {...props}>
${groupJsx}
		</svg>
	)
}

export { ${name} }
`

	return { name, slug, source }
}

export { transformIllustrationSvg }
