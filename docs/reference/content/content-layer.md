---
type: reference
title: Content layer
description: Content types, document IDs, frontmatter validation, the content:check script and content quality tooling.
tags: [content, mdx, zod, validation, content-check, eslint, cspell, lychee]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Content layer

The loader and content graph live in `src/lib/content/`, with `index.ts` as their public API ([Folder structure](../global/folder-structure.md)). [ADR-0002](../../adr/adr-0002-own-content-loader-with-next-mdx.md) explains why this is our own code instead of a content framework.

## Content types

A content type is decided by where a file sits under `src/content`, not by a field in its frontmatter. **Seite** ([glossary](../glossary.md)) is a plain standalone page, such as Start, Idee, Kontakt, Impressum or Datenschutz. **Viertel** and **Zentrum** (issue #28) are the Stadt area's own types, located by a rule of their own: a document directly inside `src/content/stadt/<slug>/` is the Zentrum when `slug` is `zentrum`, a Viertel otherwise; `src/content/stadt/index.mdx` itself (no further segment) is a Seite, the Stadt area's landing page.

| Type    | Frontmatter fields                                                                 | Schema                                                     |
| ------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Seite   | `title`, `description`, `shortTitle` (optional)                                    | `seiteFrontmatterSchema` in `src/lib/content/schemas.ts`   |
| Viertel | `title`, `description`, `shortTitle` (optional), `leitsatz`, `steckbrief` (object) | `viertelFrontmatterSchema` in `src/lib/content/schemas.ts` |
| Zentrum | `title`, `description`, `shortTitle` (optional)                                    | `zentrumFrontmatterSchema` in `src/lib/content/schemas.ts` |

A Viertel's Steckbrief (glossary) is a nested frontmatter object: `prozessansatz`, `bauform`, `prozessdokument`, `imStadtzentrum`.

As further Wissensstadt content types arrive, each gets its own schema in `schemas.ts` and its own location rule in `src/lib/content/loader.ts`.

### Viertel numbers

A Viertel's number (glossary: fixed, 01–08) comes from its 1-based position in `src/content/stadt/viertel-order.json`, a bare JSON array of Viertel IDs in display order — never from frontmatter, so a `number` key in a Viertel's frontmatter is parsed and silently dropped. This is a separate mechanism from `meta.json`, not a reuse of it: `meta.json` strictly orders a folder's actual children for Navigation, and Viertel/Zentrum aren't part of that Seite-only tree, so a `meta.json` under `stadt/` would have no Seite children to validate against and would always fail. `loadViertelOrder` (`loader.ts`) reads the file; `orderViertel` (`viertel.ts`, pure, like `navigation.ts`) does the same strict reconciliation `meta.json` does — every listed ID must match an actual Viertel, every actual Viertel must be listed exactly once — and assigns `.number`. `buildContentGraph`'s result exposes the ordered list as `graph.viertel` and a lookup as `graph.getViertel(id)`; the single Zentrum is `graph.zentrum`.

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
