import { z } from 'zod'

// Every content type's frontmatter starts from these four fields (ADR-0002),
// so a Draft (glossary) can be set on any type (issue #33): written and
// checked but not yet published. A production build or content:check leaves a
// Draft out of every list, count, Menu, the Sitemap and the build itself;
// `next dev` is the one place it still renders (graph.ts's `development`
// option).
const baseShape = {
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
	draft: z.boolean().default(false),
}

// A quote with its source (issue #124): `zusatz` is the speaker's role or the
// quote's origin, not the quote itself. The Leitthema's `zitat` and the
// Startseite's (issue #129, epic #128) share this one shape instead of each
// declaring their own text/quelle/zusatz fields.
export const zitatSchema = z.object({
	text: z.string().min(1),
	quelle: z.string().min(1),
	zusatz: z.string().min(1).optional(),
})

export type Zitat = z.infer<typeof zitatSchema>

// The first content type (ADR-0002). Each type gets its own schema here as the
// content layer grows.
//
// `tagline`, `heading` and `intro` are the Start document's own Hero copy,
// and `zitat` its own testimonial, in the shared Zitat shape above (issue
// #129, epic #128). All four are optional on every Seite, since the schema
// can't tell the root Seite (the Start document, ID `''`) from any other by
// its frontmatter alone; only the Startseite reads `heading`, `intro` and
// `zitat`. The Sitemap Seite's own Seitenkopf (issue #136) reads `tagline`
// too, as its kicker.
export const seiteFrontmatterSchema = z.object({
	...baseShape,
	tagline: z.string().min(1).optional(),
	heading: z.string().min(1).optional(),
	intro: z.string().min(1).optional(),
	zitat: zitatSchema.optional(),
})

export type SeiteFrontmatter = z.infer<typeof seiteFrontmatterSchema>

// meta.json holds only an ordered list of child IDs (issue #26) — nothing else,
// so the schema is the list itself, not a wrapping object. The same schema
// reads every order file: a folder's Seite order, the Viertel order
// (stadt/meta.json) and a Kapitel's Abschnitt order.
export const metaSchema = z.array(z.string().min(1))

// A Rundgang's Station order: the same list, but never empty. A Rundgang with
// no Station has nowhere to start ("Rundgang starten") and no Route.
export const stationOrderSchema = metaSchema.min(1, 'lists no Station')

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
// never restates a content entry's label (issue #27). A content entry may
// name any content type's document.
const menuContentEntrySchema = z.strictObject({ id: z.string().min(1) })
const menuExternalEntrySchema = z.strictObject({ url: z.url(), label: z.string().min(1) })
export const menuEntrySchema = z.union([menuContentEntrySchema, menuExternalEntrySchema])
export type MenuEntry = z.infer<typeof menuEntrySchema>

// A Menu group (glossary: Menu group): a label with its own ordered,
// non-empty list of Menu entries, such as a footer column (issue #79). A
// Menu holds either entries or groups, never both — menuSchema's superRefine
// below is what enforces that, since the two shapes don't otherwise overlap.
export const menuGroupSchema = z.strictObject({
	label: z.string().min(1),
	entries: z.array(menuEntrySchema).min(1, 'menu group has no entries'),
})
export type MenuGroup = z.infer<typeof menuGroupSchema>

const menuItemSchema = z.union([menuEntrySchema, menuGroupSchema])
export type MenuItem = z.infer<typeof menuItemSchema>

export function isMenuGroup(item: MenuItem): item is MenuGroup {
	return 'entries' in item
}

export function isMenuEntry(item: MenuItem): item is MenuEntry {
	return !isMenuGroup(item)
}

export const menuSchema = z.array(menuItemSchema).superRefine((items, ctx) => {
	const groupCount = items.filter(isMenuGroup).length
	if (groupCount > 0 && groupCount < items.length) {
		ctx.addIssue({ code: 'custom', message: 'menu mixes Menu entries and Menu groups' })
	}
})

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

