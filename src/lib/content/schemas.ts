import { z } from 'zod'

// The first content type (ADR-0002). Each type gets its own schema here as the
// content layer grows.
export const seiteFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
	// A Draft (glossary) is written and checked but not yet published: left
	// out of the Sitemap and sitemap.xml, issue #34.
	draft: z.boolean().default(false),
})

export type SeiteFrontmatter = z.infer<typeof seiteFrontmatterSchema>

// meta.json holds only an ordered list of child IDs (issue #26) — nothing else,
// so the schema is the list itself, not a wrapping object.
export const metaSchema = z.array(z.string().min(1))

// Site-wide facts (issue #27): one data file, read by the header, footer and
// metadata instead of each restating the same facts.
export const siteSchema = z.object({
	name: z.string().min(1),
	tagline: z.string().min(1),
	baseUrl: z.url(),
	copyright: z.string().min(1),
})

export type Site = z.infer<typeof siteSchema>

// A Menu entry (glossary: Menu) is either a content reference, whose label
// comes from the target, or an external link with its own label — a Menu
// never restates a content entry's label (issue #27).
const menuContentEntrySchema = z.strictObject({ id: z.string().min(1) })
const menuExternalEntrySchema = z.strictObject({ url: z.url(), label: z.string().min(1) })
export const menuEntrySchema = z.union([menuContentEntrySchema, menuExternalEntrySchema])
export type MenuEntry = z.infer<typeof menuEntrySchema>

export const menuSchema = z.array(menuEntrySchema)

// A Viertel's short profile (glossary: Steckbrief). Structured fields, not
// prose, so the Viertel page can render each one under its own label
// (issue #28).
export const viertelSteckbriefSchema = z.object({
	prozessansatz: z.string().min(1),
	bauform: z.string().min(1),
	prozessdokument: z.string().min(1),
	imStadtzentrum: z.string().min(1),
})

export type ViertelSteckbrief = z.infer<typeof viertelSteckbriefSchema>

// A Viertel's number comes from its position in the Viertel order file
// (loader.ts), never from frontmatter — there is deliberately no `number`
// field here, so one in a document's frontmatter is parsed and dropped.
export const viertelFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
	leitsatz: z.string().min(1),
	steckbrief: viertelSteckbriefSchema,
})

export type ViertelFrontmatter = z.infer<typeof viertelFrontmatterSchema>

// The Zentrum isn't a Viertel (glossary) and has no Leitsatz, Steckbrief or
// number — its frontmatter is the same shape as a Seite's.
export const zentrumFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
})

export type ZentrumFrontmatter = z.infer<typeof zentrumFrontmatterSchema>

// The Viertel order file (loader.ts) holds only an ordered list of Viertel
// IDs — the same shape as meta.json, but its own schema since it is a
// separate mechanism (issue #28): meta.json orders a folder's actual
// children for Navigation, while this file numbers the Viertel only, and
// never includes the Zentrum.
export const viertelOrderSchema = z.array(z.string().min(1))

// An Aufsatz (glossary) belongs to one Viertel, named by reference (issue
// #29): `viertelId` holds another document's ID, checked against the actual
// Viertel by `references.ts`, not here — a schema can't see the rest of the
// graph. The `...Id` suffix also keeps the value out of the spell check
// (cspell.json's frontmatter-identifier pattern).
export const aufsatzFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
	viertelId: z.string().min(1),
})

export type AufsatzFrontmatter = z.infer<typeof aufsatzFrontmatterSchema>

// A Kapitel (glossary) belongs to one Viertel, by reference (issue #30), the
// same reference shape as Aufsatz's viertelId. Its number and URL come from
// that Viertel (kapitel.ts), never from frontmatter.
export const kapitelFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
	viertelId: z.string().min(1),
})

export type KapitelFrontmatter = z.infer<typeof kapitelFrontmatterSchema>

// An Abschnitt (glossary) belongs to one Kapitel by its folder location, not
// by reference. Its position, number and URL come from the Kapitel's own
// meta.json order (abschnitt.ts), never from frontmatter.
export const abschnittFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
})

export type AbschnittFrontmatter = z.infer<typeof abschnittFrontmatterSchema>
