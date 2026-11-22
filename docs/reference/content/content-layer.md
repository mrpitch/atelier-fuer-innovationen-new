---
type: reference
title: Content layer
description: Content types, document IDs, frontmatter validation, the content:check script and content quality tooling.
tags: [content, mdx, zod, validation, content-check, eslint, cspell, lychee, sitemap, seo]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Content layer

The loader and content graph live in `src/lib/content/`, with `index.ts` as their public API ([Folder structure](../global/folder-structure.md)). [ADR-0002](../../adr/adr-0002-own-content-loader-with-next-mdx.md) explains why this is our own code instead of a content framework.

## Content types

A content type is decided by where a file sits under `src/content`, not by a field in its frontmatter. **Seite** ([glossary](../glossary.md)) is a plain standalone page, such as Start, Idee, Kontakt, Impressum or Datenschutz. **Viertel** and **Zentrum** (issue #28) are the Stadt area's own types, located by a rule of their own: a document directly inside `src/content/stadt/<slug>/` is the Zentrum when `slug` is `zentrum`, a Viertel otherwise; `src/content/stadt/index.mdx` itself (no further segment) is a Seite, the Stadt area's landing page. **Aufsatz** (issue #29) is the Bibliothek area's own type, by the same kind of rule: a document directly inside `src/content/bibliothek/aufsaetze/<slug>/`. **Kapitel** and **Abschnitt** (issue #30) belong to the Leitthema, not to the Viertel they're set in: a Kapitel sits directly inside `src/content/leitthema/<slug>/`, and an Abschnitt one level deeper, inside its Kapitel's own folder. **Thema** (issue #31) — the Leitthema and each Themen-Ort — sits directly inside `src/content/themen/<slug>/`, both kinds at the same level; which kind a document is comes from whether its frontmatter carries a Kapitel reference, not from a further location rule: the Leitthema has none, a Themen-Ort does. `src/content/themen/index.mdx` itself is a Seite, the Themen area's landing page, the same way `src/content/stadt/index.mdx` is for the Stadt area.

| Type      | Frontmatter fields                                                                   | Schema                                                       |
| --------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Seite     | `title`, `description`, `shortTitle` (optional), `draft` (optional, default `false`) | `seiteFrontmatterSchema` in `src/lib/content/schemas.ts`     |
| Viertel   | `title`, `description`, `shortTitle` (optional), `leitsatz`, `steckbrief` (object)   | `viertelFrontmatterSchema` in `src/lib/content/schemas.ts`   |
| Zentrum   | `title`, `description`, `shortTitle` (optional)                                      | `zentrumFrontmatterSchema` in `src/lib/content/schemas.ts`   |
| Aufsatz   | `title`, `description`, `shortTitle` (optional), `viertelId` (reference)             | `aufsatzFrontmatterSchema` in `src/lib/content/schemas.ts`   |
| Kapitel   | `title`, `description`, `shortTitle` (optional), `viertelId` (reference)             | `kapitelFrontmatterSchema` in `src/lib/content/schemas.ts`   |
| Abschnitt | `title`, `description`, `shortTitle` (optional)                                      | `abschnittFrontmatterSchema` in `src/lib/content/schemas.ts` |
| Thema     | `title`, `description`, `shortTitle` (optional), `kapitelId` (optional reference)    | `themaFrontmatterSchema` in `src/lib/content/schemas.ts`     |

A Viertel's Steckbrief (glossary) is a nested frontmatter object: `prozessansatz`, `bauform`, `prozessdokument`, `imStadtzentrum`.

As further Wissensstadt content types arrive, each gets its own schema in `schemas.ts` and its own location rule in `src/lib/content/loader.ts`.

### References

A frontmatter field can hold another document's ID instead of a value of its own — a reference (issue #29). Aufsatz's `viertelId` is the first one: it names the Viertel the Aufsatz belongs to. The field is validated as a non-empty string in `schemas.ts` like any other string field — a Zod schema can't see the rest of the content graph to check the ID exists — so the actual check happens once every document is loaded, via `resolveReference` in `src/lib/content/references.ts`. That function is the one generic resolution mechanism for every reference field: given the referring file, the field name, the ID and the target collection it points into, it returns the matching document or throws `ContentValidationError` naming the file, the field and the missing ID. A later reference field reuses this same function against its own target collection — it needs no resolution code of its own, only a call site. A reference field's frontmatter key ends in `Id` (`viertelId`, not `viertel`) so its value — a document ID, not prose — is skipped by the spell check the same way `id`/`slug` keys already are.

Aufsatz's reading time (`readingTimeMinutes`) is computed from its body's word count by `src/lib/content/reading-time.ts`, shown via the dictionary key `aufsatz.readingTime` ("ca. {n} Min."). A Viertel's related Aufsätze (`graph.getAufsaetzeByViertel(id)`, "Mehr aus dem Viertel") are derived the same way: filtered from the already-resolved Aufsätze by their `viertelId`, never listed by hand in the Viertel's own frontmatter or body.

### Viertel numbers

A Viertel's number (glossary: fixed, 01–08) comes from its 1-based position in `src/content/stadt/viertel-order.json`, a bare JSON array of Viertel IDs in display order — never from frontmatter, so a `number` key in a Viertel's frontmatter is parsed and silently dropped. This is a separate mechanism from `meta.json`, not a reuse of it: `meta.json` strictly orders a folder's actual children for Navigation, and Viertel/Zentrum aren't part of that Seite-only tree, so a `meta.json` under `stadt/` would have no Seite children to validate against and would always fail. `loadViertelOrder` (`loader.ts`) reads the file; `orderViertel` (`viertel.ts`, pure, like `navigation.ts`) does the same strict reconciliation `meta.json` does — every listed ID must match an actual Viertel, every actual Viertel must be listed exactly once — and assigns `.number`. `buildContentGraph`'s result exposes the ordered list as `graph.viertel` and a lookup as `graph.getViertel(id)`; the single Zentrum is `graph.zentrum`.

### Kapitel and Abschnitt numbers

A Kapitel's number is its referenced Viertel's number (issue #30, [ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)): "Kapitel n = Viertel n" by construction, never written in frontmatter. `resolveKapitel` (`kapitel.ts`, pure, like `viertel.ts`) resolves the `viertelId` reference via `resolveReference` and derives the number and URL (`/stadt/{viertel}/kapitel-{n}`) from the resolved Viertel. A Viertel has at most one Kapitel; a second one referencing the same Viertel throws `ContentValidationError` naming the file, `viertelId` and the Viertel that already has one.

An Abschnitt's position comes from its Kapitel's own `meta.json` — a bare JSON array of Abschnitt IDs, the same shape as the generic `meta.json` above, but read directly for one Kapitel by `loadAbschnittOrder` (`loader.ts`) rather than through the generic `listMetaFiles`/`loadMeta` scan: that scan excludes a Kapitel folder's `meta.json`, since it orders Abschnitte, not Seite children, and would otherwise fail `buildNavigation`'s strict Seite-only validation. `orderAbschnitte` (`abschnitt.ts`, pure) does the same strict reconciliation as `orderViertel` and assigns each Abschnitt's position, number (`"{kapitelNumber}.{position}"`, e.g. "4.3"), URL (`/stadt/{viertel}/kapitel-{n}/{m}`) and reading time (`reading-time.ts`, the same mechanism Aufsatz uses).

`buildContentGraph`'s result exposes the Kapitel list as `graph.kapitel` (in Kapitel number order) with `graph.getKapitel(id)` and `graph.getKapitelByViertel(viertelId)` lookups, and a Kapitel's Abschnitte as `graph.getAbschnitteByKapitel(kapitelId)` — never listed by hand on the Kapitel itself, so "N Abschnitte" is always this list's length. Previous/next across Abschnitte (`graph.getPreviousAbschnitt(id)`/`getNextAbschnitt(id)`) crosses from the last Abschnitt of one Kapitel to the first of the next, in Kapitel number order — its own navigation, built by `buildAbschnittNavigation` (`abschnitt.ts`), separate from the Seite-only Navigation tree above since Kapitel/Abschnitt aren't Seite.

### Thema and Themen-Ort

A Thema's URL (issue #31, [ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)) is `/themen/{slug}`, its own slug under that fixed prefix — `resolveThemen` (`thema.ts`, pure, like `kapitel.ts`) derives it, never the folder path generically. A Themen-Ort's `kapitelId` names the one Kapitel of the Leitthema it branches off from; `resolveThemen` checks it via `resolveReference` the same way Aufsatz's and Kapitel's own reference fields do. The Leitthema carries no `kapitelId`, so it isn't checked against anything — its landing page instead lists every Kapitel (`graph.kapitel`, in Kapitel number order), not one it references.

`buildContentGraph`'s result exposes the Themen list as `graph.themen` with a `graph.getThema(id)` lookup, and a Kapitel's Themen-Ort(e) as `graph.getThemenByKapitel(kapitelId)` — derived from each Thema's Kapitel reference, never listed by hand on the Kapitel itself, the same derivation `graph.getAufsaetzeByViertel` uses.

### Illustrations

Each Viertel and the Zentrum has an illustration, looked up by the owning document's ID — content never names an illustration file. `src/components/viertel/illustration.tsx` holds the registry (the same lookup-by-key pattern as the [icon registry](../components/icon-registry.md)), currently mapping every ID to one shared placeholder until the real illustrations (PRODUCT.md, Evidence on Hand) are built.

## Document IDs

A document's ID is the path under `src/content`, without extension or locale suffix:

- A `.mdx` file named `index.mdx` represents the folder it sits in; its own `index` segment is dropped, not kept as part of the ID. `src/content/index.mdx` is the ID `''`; `src/content/idee/index.mdx` is the ID `idee`.
- A trailing locale suffix (e.g. `.de`) is dropped the same way, so a later translation of a document shares its non-localised ID.

For Seite, the ID doubles as the URL rule: the URL is the Seite's folder path, so ID `''` is `/` and ID `idee` is `/idee` ([ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)).

## Frontmatter validation

`src/lib/content/frontmatter.ts` splits a document into its YAML frontmatter and MDX body by hand and parses the YAML with the `yaml` package — not `gray-matter` 4, which is unmaintained. `src/lib/content/loader.ts` then validates the parsed frontmatter against the type's Zod schema.

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

`buildContentGraph(contentDir)` (`src/lib/content/graph.ts`) is the one public interface for content: it runs the loader over `contentDir` and returns a `ContentGraph` with a `seiten` list, a `getSeite(id)` lookup, and the Navigation reads below. Taking `contentDir` as a parameter, rather than hardcoding `src/content`, is what lets tests point it at a fixture directory ([Testing conventions](../testing/testing-conventions.md)).

`graph.getBody(id)` compiles a Seite's, Viertel's or the Zentrum's MDX body through Next's MDX pipeline and returns its component (issue #55): pages render a body through this instead of importing `@/content` themselves. Unlike the rest of the graph, it always imports from the real `src/content` through the `@/content` alias — a bundler-resolved path a fixture directory can't stand in for — so it isn't exercised by `buildContentGraph`'s fixture-backed tests. `id === ''` (the root Seite) gets its own literal import: the general `@/content/${id}/index.mdx` pattern can't resolve it, because the resulting path would have no folder segment between `content` and `index.mdx` (issue #25).

## Order and Navigation

A folder can hold a `meta.json` that lists its children's IDs in order and nothing else — the file is a bare JSON array of strings, validated by `metaSchema` in `schemas.ts`. The listed IDs are full document IDs (above, "Document IDs"), not names relative to the folder: a `meta.json` inside `src/content/eltern/` lists its children as `eltern/erstes`, `eltern/zweites`, not `erstes`, `zweites`.

```json
["idee", "kontakt", "impressum", "datenschutz"]
```

It is strict: every actual child of that folder must appear exactly once. An ID listed twice, an ID with no matching child, or a child missing from the list throws `ContentValidationError`, naming the `meta.json` file and the offending ID. A folder without a `meta.json` sorts its children by their type's natural key — date first (once a type carries one), then title — not by file system order.

`src/lib/content/navigation.ts` builds the Navigation tree ([glossary](../glossary.md)) from the folder hierarchy plus this order: a document's parent is the folder it sits in, and `''` (the root Seite) is the tree's root. `buildContentGraph`'s result exposes it as `graph.navigation` (the root `NavigationNode`, with nested `children`), plus `getBreadcrumbs(id)`, `getPrevious(id)` and `getNext(id)`, each returning `NavigationLink`s. A link's `title` is the document's Short title when it has one, the title otherwise.

## Site data

`src/content/site.json` holds the site-wide facts that would otherwise be restated in several places: `name`, `tagline`, `baseUrl` and `copyright`, validated by `siteSchema` in `schemas.ts`. `buildContentGraph`'s result exposes it as `graph.site`; the header, footer and the root layout's metadata all read it from there instead of hardcoding it. A validation failure throws `ContentValidationError` the same way frontmatter does, with `file` set to `site.json`.

`baseUrl` is a placeholder (`https://xenia.example.com`) until a real production domain is decided; it feeds `metadataBase` in `src/app/layout.tsx`, which resolves the per-page canonical link in `src/app/[[...slug]]/page.tsx`.

## Sitemap

`graph.sitemap` (`src/lib/content/graph.ts`, built by `listSitemap` in `navigation.ts`) is the whole Navigation tree flattened into one list, in Navigation order, leaving out a Draft's own entry — its published children, if any, still appear. The Sitemap page and `sitemap.xml` both read this one list instead of re-deriving it (issue #34).

A **Draft** (glossary) is a Seite with `draft: true` in its frontmatter (`seiteFrontmatterSchema` in `schemas.ts`, default `false`): written and checked but not yet published.

`src/content/sitemap/index.mdx` is a plain Seite like any other, whose body is a single `<SitemapList />` — the one MDX component the provider (`src/mdx-components.tsx`) currently registers. The component (`src/components/navigation/sitemap-list.tsx`) reads the content graph itself, unlike Breadcrumbs and PreviousNext, because it sits inside the Sitemap Seite's own MDX body rather than being handed items by `page.tsx`. `src/content/menus/footer.json` links to it like any other Seite, by ID.

`src/app/sitemap.ts` follows Next's `sitemap.ts` file convention to produce `sitemap.xml` in the build output: every `graph.sitemap` entry resolved to an absolute URL against `graph.site.baseUrl`. It exports `dynamic = 'force-static'` because a static export can't revalidate a Route Handler at runtime ([Static export](../react/static-export.md)).

## Canonical URL and Open Graph tags

`src/app/[[...slug]]/page.tsx`'s `generateMetadata` sets a page's canonical URL (`alternates.canonical`) and Open Graph tags (`openGraph.title`, `.description`, `.url`, `.siteName`) from the Seite and `graph.site` — never written per page. Both resolve to an absolute URL via `metadataBase` (`src/app/layout.tsx`, set from `graph.site.baseUrl`).

## Menus

A Menu (glossary: Menu) is a hand-curated, ordered list of links such as the header or footer. Each Menu is its own JSON file under `src/content/menus/`, named after the Menu (`header.json`, `footer.json`), validated by `menuSchema` in `schemas.ts`. An entry is either a content reference or an external link:

```json
[{ "id": "idee" }, { "url": "https://example.com", "label": "Extern" }]
```

A content entry's label is never written in the Menu file: the content graph resolves it from the target Seite's Short title, falling back to its title — the same rule Navigation uses. An external entry carries its own `label`. `src/lib/content/menu.ts` does this resolution; it stays pure like `navigation.ts`, with the loader's `loadMenus` (`loader.ts`) doing the one filesystem read.

`buildContentGraph`'s result exposes `graph.getMenu(name)`, returning the resolved list of `{ url, label }` links, or an empty list for a Menu with no file. An entry whose ID has no matching Seite throws `ContentValidationError` naming the Menu file (e.g. `menus/header.json`) and the offending ID — the same way an unknown `meta.json` ID does.

## `content:check`

`scripts/content-check.mts` builds the content graph from a content directory — the real `src/content` by default, or a directory passed as its one argument — and exits non-zero on the first `ContentValidationError`, printing the file, field and reason. `pnpm content:check` runs it against the real content directory; `pnpm check` runs `content:check` after the test suite.

The script runs under plain Node, not a bundler, so it can't use path aliases like `@/lib/content`. It imports the content graph by relative path instead, with `scripts/ts-extension-loader.mjs` registered as a module hook: Node's native TypeScript support needs a file extension on every relative import, while the content graph's own files stay extensionless like the rest of the codebase. The hook only retries a failed relative resolution with `.ts` appended; it has no effect on the bundler that builds the actual site.

## Content-graph boundaries

`eslint.config.mjs` guards the rule "only `src/lib/content/` reads content" ([About the architecture](../../explanation/about-architecture.md), [ADR-0003](../../adr/adr-0003-urls-from-content-graph-rules.md)) at lint time instead of leaving it to review alone (issue #55). Outside `src/lib/content/`, under `src/`:

- `fs`, `node:fs` and their `/promises` variants fail (`restrictions/content-fs-imports`): a file read belongs in `loader.ts`, exposed through the graph.
- An import of `@/content` or anything under it, static or dynamic — including a dynamic import keyed by a template literal — fails (`restrictions/content-module-imports`, `restrictions/content-dynamic-imports`): ask `@/lib/content` instead. `graph.getBody(id)` (above) is the one place this import happens.
- A deep import of a file inside `src/lib/content/`, static or dynamic, fails (`restrictions/content-graph-deep-imports`, `restrictions/content-graph-deep-dynamic-imports`): import `@/lib/content` itself, never a file inside it ([Folder structure](../global/folder-structure.md)).
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

## CI

`.github/workflows/ci.yml`'s `check` job runs [`lychee`](https://github.com/lycheeverse/lychee) over the built `out/` after `pnpm build`, with `--offline` so only local links are checked (an unrelated external site being down can't fail a PR) and `--base out` so root-relative hrefs resolve against the export's own files.
