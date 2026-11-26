---
type: reference
title: Content layer
description: Rules of the content layer and the reasons behind them; content types, IDs, URLs, references, order, Drafts, translations, bodies, Menus, the Sitemap and the content quality checks.
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
last_reviewed: 2026-11-25
authoritative: true
---

# Content layer

The rules of the content layer and why they hold. For the API, read the code: `src/lib/content/index.ts` is the public entry, and `ContentGraph` in `src/lib/content/graph.ts` is the interface every page, Menu, metadata function and the sitemap read from. [ADR-0002](../../adr/adr-0002-own-content-loader-with-next-mdx.md) explains why this is our own code instead of a content framework; [ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md) why URLs come from the graph.

## The content graph

- **One way to content.** Pages, layouts, Menus, metadata, `sitemap.xml` and `content:check` read content only through the graph. Routes and components call `contentGraph()`; tests and scripts call `buildContentGraph(contentDir, options)` on any directory, which is what lets a test load a fixture directory ([Testing conventions](../testing/testing-conventions.md)). The lint rules in [Content-graph boundaries](#content-graph-boundaries) enforce this.
- **Validate everything, then cut down.** Building loads and validates every document of every type, Drafts and translations included (frontmatter, references, order files, bodies), and only then leaves out what isn't visible and assigns numbers. A Draft is still a real file, so it must be valid.
- **One failure shape.** Every content problem throws `ContentValidationError` with `file` (path under the content directory), `field` (frontmatter key, dotted path, or a `meta.json`/Menu ID) and `reason`, because those three are what a fix needs. An authoring agent fixes its own mistake from the message alone.
- **Pure except the loader.** `loader.ts` does the only file system reads; every other module in `src/lib/content/` is pure, so it can be tested without a disk.
- **Derived, never written.** Numbers, URLs, counts, reading times, Rundgang durations and related lists (a Viertel's Aufsätze, Kapitel and Stationen; a Kapitel's Themen-Ort) are computed from content. No frontmatter field, Menu label or component restates them.

## Content types

A document's type is decided by where its file sits under `src/content`, not by a frontmatter field. Every type has `title`, `description`, an optional `shortTitle` and an optional `draft`, through one shared `BaseDocument`.

| Type      | Location                                    | Frontmatter beyond the shared fields                                                          |
| --------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Seite     | anywhere not listed below                   | none                                                                                          |
| Viertel   | `stadt/<slug>/` (slug is not `zentrum`)     | `leitsatz`, `steckbrief`, `untertitel` (optional), `hinweisId` (optional, any-type reference) |
| Zentrum   | `stadt/zentrum/`                            | none                                                                                          |
| Aufsatz   | `bibliothek/aufsaetze/<slug>/`              | `viertelId` (reference)                                                                       |
| Kapitel   | `leitthema/<slug>/`                         | `viertelId` (reference), `untertitel` (optional)                                              |
| Abschnitt | `leitthema/<kapitel>/<slug>/`               | `leitsatz` (optional), `jahr` (optional)                                                      |
| Rundgang  | `rundgaenge/<slug>/`                        | `leitsatz` (optional), `kennzeichen` (optional), `themaId` (optional reference)               |
| Station   | `rundgaenge/<rundgang>/<slug>/`             | `ortId` (optional reference to an Ort), `lage` (optional)                                     |
| Thema     | `themen/<slug>/` (Leitthema and Themen-Ort) | `kapitelId` (optional reference)                                                              |

- A Kapitel belongs to the Leitthema, not to the Viertel it is set in, so its files sit under `leitthema/`.
- A Thema without `kapitelId` is the Leitthema; with one it is a Themen-Ort branching off that Kapitel.
- The Steckbrief is a nested object: `prozessansatz`, `bauform`, `prozessdokument`, `imStadtzentrum`.
- `Ort` (glossary) is the TypeScript alias for `Viertel | Zentrum`, the one place that union is named — `ortId` and every other spot the code needs either type write `Ort` instead of writing the union out again.
- A Rundgang's `themaId` (issue #116) names the Thema it tells, checked against the actual Thema like any other reference; a published Rundgang naming a missing or Draft Thema fails. `leitsatz` and `kennzeichen` are its own free-standing fields, not references. A Station's `lage` is the same: a free-standing field, passed through unchanged.
- Schemas live in `src/lib/content/schemas.ts`; types are inferred from them, with no code generation step. A key a schema doesn't know (e.g. a `number`) is dropped, so a number can never be typed into frontmatter.
- Frontmatter is parsed with the `yaml` package, not `gray-matter` 4, which is unmaintained.

## Document IDs

A document's ID is its path under `src/content` without extension or locale suffix. `index.mdx` stands for its folder: `src/content/idee/index.mdx` is `idee`, and the root `src/content/index.mdx` is `''`. A translation (`index.<locale>.mdx`) shares its German document's ID. IDs are unique across types because paths are, and an ID is also the document's folder, which is what relative body image paths resolve against.

## URLs

Each type has exactly one URL rule, in `src/lib/content/urls.ts` (ADR-0003):

- Seite, Viertel, Zentrum, Aufsatz, Rundgang, Thema: the folder path (`''` is `/`, `stadt/kontexte` is `/stadt/kontexte`).
- Kapitel: its Viertel's URL plus `kapitel-{n}`. Abschnitt: its Kapitel's URL plus its position. Station: its Rundgang's URL plus its number.

A URL is built from these rules and parsed in one place, `graph.resolveUrl`, which returns the document and its `kind`. Routes never parse IDs or URL segments themselves, and no code outside the graph writes an internal path by hand.

## References

A reference is a frontmatter field holding another document's ID (`viertelId`, `ortId`, `kapitelId`, `themaId`), or an ID prop of a body component (`<ViertelTeaser id>`). A reference field may be optional, like `ortId` or `themaId`: unset, it resolves to nothing; set, it is checked exactly like a required one. A Zod schema can't see other documents, so the schema checks only that the field is a string; one generic resolver (`resolveReference`) checks every same-type reference once all documents are loaded. A new reference field reuses it and needs no resolution code of its own.

A reference to a missing document fails naming the referring file, the field and the ID. References resolve against the full set, Drafts included, so a Draft may reference a Draft. For a published document referencing a Draft, see [Drafts](#drafts).

A reference may instead name a document of **any** type: a Menu entry's `id`, or a Viertel's optional `hinweisId` (issue #93), resolved to the target's Short title and URL for the Viertel page's Hinweis link. Both reuse a second generic resolver, `resolveAnyReference`, against the full set of known IDs and the visible ones' resolved shape — the same failure shape a same-type reference gives, naming the referring file, the field and the ID.

## Order and numbers

Order lives in one place per folder: a `meta.json` that is a bare JSON array of child IDs and nothing else, with full IDs (`eltern/erstes`, not `erstes`).

```json
["idee", "impressum", "datenschutz"]
```

- **Strict.** When a `meta.json` exists, every child appears exactly once. A duplicate, an unknown ID or an unlisted child fails, naming the `meta.json` and the ID, so order can't drift silently. One reconciliation function handles every order file.
- **Optional for Seiten.** A folder of Seiten without `meta.json` sorts by natural key: date (once a type has one), then title.
- **Required** for `stadt/meta.json` (the Viertel), `rundgaenge/meta.json` (the Rundgänge, issue #116), each Kapitel's `meta.json` (its Abschnitte) and each Rundgang's `meta.json` (its Stationen).

Numbers are positions, never frontmatter:

- **Viertel:** its 1-based position in `stadt/meta.json`.
- **Rundgang:** its 1-based position in `rundgaenge/meta.json` (issue #116); its previous/next neighbours and the Schauen Gangart (an Ort's first Rundgang with a Station there, graph.ts's `getSchauenRundgang`) follow the same order.
- **Kapitel:** its Viertel's number, so "Kapitel n = Viertel n" holds by construction. A second Kapitel set in the same Viertel fails.
- **Abschnitt:** `{kapitel}.{position}`, e.g. "4.3".
- **Station:** its position in the Rundgang, counted from 0 when the first Station stands at the Zentrum and from 1 otherwise. Its `lastNumber` is the last Station's own number ("Station n von N"), and `remainingMinutes` sums its own and every following Station's reading time — both derived the same way as the count and duration above, never written in frontmatter.

Numbers are assigned after Drafts are left out, so a production graph has no gaps. A Draft earlier in an order shifts the numbers (and numbered URLs) of later documents between `next dev` and a production build; ADR-0003 accepts that numbered URLs depend on position.

## Navigation, breadcrumbs, previous/next

- The **Navigation** tree is the Seite folder hierarchy in `meta.json` order, rooted at the start Seite. Only Seiten are in it.
- **Breadcrumbs** cover every type: Seite ancestors, then type ancestors, the document last. A Kapitel is read inside its Viertel, an Abschnitt inside its Kapitel, a Station inside its Rundgang (Start › Stadt › Viertel › Kapitel › Abschnitt).
- **Previous/next** walks one sequence per type: Seiten their Navigation siblings; Viertel their `stadt/meta.json` number order; Rundgänge their `rundgaenge/meta.json` order (issue #116); Kapitel in number order; Abschnitte in number order across Kapitel boundaries; Stationen within their own Rundgang; Themen in the order their files are read, since that folder takes no `meta.json` (issue #82). The Zentrum and every other type have none: a one-document "sequence" never has a previous or a next.
- A link's label is the target's Short title, else its title. The page's own `<h1>` is always the full title.

## Drafts

A Draft (`draft: true`, any type) is written and checked but not published.

- **Production** (`next build`, `content:check`): a Draft has no page, and is left out of lists, getters, counts, related lists, Navigation, breadcrumbs, previous/next, Menus, the Sitemap, `sitemap.xml` and localized documents. A Draft Seite's published children move up to its nearest visible ancestor instead of disappearing.
- **`next dev`**: a Draft renders like any document, so an author can preview it. The Sitemap stays published-only even here.
- **Still validated**: a Draft's frontmatter, references, body, images, translations and its place in order files are checked in both modes.
- **No published path to a Draft**: in production, a published document, Menu entry or `<ViertelTeaser id>` that references a Draft fails, naming the referring file and the Draft's file. So does a published Abschnitt or Station inside a Draft Kapitel or Rundgang, since its URL hangs off that parent.

`contentGraph()` sets development mode only for `NODE_ENV === 'development'`; every other caller gets the strict production behaviour.

## Translations

German is the default locale: no file suffix, no URL prefix ([ADR-0001](../../adr/adr-0001-unprefixed-default-locale-urls.md)). No other locale is configured or shipped; the plumbing is exercised by test fixtures with a test-only locale.

- A translation is a sibling `index.<locale>.mdx` of the German document, for any type.
- It holds only translatable fields: `title`, `shortTitle`, `description`, `slug`, the body, and on a Viertel `leitsatz`, `steckbrief` and `untertitel`, on a Kapitel `untertitel`, on an Abschnitt `leitsatz` and `jahr`. Every other field (numbers, references, Draft state) is inherited from the German document, so it is never duplicated per language — a Viertel's `hinweisId` and its resolved `hinweis` stay German-only for the same reason, even though `untertitel` next to it is translatable. A non-translatable field in a translation fails, naming the file and field.
- An omitted translatable field falls back to the German value; a missing translation falls back to the whole German document under the locale's prefix.
- A localized URL is `/<locale>` plus the type's URL rule applied to translated slugs: a translated `slug` replaces the document's own last segment, an ancestor Seite's translated slug replaces its folder name, and a missing translation keeps the German segment.
- A translation file next to no document fails for a configured locale; one for an unconfigured locale is never read.
- Breadcrumbs, previous/next and related lists exist only in German. A localized page asks the getter with its locale for each document it shows.

## Bodies

- **Components, not imports.** Content MDX can't `import` or `export` (lint, below); it uses only the component set registered in `src/mdx-components.tsx`. This keeps content portable and lets the graph check every component's ID props like frontmatter references.
- **Components that point to content read the graph themselves** (`ViertelTeaser`, `SitemapList`): a route can't know in advance which IDs a body references, so it can't hand them in.
- **Images sit next to their MDX file** and are referenced relatively with `![alt](path)`, because content can't know its page URL (a Kapitel's URL isn't its folder). A missing image fails, naming the file and path.
- **Images are copied, not served from `src`.** A static export has no server, so `pnpm content:images` (first step of `pnpm build`) copies published bodies' images to `public/content/`, which is generated and gitignored. A Draft's images are checked but not copied.
- **Every route renders a body as `<Body components={bodyImageComponents(id)} />`**, which points relative `img` paths at their copied location. A body rendered without it has broken images. Images are plain `<img>`: their dimensions are unknown and the export is unoptimized anyway ([Static export](../react/static-export.md)).
- **Bodies are compiled modules.** `graph.getBody(id, locale)` imports the MDX through the `@/content` alias, the one place that import is allowed. Because it is bundler-resolved, fixture-based graph tests don't cover it; the static build does.

## Illustrations

Each Viertel, the Zentrum, each Thema and each Rundgang has an illustration, looked up by the owning document's ID in `src/components/ui/illustration.tsx` (the same pattern as the [icon registry](../components/icon-registry.md)). Content never names an illustration file.

## Site data and Menus

- `src/content/site.json` holds the site-wide facts: `name`, `tagline`, `baseUrl`, `copyright`. Header, footer and metadata read them from `graph.site`. `baseUrl` is a placeholder until the production domain is decided.
- A Menu is one JSON file under `src/content/menus/` (`header.json`, `footer.json`, `footer-legal.json`): either a flat, ordered list of entries, or an ordered list of Menu groups (glossary: Menu group) — never both in the same file. An entry is a content ID (`{ "id": "idee" }`) or an external link with its own label (`{ "url": "…", "label": "…" }`). A group is a `label` and its own non-empty, ordered list of entries in that same shape. Mixing entries and groups in one Menu file, or a group with no entries, fails validation the same way other Menu problems do.
- A content entry may name any type. Its label is never written in the Menu: it is the target's Short title, else its title, so renaming a document updates every Menu. An unknown ID fails, naming the Menu file and the ID — the same whether the entry sits flat in the Menu or inside a group.
- `header` and `footer-legal` must resolve flat; `footer` must resolve grouped (RootLayout's own convention, not something a Menu file states about itself) — a Menu edited into the other shape fails validation the same way, naming the Menu file, rather than only crashing the Next.js build.

## Sitemap and page metadata

- `graph.sitemap` is one published-only tree: the Navigation tree, with each type nested under its area's Seite (Zentrum and Viertel under Stadt, Aufsätze under Bibliothek, Kapitel with their Abschnitte under Leitthema, Themen under Themen, Rundgänge with their Stationen under Rundgänge), each in its own number or list order. An area without a published Seite attaches to the nearest published ancestor.
- The Sitemap Seite (`<SitemapList />`) and `sitemap.xml` both read this tree, so a new type joins both in one place.
- Every page gets its canonical URL and Open Graph tags from one helper, `documentMetadata` in `src/lib/utils/document-metadata.ts`, never written per page. URLs become absolute through `metadataBase`, set from `site.baseUrl`.
- **`pnpm pages:check`** (last step of `pnpm build`) checks the built `out/`: every page is in `sitemap.xml` and has a canonical link and `og:title`, `og:description`, `og:url` and `og:site_name` pointing at itself. Page routes arrive one content type at a time; this catches a new route that skips the sitemap or the metadata helper.

## `content:check`

`pnpm content:check` (`scripts/content-check.mts`) builds the graph from `src/content` (or a directory given as its argument) with production visibility and exits non-zero on the first `ContentValidationError`, printing file, field and reason. `pnpm check` runs it, so does the pre-commit hook when content changes.

The script runs under plain Node, so it imports the graph by relative path and registers `scripts/ts-extension-loader.mjs`: Node's TypeScript support needs file extensions on relative imports, while the graph's files stay extensionless like the rest of the codebase. The hook has no effect on the site build.

## Content-graph boundaries

`eslint.config.mjs` enforces "only `src/lib/content/` reads content" ([About the architecture](../../explanation/about-architecture.md)) under `src/`:

- `fs` and `node:fs` imports fail outside `src/lib/content/`.
- Imports of `@/content`, static or dynamic, fail outside `src/lib/content/`.
- A deep import into any `src/lib/<domain>/` folder (except `utils`, `styles`, `hooks`) fails: import the domain's entry, e.g. `@/lib/content`.
- A string or template literal starting with `/stadt/`, `/rundgaenge/`, `/themen/` or `/bibliothek/`, and any literal internal path in an `href`, fail outside `src/lib/content/`: links ask the graph. Next's generated route types (`PageProps<'/stadt/[viertel]'>`) are exempt.
- `@/lib/content` imports `server-only`, so a Client Component that imports the graph fails `next build`.

Each restriction has its own rule name so an override for one can't switch off another (see the comment at the top of `eslint.config.mjs`). `eslint.config.test.ts` exercises each one through ESLint's API.

## MDX lint

`eslint.config.mjs` lints `.mdx` with [`eslint-plugin-mdx`](https://github.com/mdx-js/eslint-mdx)'s flat `native` rules plus code-block linting. Frontmatter parses as YAML because `package.json`'s `remarkConfig` lists `remark-frontmatter`, which `eslint-plugin-mdx` picks up automatically. Content MDX (`src/content/**/*.mdx`) rejects `import` and `export`. `.mdx` is excluded from Prettier, whose MDX parser predates MDX 3.

## Spell check

`pnpm spellcheck` (part of `pnpm check`) runs cspell over `src/content/**/*.mdx` with `@cspell/dict-de-de` and compound words allowed. `cspell.json` ignores frontmatter ID/slug values and JSX tags and props, and its word list holds the [glossary](../glossary.md) terms and the brand's proper nouns.

## Pre-commit

`.lintstagedrc.mjs` runs ESLint and cspell on staged `.mdx`, and `content:check` once per commit when a staged file could change the graph: anything under `src/content/` or `src/lib/content/`, or any `meta.json`.

## Links

`pnpm links:check` runs [`lychee`](https://github.com/lycheeverse/lychee) over the built `out/`, so run it after `pnpm build`. `--offline` checks local links only, so an unrelated external site being down can't fail a PR. `--root-dir` resolves root-relative hrefs (e.g. `/idee`) against the export's own files; lychee requires an absolute path for it.

CI and the Sandcastle sandbox (`sandbox.checkCommand` in `agents.yaml`) both run it, with the lychee version pinned in `scripts/install-lychee.sh`. Locally, install lychee with `brew install lychee`.