// A Viertel's number comes from its position in stadt/meta.json
// (loader.ts), never from frontmatter — there is deliberately no `number`
// field here, so one in a document's frontmatter is parsed and dropped.
//
// `hinweisId` (issue #93) is an optional reference to a document of any type
// (the same any-type reference Menus use, references.ts's
// resolveAnyReference), resolved to that document's Short title and URL for
// the Viertel page's Hinweis link. `untertitel` is the Viertel's own
// subtitle, independent of it.
export const viertelFrontmatterSchema = z.object({
	...baseShape,
	leitsatz: z.string().min(1),
	steckbrief: viertelSteckbriefSchema,
	untertitel: z.string().min(1).optional(),
	hinweisId: z.string().min(1).optional(),
})

export type ViertelFrontmatter = z.infer<typeof viertelFrontmatterSchema>

// The Zentrum isn't a Viertel (glossary) and has no Leitsatz, Steckbrief or
// number — its frontmatter is the same shape as a Seite's.
export const zentrumFrontmatterSchema = z.object(baseShape)

export type ZentrumFrontmatter = z.infer<typeof zentrumFrontmatterSchema>

// An Aufsatz (glossary) belongs to one Viertel, named by reference (issue
// #29): `viertelId` holds another document's ID, checked against the actual
// Viertel by `references.ts`, not here — a schema can't see the rest of the
// graph. The `...Id` suffix also keeps the value out of the spell check
// (cspell.json's frontmatter-identifier pattern).
export const aufsatzFrontmatterSchema = z.object({
	...baseShape,
	viertelId: z.string().min(1),
})

export type AufsatzFrontmatter = z.infer<typeof aufsatzFrontmatterSchema>

// A Kapitel (glossary) belongs to one Viertel, by reference (issue #30), the
// same reference shape as Aufsatz's viertelId. Its number and URL come from
// that Viertel (kapitel.ts), never from frontmatter. `untertitel` (issue #93)
// is its own optional subtitle.
export const kapitelFrontmatterSchema = z.object({
	...baseShape,
	viertelId: z.string().min(1),
	untertitel: z.string().min(1).optional(),
})

export type KapitelFrontmatter = z.infer<typeof kapitelFrontmatterSchema>

// A Thema (glossary) is the Leitthema or a Themen-Ort (issue #31). The
// Leitthema has no Kapitel reference; a Themen-Ort's `kapitelId` names the
// one Kapitel it branches off from, checked against the actual Kapitel by
// `references.ts`, not here — the same split Aufsatz's `viertelId` makes.
// `leitsatz` (issue #124) is any Thema's own optional hero quote. `zitat` is
// the Leitthema's own pull-quote in the shared shape above, and
// `weiterfuehrendIds` a Themen-Ort's own optional list of further Aufsätze,
// each checked against the actual Aufsatz by `references.ts`'s same
// resolver a single reference field uses, once per listed ID; its label and
// description come from the target, its URL from the graph (thema.ts).
// `teaser` (issue #149) is any Thema's own optional, translatable one-line
// lead, shown on its Thema-Kachel and Thema-Karte. The superRefine below
// holds each to its own role — the same kind of within-schema cross-field
// check menuSchema's superRefine makes for a Menu's entries and groups.
export const themaFrontmatterSchema = z
	.object({
		...baseShape,
		kapitelId: z.string().min(1).optional(),
		leitsatz: z.string().min(1).optional(),
		zitat: zitatSchema.optional(),
		weiterfuehrendIds: z.array(z.string().min(1)).optional(),
		teaser: z.string().min(1).optional(),
	})
	.superRefine((thema, ctx) => {
		if (thema.kapitelId === undefined && thema.weiterfuehrendIds !== undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['weiterfuehrendIds'],
				message:
					'weiterfuehrendIds is a Themen-Ort field; the Leitthema has no Kapitel to branch from',
			})
		}
		if (thema.kapitelId !== undefined && thema.zitat !== undefined) {
			ctx.addIssue({
				code: 'custom',
				path: ['zitat'],
				message: 'zitat is the Leitthema field; a Themen-Ort has none',
			})
		}
	})

export type ThemaFrontmatter = z.infer<typeof themaFrontmatterSchema>

