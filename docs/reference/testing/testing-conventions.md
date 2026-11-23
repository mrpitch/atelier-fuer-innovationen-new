---
type: reference
title: Testing conventions
description: Vitest setup, where test files and fixture content directories live, and how content:check tests itself.
tags: [testing, vitest, fixtures, content]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Testing conventions

Vitest is the test runner (`pnpm test` → `vitest run`). `vitest.config.mts` at the repo root aliases `@` to `src`, matching the `@/*` path in `tsconfig.json`, so a test imports the same way application code does.

## Test file location

A test file sits next to the code it tests, named `<file>.test.ts` (`.test.tsx` for a component): `src/lib/content/graph.test.ts` tests `src/lib/content/graph.ts`, and `src/components/viertel/viertel-teaser-card.test.tsx` tests `viertel-teaser-card.tsx`. Each component gets its own test file, even when another component renders it. There is no separate `test/` or `__tests__/` tree.

## Fixture content directories

A test that exercises the content graph calls `buildContentGraph` on a real, small content directory on disk rather than mocking the file system — the graph's own contract is "able to load any content directory" ([Content layer](../content/content-layer.md)), so a fixture directory exercises exactly that contract.

Fixtures live in a `__fixtures__/` folder next to the test, one subfolder per scenario:

```text
src/lib/content/
├── graph.test.ts
└── __fixtures__/
    ├── valid/              # a small, valid content tree
    │   ├── index.mdx
    │   └── kontakt/index.mdx
    └── invalid/             # one broken document, for the error-path test
        └── kontakt/index.mdx
```

Keep a fixture tree minimal: enough documents to prove the rule under test, not a copy of the real content directory.

## Testing `content:check`

`content:check` is a script, not a module, so its test (`scripts/content-check.test.ts`) spawns it with `node:child_process` and asserts on the exit code: non-zero against the `invalid` fixture, zero against the `valid` fixture and zero against the real `src/content` directory. `execFileSync` throwing is treated as the non-zero case; not throwing is the zero case.
