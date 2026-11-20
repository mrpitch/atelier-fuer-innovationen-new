---
type: adr
title: 'ADR-0002: Own content loader with @next/mdx, no content framework'
description: Content is loaded and validated by our own loader and content graph, and MDX is compiled by @next/mdx, because every cross-document rule has to live in our code anyway.
tags: [adr, content, mdx, build]
status: accepted
date: 2026-11-20
---

# ADR-0002: Own content loader with @next/mdx, no content framework

## Context and Problem Statement

Content is MDX in `src/content`. Frontmatter is validated per type, and cross-document references, derived values (numbers, counts, reading time), ordering and locale inheritance have to be resolved at build time. The site is a Next.js 16 static export built with Turbopack. In November 2026 no content framework validated cross-collection references or did locale inheritance, so a content graph module of our own was needed whatever framework we picked.

## Decision

Our own loader reads `src/content`, parses frontmatter, validates it with a Zod schema per content type and feeds the content graph. `@next/mdx` compiles MDX bodies as modules for Server Components. With the graph already ours, a framework would only have added a second model of the same content and a dependency that could break on Next or Turbopack upgrades.

## Consequences

- Good: Every content rule lives in one module that can be tested with fixture content.
- Good: There is no third-party content pipeline and no generated code; types come from the Zod schemas.
- Good: MDX compiles as bundler modules, so there is no `new Function` at runtime.
- Bad: Loading, watching and caching are our code to maintain.
- Bad: A content edit during `next dev` needs a page reload; nothing hot-reloads frontmatter.
- Bad: Turbopack only accepts remark and rehype plugins as package names with serialisable options, so we can't pass inline plugin functions to `@next/mdx`.

## Considered Options

- Fumadocs MDX (headless): page tree, `meta.json` ordering and per-locale files built in, but it has no cross-document references, its locale files don't inherit from each other, and it was the old site's approach. This is a fresh build.
- Content Collections: Standard Schema, `documents()` joins, and failed validation exits the build. But its MDX package and Next plugin are the stale parts of the project, and our joins would sit in the graph anyway.
- Velite: validation only warns by default, the dev watcher is broken on Next 16, and builds race against generated output under Turbopack.
- Contentlayer: unmaintained since 2023.
