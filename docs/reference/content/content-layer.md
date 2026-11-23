---
type: reference
title: Content layer
description: Content types, document IDs, Drafts, translations, the content graph API, frontmatter validation, the content:check script and content quality tooling.
tags:
  [
    content,
    mdx,
    zod,
    validation,
    drafts,
    translations,
    content-check,
    eslint,
    cspell,
    lychee,
    sitemap,
    seo,
  ]
status: stable
last_reviewed: 2026-11-23
authoritative: true
---

# Content layer

The loader and content graph live in `src/lib/content/`, with `index.ts` as their public API ([Folder structure](../global/folder-structure.md)). [ADR-0002](../../adr/adr-0002-own-content-loader-with-next-mdx.md) explains why this is our own code instead of a content framework.

## Content types

A content type is decided by where a file sits under `src/content`, not by a field in its frontmatter (`src/lib/content/locations.ts`, `kindOfPath`). **Seite** ([glossary](../glossary.md)) is a plain standalone page, such as Start, Idee, Kontakt, Impressum or Datenschutz, and the landing page of each area (`stadt/index.mdx`, `rundgaenge/index.mdx`, `themen/index.mdx`). Every other type has a location rule of its own:

| Type      | Location                                    | Frontmatter fields beyond `title`, `description`, `shortTitle` (optional), `draft` | Schema                       |
| --------- | ------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| Seite     | everywhere else                             | none                                                                               | `seiteFrontmatterSchema`     |
| Viertel   | `stadt/<slug>/` (slug is not `zentrum`)     | `leitsatz`, `steckbrief` (object)                                                  | `viertelFrontmatterSchema`   |
| Zentrum   | `stadt/zentrum/`                            | none                                                                               | `zentrumFrontmatterSchema`   |
| Aufsatz   | `bibliothek/aufsaetze/<slug>/`              | `viertelId` (reference)                                                            | `aufsatzFrontmatterSchema`   |
| Kapitel   | `leitthema/<slug>/`                         | `viertelId` (reference)                                                            | `kapitelFrontmatterSchema`   |
| Abschnitt | `leitthema/<kapitel>/<slug>/`               | none                                                                               | `abschnittFrontmatterSchema` |
| Rundgang  | `rundgaenge/<slug>/`                        | none                                                                               | `rundgangFrontmatterSchema`  |
| Station   | `rundgaenge/<rundgang>/<slug>/`             | `ortId` (reference)                                                                | `stationFrontmatterSchema`   |
| Thema     | `themen/<slug>/` (Leitthema and Themen-Ort) | `kapitelId` (optional reference)                                                   | `themaFrontmatterSchema`     |

