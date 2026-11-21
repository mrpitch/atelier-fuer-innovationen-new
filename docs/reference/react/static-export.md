---
type: reference
title: Static export
description: What the static export (output 'export') allows, which Next.js features it rules out, and which check catches a violation.
tags: [nextjs, static-export, routing, build, server-components, eslint]
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

## Rejected by lint

Each of these fails `pnpm lint` and the pre-commit hook, on its own `restrictions/*` rule in `eslint.config.mjs`. The other two restriction rules, `restrictions/icon-registry-imports` and `restrictions/base-ui-imports`, are documented the same way in `docs/reference/components/icon-registry.md` and `docs/reference/components/component-blueprint.md`:

| Feature                                                  | Rule                                       | Use instead                                                                            |
| -------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `cookies()`, `headers()`, `draftMode()` (`next/headers`) | `restrictions/next-headers-imports`        | Browser APIs in a Client Component. A preview needs a new build                        |
| `'use server'`                                           | `restrictions/server-actions-syntax`       | None. The site has no writes, so there are no Server Actions                           |
| `export const revalidate`                                | `restrictions/revalidate-syntax`           | None. There is no incremental regeneration; a content change needs a new build         |
| `export const dynamicParams = true`                      | `restrictions/dynamic-params-syntax`       | Every dynamic segment exports `generateStaticParams()` from the content graph          |
| `'use client'` on a route's own `page` or `layout` file  | `restrictions/use-client-route-syntax`     | Put it on the smallest component that needs interaction, so the page stays static HTML |
| `rewrites`, `redirects`, `headers` in `next.config.ts`   | `restrictions/static-export-config-syntax` | URLs come from the content graph (ADR-0003); hosting handles redirects                 |

## Not available

From the Next.js static export guide (`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`), the limits lint can't see:

| Feature                                         | Use instead                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Dynamic routes without `generateStaticParams()` | Every dynamic segment exports `generateStaticParams()` from the content graph |
| Route Handlers that read the `Request`          | A route handler may only produce a static file, such as `sitemap.xml`         |
| Proxy                                           | Hosting handles redirects                                                     |
| Image Optimization with the default loader      | `next/image` with `unoptimized: true` (already set)                           |
| Intercepting Routes                             | Plain routes                                                                  |

## Locale

German pages have no URL prefix; a later locale gets one (ADR-0001). Nothing can redirect by browser language, because no server sees the request.

## Checks

| Check        | Catches                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`  | Everything in [Rejected by lint](#rejected-by-lint), and the pre-commit hook runs it on staged files                                                                             |
| `pnpm dev`   | An unsupported feature from [Not available](#not-available), as an error when the page renders                                                                                   |
| `pnpm build` | All of [Not available](#not-available). CI runs it on every pull request, and `sandbox.checkCommand` in `agents.yaml` runs it after `pnpm check`                                 |
| `pnpm check` | Everything in [Rejected by lint](#rejected-by-lint), via `pnpm lint`. Nothing in [Not available](#not-available): `pnpm check` runs format, lint and typecheck, not `next build` |