// An Abschnitt (glossary) belongs to one Kapitel by its folder location, not
// by reference. Its position, number and URL come from the Kapitel's own
// meta.json order (abschnitt.ts), never from frontmatter. `leitsatz` (issue
// #93) is its own pull-quote, independent of a Viertel's; `jahr` is the year
// of the original Xenia text it carries (PRODUCT.md: texts stay verbatim).
export const abschnittFrontmatterSchema = z.object({
	...baseShape,
	leitsatz: z.string().min(1).optional(),
	jahr: z.number().int().optional(),
})

export type AbschnittFrontmatter = z.infer<typeof abschnittFrontmatterSchema>

// A Rundgang (glossary) is an ordered sequence of Stationen with an
// introduction — its body. Its Stationen sit in its own folder (issue #32),
// ordered by their own meta.json; nothing here orders them, the same split
// Kapitel/Abschnitt makes. Its own number and order come from
// rundgaenge/meta.json instead (issue #116), also not read here.
// `leitsatz` and `kennzeichen` are optional, free-standing fields (a pull
// quote and a badge text); `themaId` is an optional reference to the Thema
// this Rundgang tells, checked against the actual Thema by `references.ts`,
// not here — a published Rundgang naming a missing or Draft Thema fails.
export const rundgangFrontmatterSchema = z.object({
	...baseShape,
	leitsatz: z.string().min(1).optional(),
	kennzeichen: z.string().min(1).optional(),
	themaId: z.string().min(1).optional(),
})

export type RundgangFrontmatter = z.infer<typeof rundgangFrontmatterSchema>

// A Station (glossary) belongs to its Rundgang by folder location. It
// usually stands at one Viertel or the Zentrum, by reference (issue #32, the
// same reference shape as Aufsatz's and Kapitel's `viertelId`, except its
// target collection is the Viertel and the Zentrum together) — but `ortId`
// is optional (issue #116), since some Stationen stand at none. `lage` is
// its own optional, free-standing location note.
export const stationFrontmatterSchema = z.object({
	...baseShape,
	ortId: z.string().min(1).optional(),
	lage: z.string().min(1).optional(),
})

export type StationFrontmatter = z.infer<typeof stationFrontmatterSchema>

// A translation file's frontmatter (issue #36, ADR-0001): every field is
// optional, since a translation need not repeat one it doesn't change.
// Title, Short title, description and slug are translatable on every type;
// a Viertel's translation schema adds its own Leitsatz, Steckbrief and
// Untertitel, a Kapitel's its own Untertitel, an Abschnitt's its own
// Leitsatz and Jahr (issue #93). `hinweisId` stays out of every translation
// schema: it's a reference, and references are never translatable
// (content-layer.md). The loader allows exactly the keys of the type's
// translation schema — any other key (draft, a reference, …) is a
// validation error naming the file and the key, never silently ignored.
export const translationFrontmatterSchema = z.object({
	title: z.string().min(1).optional(),
	shortTitle: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	slug: z.string().min(1).optional(),
})

export const viertelTranslationFrontmatterSchema = translationFrontmatterSchema.extend({
	leitsatz: z.string().min(1).optional(),
	steckbrief: viertelSteckbriefSchema.optional(),
	untertitel: z.string().min(1).optional(),
})

export const kapitelTranslationFrontmatterSchema = translationFrontmatterSchema.extend({
	untertitel: z.string().min(1).optional(),
})

// A Thema additionally translates its own Teaser (issue #149).
export const themaTranslationFrontmatterSchema = translationFrontmatterSchema.extend({
	teaser: z.string().min(1).optional(),
})

export const abschnittTranslationFrontmatterSchema = translationFrontmatterSchema.extend({
	leitsatz: z.string().min(1).optional(),
	jahr: z.number().int().optional(),
})

// The widest shape across every type's translation schema, inferred from
// all three rather than hand-duplicating their fields, so one of them
// growing a field can't silently drift from this type. Used only as
// Translation's frontmatter type (loader.ts); each type's own schema above
// still enforces which fields its translation file may actually set.
export type TranslationFrontmatter = z.infer<typeof viertelTranslationFrontmatterSchema> &
	z.infer<typeof kapitelTranslationFrontmatterSchema> &
	z.infer<typeof abschnittTranslationFrontmatterSchema> &
	z.infer<typeof themaTranslationFrontmatterSchema>
