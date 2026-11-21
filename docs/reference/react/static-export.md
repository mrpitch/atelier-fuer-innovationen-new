---
type: reference
title: Static export
description: What the static export (output 'export') allows, which Next.js features it rules out, and which check catches a violation.
tags: [nextjs, static-export, routing, build, server-components]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Static export

`next.config.ts` sets `output: 'export'` and `images: { unoptimized: true }`. `pnpm build` writes the whole site as files to `out/`. There is no server at runtime.

## What runs when

| Code                                                          | Runs                                        |
| ------------------------------------------------------------- | ------------------------------------------- |
| Server Components, `generateStaticParams`, `generateMetadata` | once, during `next build`                   |
| Client Components                                             | in the browser, after the static HTML loads |

A Server Component may read files, because the build has a file system. The result is baked into HTML, so a change to content needs a new build.

## Not available

From the Next.js static export guide (`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`):

| Feature                                                                        | Use instead                                                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Dynamic routes without `generateStaticParams()`, or with `dynamicParams: true` | Every dynamic segment exports `generateStaticParams()` from the content graph |
| Server Actions                                                                 | None. The site has no writes                                                  |
| Route Handlers that read the `Request`                                         | A route handler may only produce a static file, such as `sitemap.xml`         |
| `cookies()`, `headers()`                                                       | Browser APIs in a Client Component                                            |
| `rewrites`, `redirects`, `headers` in `next.config.ts`; Proxy                  | URLs come from the content graph (ADR-0003); hosting handles redirects        |
| Incremental Static Regeneration, Draft Mode                                    | A new build                                                                   |
| Image Optimization with the default loader                                     | `next/image` with `unoptimized: true` (already set)                           |
| Intercepting Routes                                                            | Plain routes                                                                  |

## Locale

German pages have no URL prefix; a later locale gets one (ADR-0001). Nothing can redirect by browser language, because no server sees the request.

## Checks

| Check        | Catches                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`   | An unsupported feature, as an error when the page renders                                                             |
| `pnpm build` | All of them. CI runs it on every pull request, and `sandbox.checkCommand` in `agents.yaml` runs it after `pnpm check` |
| `pnpm check` | None of them: it runs format, lint and typecheck only                                                                 |
