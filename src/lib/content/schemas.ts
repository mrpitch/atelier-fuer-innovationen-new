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