All schemas live in `src/lib/content/schemas.ts`. `draft` is `z.boolean().default(false)` on every one (see [Drafts](#drafts)). A Kapitel belongs to the Leitthema, not to the Viertel it is set in, so it sits in `leitthema/`; an Abschnitt or Station sits in its Kapitel's or Rundgang's own folder. A Thema is either the Leitthema (no `kapitelId`) or a Themen-Ort (its `kapitelId` names the Kapitel it branches off from); both sit at the same level.

A Viertel's Steckbrief (glossary) is a nested frontmatter object: `prozessansatz`, `bauform`, `prozessdokument`, `imStadtzentrum`.

Every type shares `BaseDocument` (`src/lib/content/types.ts`): `id`, `url`, `title`, `description`, `shortTitle`, `body` and `draft`. The resolved types (`Viertel`, `Kapitel`, …) extend it with their derived fields (`number`, `readingTimeMinutes`, …).

### Module layout

`src/lib/content/` splits by responsibility:

| File                                                                                              | Responsibility                                                                |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `types.ts`                                                                                        | `BaseDocument`, the resolved document types, `ContentDocument`, links         |
| `locations.ts`                                                                                    | location rules, ID derivation, translation file naming (pure)                 |
| `urls.ts`                                                                                         | URL rules for German and localized URLs (pure)                                |
| `loader.ts`                                                                                       | the only file system reads: documents, order files, site, Menus, translations |
| `order.ts`                                                                                        | `reconcileOrder`, the one strict order reconciliation                         |
| `references.ts`, `body.ts`                                                                        | reference fields and body components/images                                   |
| `viertel.ts`, `aufsatz.ts`, `kapitel.ts`, `abschnitt.ts`, `thema.ts`, `rundgang.ts`, `station.ts` | per-type resolution: references, order, numbers, URLs (pure)                  |
| `navigation.ts`, `trail.ts`, `sitemap.ts`, `menu.ts`                                              | Navigation tree, breadcrumbs and previous/next, Sitemap, Menus (pure)         |
| `translation.ts`, `documents.ts`                                                                  | localizing a document set; tagged document lists and lookups (pure)           |
| `presentation.ts`                                                                                 | `shortTitleOrTitle`, `toLink`, `siteWordmark`                                 |
| `graph.ts`                                                                                        | `buildContentGraph`, `contentGraph`, the `ContentGraph` interface             |

### References

A frontmatter field can hold another document's ID instead of a value of its own — a reference (issue #29). Aufsatz's `viertelId` is the first one: it names the Viertel the Aufsatz belongs to. The field is validated as a non-empty string in `schemas.ts` like any other string field — a Zod schema can't see the rest of the content graph to check the ID exists — so the actual check happens once every document is loaded, via `resolveReference` in `src/lib/content/references.ts`. That function is the one generic resolution mechanism for every reference field: given the referring document (its file and Draft flag), the field name, the ID, the target collection it points into and the graph's visibility predicate, it returns the matching document or throws `ContentValidationError` naming the file, the field and the missing ID — or, when a published document names a Draft, the Draft's own file ([Drafts](#drafts)). Every reference field reuses it; none has resolution code of its own. The target collection is always the full, Draft-included set of loaded documents, so a Draft can be referenced by another Draft.

The reference fields are Aufsatz's and Kapitel's `viertelId`, Station's `ortId`, Thema's `kapitelId` and a body's `<ViertelTeaser id>` (below). Station's `ortId` (issue #32, glossary: "It stands at the Zentrum or at a Viertel") targets both collections at once: `resolveReference` is called with every Viertel and the Zentrum as its target list, since both satisfy `Referenceable` (an `id` and a `draft` flag is all the function needs).

Aufsatz's reading time (`readingTimeMinutes`) is computed from its body's word count by `src/lib/content/reading-time.ts`, shown via the dictionary key `aufsatz.readingTime` ("ca. {n} Min."). A Viertel's related Aufsätze (`graph.getAufsaetzeByViertel(id)`, "Mehr aus dem Viertel") are derived the same way: filtered from the already-resolved Aufsätze by their `viertelId`, never listed by hand in the Viertel's own frontmatter or body.

### Order files

Every order is a bare JSON array of document IDs in a `meta.json`, validated by `metaSchema`, and reconciled by one function, `reconcileOrder` (`order.ts`): every listed ID must match an actual document, and every actual document must be listed exactly once, or `ContentValidationError` names the `meta.json` file and the ID (`is listed more than once`, `lists an ID with no matching <type>`, `is missing from the <type> order`). The files are:

| File                              | Orders                   | Read by                                                                   |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| any folder's `meta.json`          | its Seite children       | `loadMeta` (optional; natural key without it), see "Order and Navigation" |
| `stadt/meta.json`                 | the Viertel              | `loadOrder(contentDir, 'stadt', …)` (required)                            |
| `leitthema/<kapitel>/meta.json`   | the Kapitel's Abschnitte | `loadOrder` (required)                                                    |
| `rundgaenge/<rundgang>/meta.json` | the Rundgang's Stationen | `loadOrder` (required)                                                    |

`loadMeta`'s scan skips the three non-Seite kinds of `meta.json` (`locations.ts`'s `isNonSeiteMetaDir`), since they order non-Seite documents and would otherwise fail Navigation's strict Seite-only validation. `stadt/` has no Seite children besides its own `index.mdx`, so its `meta.json` is never a Seite order.

### Viertel numbers

A Viertel's number (glossary: fixed, 01–08) comes from its 1-based position in `src/content/stadt/meta.json` — never from frontmatter, so a `number` key in a Viertel's frontmatter is parsed and silently dropped ([ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)). `orderViertel` (`viertel.ts`) reconciles the file against every Viertel document and assigns `.number`. A missing file throws `ContentValidationError` (`stadt/meta.json`, field `(viertel-order)`, `file not found`). `buildContentGraph`'s result exposes the ordered list as `graph.viertel` and a lookup as `graph.getViertel(id)`; the single Zentrum is `graph.zentrum`.

### Kapitel and Abschnitt numbers

A Kapitel's number is its referenced Viertel's number (issue #30, ADR-0003): "Kapitel n = Viertel n" by construction, never written in frontmatter. `resolveKapitel` (`kapitel.ts`) resolves the `viertelId` reference via `resolveReference` and derives the number and the URL from the resolved Viertel: its own resolved URL plus `/kapitel-{n}`. A Viertel has at most one Kapitel, Draft or not; a second one referencing the same Viertel throws `ContentValidationError` naming the file, `viertelId` and the Kapitel that already has one.

An Abschnitt's position comes from its Kapitel's own `meta.json`. `orderAbschnitte` (`abschnitt.ts`) reconciles it and assigns each Abschnitt's position, number (`"{kapitelNumber}.{position}"`, e.g. "4.3"), URL (`/stadt/{viertel}/kapitel-{n}/{m}`) and reading time (`reading-time.ts`, the same mechanism Aufsatz uses).

`graph.kapitel` is the Kapitel list in Kapitel number order, with `graph.getKapitel(id)` and `graph.getKapitelByViertel(viertelId)`; a Kapitel's Abschnitte are `graph.getAbschnitteByKapitel(kapitelId)` — never listed by hand on the Kapitel itself, so "N Abschnitte" is always this list's length — and `graph.getAbschnitt(id)` finds one.

### Rundgang and Station numbers

A Station's position comes from its Rundgang's own `meta.json`. `orderStationen` (`station.ts`) reconciles it, resolves each Station's `ortId` reference, and numbers the result: counting from 0 if the first listed (published) Station stands at the Zentrum, from 1 otherwise (glossary: Zentrum, Station) — decided once from that first Station's Ort, not re-checked per Station. A Station's URL (`/rundgaenge/{rundgang}/{n}`) follows from that number. A Rundgang's own URL is its folder path (ADR-0003).

A Rundgang's Stationen count and duration are always derived from its ordered Stationen (`summarizeRundgang` in `rundgang.ts`), never written in frontmatter: `stationenCount` is the list's length, `durationMinutes` is the sum of each Station's `readingTimeMinutes` (`reading-time.ts`'s `sumReadingTime`). `graph.rundgaenge` is the Rundgang list with `graph.getRundgang(id)`, a Rundgang's Stationen are `graph.getStationenByRundgang(rundgangId)` (with `graph.getStation(id)`), and the Stationen set at a Viertel or the Zentrum are `graph.getStationenByOrt(ortId)` — the same "derived from the reference, never listed by hand" shape as `graph.getAufsaetzeByViertel`.

### Thema and Themen-Ort

A Thema's URL (issue #31, ADR-0003) is `/themen/{slug}`, its folder path. A Themen-Ort's `kapitelId` names the one Kapitel of the Leitthema it branches off from; `resolveThemen` (`thema.ts`) checks it via `resolveReference`. The Leitthema carries no `kapitelId`, so it isn't checked against anything — its landing page instead lists every Kapitel (`graph.kapitel`, in Kapitel number order), not one it references.

`graph.themen` is the Themen list with `graph.getThema(id)`, and a Kapitel's Themen-Ort(e) are `graph.getThemenByKapitel(kapitelId)` — derived from each Thema's Kapitel reference, never listed by hand on the Kapitel itself.

### Illustrations

Each Viertel, the Zentrum, each Thema and each Rundgang has an illustration, looked up by the owning document's ID — content never names an illustration file. `src/components/ui/illustration.tsx` holds the registry (the same lookup-by-key pattern as the [icon registry](../components/icon-registry.md)); `Illustration` takes `{ id, label }` plus the props of an `svg`.

### Components in a body

A body uses a fixed, registered component set instead of its own imports (below, "MDX lint"): `src/mdx-components.tsx` is the provider, the same file Next's own `useMDXComponents` convention calls for every body. A component that references other content by ID, like `ViertelTeaser` (issue #35, `src/components/viertel/viertel-teaser.tsx`, taking a Viertel's `id`), reads the content graph itself, the same way `SitemapList` does (below, "Sitemap") — it isn't handed data by a route, since a route doesn't know in advance which IDs a body's components reference.

Every such ID is checked the same way a frontmatter reference field is: `src/lib/content/body.ts` extracts every `<ViertelTeaser id="...">` in a body (a plain tag/attribute scan, since a body has no imports to resolve against) and calls `resolveReference` against every Viertel document — reusing the one generic resolution mechanism (above, "References"), not a new per-component check. `buildContentGraph` runs this over every body of every type, Drafts and translations included, since a Viertel teaser can appear in any of them. An unknown ID throws `ContentValidationError` naming the body's own file and `ViertelTeaser.id`; a published body naming a Draft Viertel throws the same, naming the Draft's file too.

### Body images

An image sits next to its MDX file and is referenced with markdown's own syntax, `![alt](path)`, relative to that file — never an absolute path, since content has no notion of where a page's URL ends up living (a Kapitel's URL, for instance, isn't its folder path at all, above). `src/lib/content/body.ts`'s `resolveBodyAssetPath(id, path)` is the one join that turns a body image's relative path into a path under the content directory — a document's ID is its folder path (below, "Document IDs"), so no extra lookup is needed. `buildContentGraph` checks every such path exists on disk (`loader.ts`'s `validateBodyImages`) for every body, translations included, throwing `ContentValidationError` naming the file and the path if it doesn't, and exposes the images of published documents as `graph.bodyImages` — a flat list of paths relative to the content directory, deduplicated. A Draft's images are checked but not listed, so they are never copied into the build.

