---
type: reference
title: Theme system
description: How the Kartei theme reaches Tailwind and shadcn components, the files in src/lib/styles, dark mode through next-themes, and what changes when another theme becomes active.
tags: [css, theming, tailwind, next-themes, dark-mode, design-tokens]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Theme system

One theme is active per build. Kartei is the active theme; its source is DESIGN.md.

## Files

| File                                                           | Contents                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/lib/styles/variables-kartei.css`                          | Theme tokens for `:root` (light) and `.dark`: colours, `--radius`, `--signal`, `--viertel-*`         |
| `src/lib/styles/theme.css`                                     | `@theme inline` block mapping every token to a Tailwind utility, plus the radius scale               |
| `src/lib/styles/globals.css`                                   | Imports in order, the `dark` variant and the base layer. `components.json` points here               |
| `src/lib/styles/pro-blocks.css`                                | Pro Blocks utilities: `heading-*`, `container-padding-x`, `section-padding-y`, `section-title-gap-*` |
| `src/lib/styles/fonts/kartei.ts`                               | `next/font` definitions for the four font variables: [Font system](./font-system.md)                 |
| `src/lib/styles/fonts/index.ts`                                | Re-exports the active theme's fonts                                                                  |
| `design/xeniapolis.tweakcn.css`, `design/faltplan.tweakcn.css` | Alternative styles of the Figma file as tweakcn exports. Not imported anywhere                       |

## CSS pipeline

```css
/* globals.css */
@import 'tailwindcss';
@import 'tw-animate-css'; /* animation utilities shadcn components use */
@import 'shadcn/tailwind.css'; /* accordion keyframes, data-open/data-closed/… variants */

@import './variables-kartei.css';
@import './theme.css';
@import './pro-blocks.css';

@custom-variant dark (&:is(.dark *));
```

- Tailwind v4 compiles through `@tailwindcss/turbopack`, set as the `*.css` loader in `next.config.ts`. There is no PostCSS config and no `tailwind.config` file.
- The base layer sets `bg-background text-foreground font-sans` on `<body>` and `border-border outline-ring/50` on every element.

## Dark mode

| Piece                         | Value                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Provider                      | `ThemeProvider` from `src/components/utils/theme-provider.tsx`, wrapping `next-themes`                       |
| Props in `src/app/layout.tsx` | `attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`                             |
| Effect                        | `next-themes` puts `dark` on `<html>` before hydration; `<html>` carries `suppressHydrationWarning` for that |
| Variant                       | `dark:` matches descendants of `.dark`                                                                       |
| Tokens                        | `.dark` in `variables-kartei.css` redefines every colour token                                               |

## Tokens every theme defines

| Group   | Tokens                                                                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn  | `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` (each with `-foreground`), `border`, `input`, `ring`, `chart-1` … `chart-5`, `sidebar` and its seven variants |
| Shape   | `--radius`                                                                                                                                                                                                            |
| Project | `--signal`, `--viertel-annaeherung`, `--viertel-maerkte`, `--viertel-kontexte`, `--viertel-inszenierung`, `--viertel-zukunft`, `--viertel-wertschoepfung`, `--viertel-potenziale`, `--viertel-fuehrung`               |

Values and naming rules: [Design tokens](./design-tokens.md).

## Switching the active theme

| What      | Change                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens    | Copy `design/<name>.tweakcn.css` to `src/lib/styles/variables-<name>.css` without its `--font-*` lines and import it in `globals.css` instead of `variables-kartei.css`. The exports already carry `--signal` and `--viertel-*` |
| Fonts     | Add `src/lib/styles/fonts/<name>.ts` with the families from the export's `--font-*` lines and re-export it from `fonts/index.ts`                                                                                                |
| DESIGN.md | Describes Kartei. A theme switch is a design decision and updates DESIGN.md with it                                                                                                                                             |

## Related

- [Design tokens](./design-tokens.md)
- [Font system](./font-system.md)
- [Tailwind conventions](./tailwind-conventions.md)
