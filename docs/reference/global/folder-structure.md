---
type: reference
title: Folder structure
description: Where code lives under src/ (app, components, lib, content), how files are named, and when a concern in src/lib gets its own domain folder.
tags: [architecture, folder-structure, conventions, components, lib]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Folder structure

```text
src/
├── app/                 routes: layouts, pages, metadata, generateStaticParams
├── components/
│   ├── ui/              shadcn primitives and the icon registry (icons.tsx)
│   ├── pro-blocks/      shadcndesign Pro Blocks, one folder per block category
│   ├── utils/           providers without markup of their own (theme-provider.tsx)
│   └── <feature>/       project components by feature: layout/, viertel/, rundgang/ …
├── content/             MDX content (ADR-0002)
└── lib/
    ├── styles/          globals.css, theme.css, variables-<theme>.css, pro-blocks.css, fonts/
    ├── utils/           pure functions, one per file
    ├── hooks/           React hooks
    └── <domain>/        a concern with internals of its own, such as content/ for the content graph
```

## Files

| Rule                 | Detail                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| File names           | kebab-case: `viertel-tile.tsx`, `use-media-query.ts`, `slugify.ts`                                |
| One concern per file | A component file holds one component plus its private helpers. A `utils/` file holds one function |

## src/components

| Folder        | Contents                                                    | Written by                                                      |
| ------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `ui/`         | shadcn primitives, `icons.tsx`                              | `shadcn add`, then adapted: lucide imports swapped for `<Icon>` |
| `pro-blocks/` | Pro Blocks (`shadcn.proBlocksDir` in `agents.yaml`)         | `shadcn add @shadcndesign/<block>`, then adapted the same way   |
| `utils/`      | Client providers and wrappers                               | the project                                                     |
| `<feature>/`  | Project components, named after the glossary term they show | the project                                                     |

Feature folders use the domain language of [the glossary](../glossary.md): `viertel/`, `rundgang/`, `thema/`, `layout/` for header, footer and Menus.

## src/lib: type-based or domain-based

`src/lib/` mixes two kinds of folder on purpose:

- Type-based folders hold thin, stateless, single-file concerns.
- Domain-based folders hold a concern with internal complexity.

A concern gets a domain folder once it needs at least two of these:

- its own adapter or adapters
- its own test files
- several collaborating internal files

| Type-based folder | Contents                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| `styles/`         | CSS, theme variables and font definitions: [Theme system](../css/theme-system.md) |
| `utils/`          | Pure functions                                                                    |
| `hooks/`          | React hooks (`aliases.hooks` in `components.json` points here)                    |

| Domain folder | What it owns                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `content/`    | The content layer of epic #23: loader, frontmatter schemas per content type, the content graph |
| `dictionary/` | The German UI dictionary (issue #26): lookup by key, interpolation                             |

A domain folder has an `index.ts` as its public API. Consumers import from `@/lib/<domain>`.

`src/lib/utils/cn.ts` re-exports `cn` from the `cn` package for registry items that import it through `aliases.utils`.