The static export has no server to read `src/content` from at request time, so `pnpm content:images` (`scripts/content-images.mts`) copies every `graph.bodyImages` entry into `public/content/<path>` before `next build` runs (`pnpm build` chains it first) — Next's own static export then copies `public/` into `out/` verbatim, so a body image is served at `/content/<path>`. `public/content/` is therefore entirely generated from `src/content` (`.gitignore`), never hand-authored; the rest of `public/` is.

Rendering resolves a body image's `src` the same way: `bodyImageComponents(id)`, a named export of `src/mdx-components.tsx`, returns an `img` override whose `src` is `/content/<resolveBodyAssetPath(id, path)>`. Every route renders its document's body as `<Body components={bodyImageComponents(id)} />` — the documented way to pass per-page data into a compiled MDX component, since it merges with and overrides the global set from `mdx-components.tsx` — so it resolves to exactly the path `content-images.mts` copied the file to. It renders a plain `<img>`, not `next/image`: a body image has no known dimensions and the site is already unoptimized (`images: { unoptimized: true }`, [Static export](../react/static-export.md)), so `next/image`'s own optimization has nothing to add.

## Document IDs

A document's ID is the path under `src/content`, without extension or locale suffix:

- A `.mdx` file named `index.mdx` represents the folder it sits in; its own `index` segment is dropped, not kept as part of the ID. `src/content/index.mdx` is the ID `''`; `src/content/idee/index.mdx` is the ID `idee`.
- A trailing locale suffix (e.g. `.de`) is dropped the same way, so a later translation of a document shares its non-localised ID.

IDs are unique across types, since a path is. `locations.ts`'s `documentFile(id, locale?)` is the inverse: the file an ID derives from (or its translation file), for error messages.

## URLs

Every type has exactly one URL rule ([ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)), in `src/lib/content/urls.ts`:

- Seite, Viertel, Zentrum, Aufsatz, Rundgang and Thema: the document's folder path (`pathUrl`), so ID `''` is `/`, ID `idee` is `/idee` and ID `stadt/kontexte` is `/stadt/kontexte`.
- Kapitel: its Viertel's resolved URL plus `kapitel-{n}`. Abschnitt: its Kapitel's URL plus its position. Station: its Rundgang's URL plus its number.

