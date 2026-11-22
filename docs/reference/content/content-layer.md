---
type: reference
title: Content layer
description: Content types, document IDs, frontmatter validation and the content:check script.
tags: [content, mdx, zod, validation, content-check]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Content layer

The loader and content graph live in `src/lib/content/`, with `index.ts` as their public API ([Folder structure](../global/folder-structure.md)). [ADR-0002](../../adr/adr-0002-own-content-loader-with-next-mdx.md) explains why this is our own code instead of a content framework.

## Content types

A content type is decided by where a file sits under `src/content`, not by a field in its frontmatter. The first and currently only type is **Seite** ([glossary](../glossary.md)): a plain standalone page, such as Start, Idee, Kontakt, Impressum or Datenschutz.

| Type  | Frontmatter fields                              | Schema                                                   |
| ----- | ----------------------------------------------- | -------------------------------------------------------- |
| Seite | `title`, `description`, `shortTitle` (optional) | `seiteFrontmatterSchema` in `src/lib/content/schemas.ts` |

As the Wissensstadt content types arrive, each gets its own schema in `schemas.ts` and its own location rule in `src/lib/content/loader.ts`.

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

## Order and Navigation

A folder can hold a `meta.json` that lists its children's IDs in order and nothing else — the file is a bare JSON array of strings, validated by `metaSchema` in `schemas.ts`. The listed IDs are full document IDs (above, "Document IDs"), not names relative to the folder: a `meta.json` inside `src/content/eltern/` lists its children as `eltern/erstes`, `eltern/zweites`, not `erstes`, `zweites`.

```json
["idee", "kontakt", "impressum", "datenschutz"]
```

It is strict: every actual child of that folder must appear exactly once. An ID listed twice, an ID with no matching child, or a child missing from the list throws `ContentValidationError`, naming the `meta.json` file and the offending ID. A folder without a `meta.json` sorts its children by their type's natural key — date first (once a type carries one), then title — not by file system order.

`src/lib/content/navigation.ts` builds the Navigation tree ([glossary](../glossary.md)) from the folder hierarchy plus this order: a document's parent is the folder it sits in, and `''` (the root Seite) is the tree's root. `buildContentGraph`'s result exposes it as `graph.navigation` (the root `NavigationNode`, with nested `children`), plus `getBreadcrumbs(id)`, `getPrevious(id)` and `getNext(id)`, each returning `NavigationLink`s. A link's `title` is the document's Short title when it has one, the title otherwise.

## `content:check`

`scripts/content-check.mts` builds the content graph from a content directory — the real `src/content` by default, or a directory passed as its one argument — and exits non-zero on the first `ContentValidationError`, printing the file, field and reason. `pnpm content:check` runs it against the real content directory; `pnpm check` runs `content:check` after the test suite.

The script runs under plain Node, not a bundler, so it can't use path aliases like `@/lib/content`. It imports the content graph by relative path instead, with `scripts/ts-extension-loader.mjs` registered as a module hook: Node's native TypeScript support needs a file extension on every relative import, while the content graph's own files stay extensionless like the rest of the codebase. The hook only retries a failed relative resolution with `.ts` appended; it has no effect on the bundler that builds the actual site.