`graph.resolveUrl(url)` is the one place a URL is parsed instead of built: it resolves any type's German or localized URL to a `ResolvedDocument`, a discriminated union — `{ kind: 'seite' | 'viertel' | 'zentrum' | 'aufsatz' | 'kapitel' | 'abschnitt' | 'thema' | 'rundgang' | 'station'; document; locale? }`, where `document` is the type's resolved shape for that `kind` and `locale` is set only for a configured locale's own prefixed URL. A route narrows on `kind` and never parses a locale prefix by hand. An unknown or hidden (Draft, in production) URL resolves to `undefined`.

## Translations

The structure is ready for translation without shipping any (issue #36, [ADR-0001](../../adr/adr-0001-unprefixed-default-locale-urls.md)): German, the default locale, stays unprefixed with no file suffix; a later locale gets a file suffix on content and a URL prefix on routes. No extra locale is configured today — no English content, language switcher or second [dictionary](../i18n/dictionary.md) ships — so this is plumbing, exercised by fixtures with a test-only locale, not a shipped feature.

A translation file is a sibling `index.<locale>.mdx` next to the German document it translates, of any type, sharing its ID (above): `idee/index.mdx`'s translation for locale `xx` is `idee/index.xx.mdx`; the root Seite's is `index.xx.mdx`; an Aufsatz's, a Kapitel's, a Station's the same. It holds only **translatable fields** — `title`, `shortTitle`, `description`, `slug`, the body, and, on a Viertel, `leitsatz` and `steckbrief` — and inherits every other field (numbers, references, Draft state) from the German document untouched. Each type has its translation schema in `schemas.ts` (`translationFrontmatterSchema`, `viertelTranslationFrontmatterSchema`), and the loader allows exactly that schema's keys: a translation file setting a non-translatable field (e.g. an Aufsatz's `viertelId`, or any `draft`) throws `ContentValidationError` naming the file and that field. A translatable field a translation omits falls back to the German document's value; a locale with no translation file for a document falls back to the whole German document, under that locale's own URL prefix.

A translation file is never silently skipped: for a configured locale, one next to no document (or not named `index.<locale>.mdx`) throws `ContentValidationError` (field `(translation)`). A translation file for an unconfigured locale is never read — and, by shape (`*.<code>.mdx`), never becomes a stray standalone document either. Translation files of a Draft are validated like the Draft itself; the translated Draft is exposed nowhere.

A localized URL is `/<locale>` plus the type's URL rule (above) applied to translated slugs (`localizeSet` in `translation.ts`, pure):

- A translation's `slug` replaces the document's own final URL segment: for a Kapitel `kapitel-{n}`, for an Abschnitt its position, for a Station its number.
- Wherever a URL contains an ancestor Seite's folder name (`stadt` in `/stadt/{viertel}`, `bibliothek`, `themen`, `rundgaenge`), that Seite's translated slug takes its place, if the Seite's translation sets one.
- A Kapitel, Abschnitt or Station URL continues its translated parent's: Kapitel from its Viertel's, Abschnitt from its Kapitel's, Station from its Rundgang's.
- A missing translation falls back to the German segments, still under the `/<locale>` prefix.

`buildContentGraph(contentDir, { locales })`'s `locales` option is the extra locales configured for this build, beyond German: empty for every real caller (`graph.ts`'s `CONFIGURED_LOCALES`), so no translation lookup happens at all; a test passes a non-empty list (e.g. `['xx']`). `graph.getSeite(id, locale)`, `getViertel`, `getAufsatz`, `getKapitel`, `getAbschnitt`, `getThema`, `getRundgang` and `getStation` return that locale's merged view with a `locale` argument (undefined for an unconfigured locale). Related lists (`getAbschnitteByKapitel`, `getAufsaetzeByViertel`, …) hold the German documents; ask the getter with `locale` for a document's localized view. `graph.locales` is the configured list.

`graph.getLocalizedDocuments(locale)` returns every published document of every type translated into `locale`, in `resolveUrl`'s union shape with `locale` set — the source for the catch-all route's prefixed static params. `graph.getBody(id, locale)` returns the translated body: with a configured `locale` and a translation file for `id` it imports `@/content/<id>/index.<locale>.mdx` (the root Seite its own literal, `@/content/index.<locale>.mdx`); otherwise the German body.

## Frontmatter validation

`src/lib/content/frontmatter.ts` splits a document into its YAML frontmatter and MDX body by hand and parses the YAML with the `yaml` package — not `gray-matter` 4, which is unmaintained. `src/lib/content/loader.ts`'s one document loader then validates the parsed frontmatter against the type's Zod schema, whichever type the file's location makes it.

A validation failure throws `ContentValidationError` (`src/lib/content/errors.ts`), which carries the three things a fix needs:

```ts
class ContentValidationError extends Error {
	readonly file: string // path under the content directory
	readonly field: string // the offending frontmatter key, dotted path, or a meta.json ID
	readonly reason: string // the Zod issue's message, or the meta.json rule that failed
}
```

The same error carries a `meta.json` problem (below): `file` is the `meta.json` path, `field` is the offending ID.

## The content graph

`buildContentGraph(contentDir, options)` (`src/lib/content/graph.ts`) is the one public interface for content: it runs the loader over `contentDir` and returns a `ContentGraph`. `options` is `{ development?: boolean; locales?: readonly string[] }` ([Drafts](#drafts), [Translations](#translations)). Taking `contentDir` as a parameter, rather than hardcoding `src/content`, is what lets tests and scripts point it at a fixture directory ([Testing conventions](../testing/testing-conventions.md)).

Routes and components don't build the graph themselves: they call `contentGraph()`, exported from `@/lib/content`, which builds `src/content` (`path.join(process.cwd(), 'src/content')`) with `development: process.env.NODE_ENV === 'development'` and the configured locales. Outside `next dev` the result is memoized, so a build constructs the graph once; `next dev` rebuilds on every call so an edited file shows up on the next request.

Building runs in a fixed order: every document of every type is loaded and fully validated (frontmatter, references, order files, bodies, translations), Drafts included; only then is the exposed set cut down to the visible documents and numbered. `ContentValidationError` is the one failure shape.

The interface, as `src/lib/content/graph.ts` declares it:

```ts
interface ContentGraph {
	readonly locales: readonly string[]
	readonly seiten: readonly Seite[]
	getSeite(id: string, locale?: string): Seite | undefined
	getBody(id: string, locale?: string): Promise<MDXContent>
	resolveUrl(url: string): ResolvedDocument | undefined
	getLocalizedDocuments(locale: string): readonly ResolvedDocument[]
	readonly navigation: NavigationNode
	readonly sitemap: NavigationNode
	getBreadcrumbs(id: string): readonly NavigationLink[]
	getPrevious(id: string): NavigationLink | undefined
	getNext(id: string): NavigationLink | undefined
	readonly site: Site
	getMenu(name: string): readonly MenuLink[]
	readonly viertel: readonly Viertel[]
	getViertel(id: string, locale?: string): Viertel | undefined
	readonly zentrum: Zentrum | undefined
	readonly aufsaetze: readonly Aufsatz[]
	getAufsatz(id: string, locale?: string): Aufsatz | undefined
	getAufsaetzeByViertel(viertelId: string): readonly Aufsatz[]
	readonly kapitel: readonly Kapitel[]
	getKapitel(id: string, locale?: string): Kapitel | undefined
	getKapitelByViertel(viertelId: string): Kapitel | undefined
	getAbschnitteByKapitel(kapitelId: string): readonly Abschnitt[]
	getAbschnitt(id: string, locale?: string): Abschnitt | undefined
	readonly rundgaenge: readonly Rundgang[]
	getRundgang(id: string, locale?: string): Rundgang | undefined
	getStationenByRundgang(rundgangId: string): readonly Station[]
	getStation(id: string, locale?: string): Station | undefined
	getStationenByOrt(ortId: string): readonly Station[]
	readonly themen: readonly Thema[]
	getThema(id: string, locale?: string): Thema | undefined
	getThemenByKapitel(kapitelId: string): readonly Thema[]
	readonly bodyImages: readonly string[]
}
```

`graph.getBody(id, locale)` compiles a document's MDX body through Next's MDX pipeline and returns its component (issue #55): routes render a body through this instead of importing `@/content` themselves. Unlike the rest of the graph, it always imports from the real `src/content` through the `@/content` alias — a bundler-resolved path a fixture directory can't stand in for — so it isn't exercised by `buildContentGraph`'s fixture-backed tests. `id === ''` (the root Seite) gets its own literal import: the general `@/content/${id}/index.mdx` pattern can't resolve it, because the resulting path would have no folder segment between `content` and `index.mdx` (issue #25). The one dynamic `@/content` import stays in `graph.ts`'s `importBody`.

`zentrum` is `undefined` only in a production graph while the Zentrum is a Draft. The lists and getters expose only published documents in production; the Draft rules are in [Drafts](#drafts).

## Order and Navigation

A folder can hold a `meta.json` that lists its Seite children's IDs in order and nothing else (see "Order files" above for the three other kinds). The listed IDs are full document IDs (above, "Document IDs"), not names relative to the folder: a `meta.json` inside `src/content/eltern/` lists its children as `eltern/erstes`, `eltern/zweites`, not `erstes`, `zweites`.

```json
["idee", "kontakt", "impressum", "datenschutz"]
```

It is strict: every actual child of that folder must appear exactly once. An ID listed twice, an ID with no matching child, or a child missing from the list throws `ContentValidationError`, naming the `meta.json` file and the offending ID. A folder without a `meta.json` sorts its children by their type's natural key — date first (once a type carries one), then title — not by file system order.

`src/lib/content/navigation.ts` builds the Navigation tree ([glossary](../glossary.md)) from the Seite folder hierarchy plus this order: a Seite's parent is the folder it sits in, and `''` (the root Seite) is the tree's root. `graph.navigation` is the root `NavigationNode`, with nested `children`. Only Seite is part of this tree.

Breadcrumbs and previous/next cover every type (`src/lib/content/trail.ts`), derived from the published documents:

- `graph.getBreadcrumbs(id)` returns the trail from the root to the document, itself last: Seite ancestors, then type ancestors. A Kapitel is read inside its Viertel, an Abschnitt inside its Kapitel, a Station inside its Rundgang, so an Abschnitt's trail is Start › Stadt › Viertel › Kapitel › Abschnitt and a Station's is Start › Rundgänge › Rundgang › Station. An area's Seite (Stadt, Themen, Rundgänge) joins the trail when a published one exists. An unknown or hidden ID has an empty trail.
- `graph.getPrevious(id)` / `graph.getNext(id)` walk one sequence per type: Seiten their Navigation siblings; Kapitel all Kapitel in Kapitel number order; Abschnitte all Abschnitte in Kapitel number order, crossing from the last Abschnitt of one Kapitel to the first of the next; Stationen only their own Rundgang's. Every other type, and either end of a sequence, has none.

A link's `title` is the document's Short title when it has one, the title otherwise (`presentation.ts`'s `shortTitleOrTitle`, one `toLink` for every type).

## Site data

`src/content/site.json` holds the site-wide facts that would otherwise be restated in several places: `name`, `tagline`, `baseUrl` and `copyright`, validated by `siteSchema` in `schemas.ts`. `graph.site` exposes it; the header, footer and the root layout's metadata all read it from there instead of hardcoding it. A validation failure throws `ContentValidationError` the same way frontmatter does, with `file` set to `site.json`.

`baseUrl` is a placeholder (`https://xenia.example.com`) until a real production domain is decided; it feeds `metadataBase` in `src/app/layout.tsx`, which resolves every page's canonical link and Open Graph URL (below, "Canonical URL and Open Graph tags").

## Drafts

A **Draft** (glossary) is a document of any type with `draft: true` in its frontmatter (every schema in `schemas.ts`, default `false`): written and checked but not yet published (issue #33).

`buildContentGraph(contentDir, options)` takes an optional `development` flag (default `false`). Next assigns `NODE_ENV` `'development'` only for `next dev`, `'production'` for every other command including `next build` — `contentGraph()` passes exactly that split; every other caller, `content:check` included, defaults to the strict behaviour below. A production graph (`development` false) exposes no Draft of any type:

- Lists and getters (`graph.seiten`, `graph.viertel`, `graph.getAufsatz(id)`, …) leave a Draft out, so a route's static params never build it a page, and `resolveUrl` of its URL, localized ones included, is `undefined` (visiting it 404s).
- Counts and related lists leave it out: "N Abschnitte" and "N Stationen" count published documents, as do `getAufsaetzeByViertel`, `getStationenByOrt`, `getThemenByKapitel`, `getKapitelByViertel` and `getStationenByRundgang`.
- `graph.navigation`, `getBreadcrumbs`, `getPrevious` and `getNext` leave a Draft out. A Draft Seite's published children reparent to its nearest visible ancestor instead of disappearing with it — the same rule the Sitemap uses, below.
- Menus leave it out, and the Sitemap and `sitemap.xml` too (below).
- `graph.getLocalizedDocuments(locale)` and a localized getter leave it out.

A published document, Menu entry or body component that references a Draft fails instead of resolving, with `ContentValidationError` naming the referring file and the Draft's own file (`... references a Draft: <draft's index.mdx>`): a frontmatter reference (`viertelId`, `ortId`, `kapitelId`), a Menu entry (`menu references a Draft`), a `<ViertelTeaser id>` in a body, or the folder a document sits in — a published Abschnitt in a Draft Kapitel or a published Station in a Draft Rundgang fails (field `(parent)`), since its URL hangs off that parent. A Draft may reference a Draft. A Draft Seite is the exception: its published children stay published (above).

A Draft is still fully validated regardless of `development`: its frontmatter is parsed against its type's schema, its references resolve, its body components and images are checked, its translations are validated, and every order file is reconciled against the full, Draft-included set of documents — a Draft is still a real file on disk, so an author can order it inside a `meta.json` ahead of publishing it.

### Numbering with Drafts

Numbers are assigned after the Drafts are left out, so a production graph never has a gap in them: a Draft listed in `stadt/meta.json`, a Kapitel's `meta.json` or a Rundgang's `meta.json` takes no position. With Viertel `[a, b (Draft), c]`, `c` is Viertel 2 in production and 3 in development; with Abschnitte `[1, 2 (Draft), 3]`, the third is "1.2" in production. Because Kapitel numbers follow their Viertel's and Station numbering starts from the first published Station, the numbered URLs of a published document can differ between a development and a production graph while a Draft sits before it; ADR-0003 already accepts that numbered URLs depend on position in `meta.json`. A Draft Kapitel leaves its Viertel without a Kapitel in production, like a Viertel that never had one.

`next dev` is the one place a Draft renders like any other document: reachable by URL, listed in lists, Navigation and Menus, with working breadcrumbs and previous/next links, and the reference rules above lifted. The Sitemap stays published-only even there.

## Sitemap

`graph.sitemap` (`src/lib/content/graph.ts`, built by `listSitemap` in `sitemap.ts`) is a published-only tree of every content type's documents: a `NavigationNode` rooted at the start Seite, with each type nested as `children` under its area's Seite. `flattenNavigation(node)` (`sitemap.ts`, exported from `@/lib/content`, pure) turns any such tree into the depth-first list, parent before children, that `sitemap.xml` needs. The Sitemap page and `sitemap.xml` both read this one tree instead of re-deriving it (issue #34), so a later content type only has to join `listSitemap` once to appear in both (issue #60).

The tree is the Navigation tree with each type nested under its area's Seite (the Seite of the folder its documents sit in), after the Seite's own Seite children:

| Area (Seite)      | Nested under it, in order                    | Order within the type                         |
| ----------------- | -------------------------------------------- | --------------------------------------------- |
| (Navigation tree) | Seite                                        | Navigation order (above)                      |
| Stadt             | Zentrum, then Viertel                        | Viertel number                                |
| Bibliothek        | Aufsatz                                      | `aufsaetze`'s own order                       |
| Leitthema         | Kapitel, each followed by its own Abschnitte | Kapitel number, then Abschnitt number         |
| Themen            | Thema                                        | `themen`'s own order                          |
| Rundgänge         | Rundgang, each followed by its own Stationen | `rundgaenge`'s own order, then Station number |

An area with no published Seite at its folder — real content has none for Bibliothek or Leitthema — attaches to the nearest published ancestor folder's Seite, the root Seite at worst, after the root's own children. A Draft's own entry is left out, a Draft Seite's published children kept. Unlike `graph.navigation` and the lists, this exclusion isn't `development`-aware: the Sitemap is always a published-only view, in or out of `next dev`. The Sitemap page renders the tree as nested lists.

`src/content/sitemap/index.mdx` is a plain Seite like any other, whose body is a single `<SitemapList />`, one of the components the provider (`src/mdx-components.tsx`) registers. The component (`src/components/navigation/sitemap-list.tsx`) reads the content graph itself, unlike Breadcrumbs and PreviousNext, because it sits inside the Sitemap Seite's own MDX body rather than being handed items by a route. It renders `graph.sitemap` as nested `<ul>`s, one level per tree level. `src/content/menus/footer.json` links to it like any other Seite, by ID.

`src/app/sitemap.ts` follows Next's `sitemap.ts` file convention to produce `sitemap.xml` in the build output: every entry of `flattenNavigation(graph.sitemap)` resolved to an absolute URL against `graph.site.baseUrl`. It exports `dynamic = 'force-static'` because a static export can't revalidate a Route Handler at runtime ([Static export](../react/static-export.md)).

`pnpm pages:check` (`scripts/pages-check.mts`) is the backstop for `graph.sitemap` falling out of sync with what actually gets built: it walks every `.html` file `next build`'s static export wrote under `out/` and fails, naming the page, if that page's URL isn't in `out/sitemap.xml`. `pnpm build` runs it automatically, so a content type's page route without a matching sitemap entry fails the build rather than shipping a silently incomplete sitemap. It checks each page's head too (see "Canonical URL and Open Graph tags").

## Routes and rendering

Every route in `src/app/` reads the graph with `contentGraph()` and renders a document's page from a view component in the document type's feature folder (`src/components/<feature>/<type>-detail.tsx`: `viertel-detail`, `zentrum-detail`, `aufsatz-detail`, `kapitel-detail`, `abschnitt-detail`, `thema-detail`, `rundgang-detail`, `station-detail`). A view takes the document and an optional `locale`, compiles the body with `graph.getBody(id, locale)`, and renders it as `<Body components={bodyImageComponents(id)} />`, with Breadcrumbs on every page and previous/next on Kapitel, Abschnitt and Station pages (`getPrevious`/`getNext`). A page's `<h1>` is the document's full title; the Short title is only for Menus, breadcrumbs, previous/next and lists. The Seite page stays in the catch-all route.

German URLs of the typed documents have a dedicated route each (`stadt/[viertel]`, `stadt/zentrum`, `stadt/[viertel]/[kapitelSlug]`, `stadt/[viertel]/[kapitelSlug]/[position]`, `bibliothek/aufsaetze/[slug]`, `themen/[thema]`, `rundgaenge/[rundgang]`, `rundgaenge/[rundgang]/[position]`). A dedicated route never parses an ID or rebuilds a URL rule: `src/app/_lib/document-route.ts`'s `getDocument(kind, ...segments)` asks `graph.resolveUrl` for the URL its params make up and returns the document of the route's own `kind`, or 404s. Its `generateStaticParams` splits each document's `url` with `urlSegments`, the same helper.

The optional catch-all `src/app/[[...slug]]/page.tsx` serves every Seite (German or localized) and, for each configured locale, every localized document of every type: `generateStaticParams` emits `graph.seiten` plus each `getLocalizedDocuments(locale)` URL, and the page switches on the resolved `kind` to the same view components, passing `locale`. With no configured locale (production today) it emits no prefixed route. Breadcrumbs, previous/next and related lists stay the German graph's under a locale (the graph holds them in German only).

## Canonical URL and Open Graph tags

Every route's `generateMetadata` builds its metadata with `documentMetadata(document, siteName, locale?)` (`src/lib/utils/document-metadata.ts`): the canonical URL (`alternates.canonical`) and Open Graph tags (`openGraph.type`, `.title`, `.description`, `.url`, `.siteName`, `.locale`), from the document and `graph.site.name` — never written per page. A localized page passes its locale; every other page is `de_DE`. Both URLs resolve to absolute ones via `metadataBase` (`generateMetadata` in `src/app/layout.tsx`, set from `graph.site.baseUrl`).

`pnpm pages:check` (part of `pnpm build`, see "Sitemap") fails, naming the page, when a built page has no canonical link, a canonical link to another path, a missing `og:title`, `og:description`, `og:url` or `og:site_name`, or an `og:url` that differs from its canonical link. Page routes arrive one content type at a time, and this catches a new route that skips `documentMetadata`.

## Menus

A Menu (glossary: Menu) is a hand-curated, ordered list of links such as the header or footer. Each Menu is its own JSON file under `src/content/menus/`, named after the Menu (`header.json`, `footer.json`), validated by `menuSchema` in `schemas.ts`. An entry is either a content reference or an external link:

```json
[
	{ "id": "idee" },
	{ "id": "stadt/inszenierung" },
	{ "url": "https://example.com", "label": "Extern" }
]
```

A content entry's ID may name a published document of any type (a Seite, a Viertel, a Kapitel, …). Its label is never written in the Menu file: the content graph resolves it from the target's Short title, falling back to its title — the same rule Navigation uses — and its URL from the target's own URL. An external entry carries its own `label`. `src/lib/content/menu.ts` does this resolution; it stays pure like `navigation.ts`, with the loader's `loadMenus` (`loader.ts`) doing the one filesystem read. `src/content/menus/header.json` lists Idee, Stadt (Stadtplan), Rundgänge, Themen, Kontakt, in that order.

`graph.getMenu(name)` returns the resolved list of `{ url, label }` links, or an empty list for a Menu with no file. An entry whose ID has no matching document throws `ContentValidationError` naming the Menu file (e.g. `menus/header.json`) and the offending ID — the same way an unknown `meta.json` ID does — and an entry naming a Draft fails likewise in production ([Drafts](#drafts)).

## `content:check`

`scripts/content-check.mts` builds the content graph (`buildContentGraph`, production visibility: Drafts hidden and checked) from a content directory — the real `src/content` by default, or a directory passed as its one argument — and exits non-zero on the first `ContentValidationError`, printing the file, field and reason. `pnpm content:check` runs it against the real content directory; `pnpm check` runs `content:check` after the test suite.

The script runs under plain Node, not a bundler, so it can't use path aliases like `@/lib/content`. It imports the content graph by relative path instead, with `scripts/ts-extension-loader.mjs` registered as a module hook: Node's native TypeScript support needs a file extension on every relative import, while the content graph's own files stay extensionless like the rest of the codebase. The hook only retries a failed relative resolution with `.ts` appended; it has no effect on the bundler that builds the actual site.

## Content-graph boundaries

`eslint.config.mjs` guards the rule "only `src/lib/content/` reads content" ([About the architecture](../../explanation/about-architecture.md), [ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)) at lint time instead of leaving it to review alone (issue #55). Outside `src/lib/content/`, under `src/`:

- `fs`, `node:fs` and their `/promises` variants fail (`restrictions/content-fs-imports`): a file read belongs in `loader.ts`, exposed through the graph.
- An import of `@/content` or anything under it, static or dynamic — including a dynamic import keyed by a template literal — fails (`restrictions/content-module-imports`, `restrictions/content-dynamic-imports`): ask `@/lib/content` instead. `graph.getBody(id, locale)` (above) is the one place this import happens.
- A deep import of a file inside any `src/lib/<domain>/` folder (`utils`, `styles` and `hooks` excepted), `src/lib/content/` included, static or dynamic, fails (`restrictions/lib-domain-deep-imports`, `restrictions/lib-domain-deep-dynamic-imports`): import `@/lib/content` itself, never a file inside it ([Folder structure](../global/folder-structure.md)).
- A string or template literal starting with an ADR-0003 URL prefix (`/stadt/`, `/rundgaenge/`, `/themen/`, `/bibliothek/`), and any literal internal path in an `href` (`/` included), fail (`restrictions/content-url-literals`): a link asks the graph for its URL instead of a component building one by hand. A route's own literal type (e.g. `PageProps<'/stadt/[viertel]'>`, which Next generates from the file path) is exempt — it isn't a URL a caller wrote.

The first, second and fourth bullets' restrictions turn off inside `src/lib/content/` itself, the one place they don't apply. The deep-import pair in the third bullet stays on even there: nothing in the module legitimately deep-imports itself, so unlike the others it has no file-based override to accidentally disable another check if it ever needed one — each gets its own rule name for exactly that reason (`eslint.config.mjs`'s own top-of-file comment). `eslint.config.test.ts` at the repo root exercises every restriction, in and out of the module, through ESLint's own API rather than fixture files `pnpm lint` would otherwise have to ignore.

## MDX lint

`eslint.config.mjs` lints `.mdx` with [`eslint-plugin-mdx`](https://github.com/mdx-js/eslint-mdx)'s flat `native` rules (remark-lint equivalents that run as real ESLint rules, not the deprecated `mdx/remark` fallback) plus code-block linting (`mdx.createRemarkProcessor({ lintCodeBlocks: true })`, so a fenced code block in content is linted like the language it claims).

Frontmatter parses as YAML (not as a stray heading) because `package.json`'s `remarkConfig` field lists `remark-frontmatter`: `eslint-plugin-mdx` detects a project's remark config automatically (via `unified-engine`) and reuses it for its own parsing, the same mechanism `next.config.ts` uses for the real build.

Content MDX (`src/content/**/*.mdx`) additionally rejects `import` and `export`: content can only use the component set the MDX provider registers, never its own. This is the `restrictions/content-mdx-import-export` rule in `eslint.config.mjs` (see the file's own comment for why each restriction gets the base rule under its own name).

## Spell check

`cspell.json` checks `src/content/**/*.mdx` (`pnpm spellcheck`, which `pnpm check` runs) against [`@cspell/dict-de-de`](https://github.com/streetsidesoftware/cspell-dicts) with compound words allowed: content is German only, for UI copy and content (PRODUCT.md), with no English fallback. Two `ignoreRegExpList` patterns keep non-prose text out of the check: frontmatter values for `id`/`slug`-like keys, and JSX tags and their props. The `words` list seeds the [glossary](../glossary.md)'s domain vocabulary and the brand's proper nouns (Xenia, Xeniapolis, Volkmann), which the German dictionary doesn't know.

## Pre-commit

`.lintstagedrc.mjs` runs ESLint and cspell on staged `.mdx`, and `content:check` once per commit when a staged file could affect the content graph: anything under `src/content/` or `src/lib/content/`, or a `meta.json` anywhere — the content, loader code, and the `meta.json`/Menus/site data inputs [About the architecture](../../explanation/about-architecture.md) shows feeding the loader, as later epic sub-issues add them.

## Links

`pnpm links:check` runs [`lychee`](https://github.com/lycheeverse/lychee) over the built `out/`, so run it after `pnpm build`. `--offline` checks local links only, so an unrelated external site being down can't fail a PR. `--root-dir` resolves root-relative hrefs (e.g. `/idee`) against the export's own files; lychee requires an absolute path for it.

CI and the Sandcastle sandbox (`sandbox.checkCommand` in `agents.yaml`) both run it, with the lychee version pinned in `scripts/install-lychee.sh`. Locally, install lychee with `brew install lychee`.
