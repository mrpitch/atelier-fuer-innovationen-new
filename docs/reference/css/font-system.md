---
type: reference
title: Font system
description: The four font variables (sans, serif, heading, mono), the Kartei families behind them, where next/font loads them and why the variables sit on body.
tags: [css, fonts, next-font, typography, theming]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Font system

Every theme defines four font variables. Kartei fills them from DESIGN.md:

| Variable         | Utility        | Kartei family     | Loaded                               | Used for                                                         |
| ---------------- | -------------- | ----------------- | ------------------------------------ | ---------------------------------------------------------------- |
| `--font-sans`    | `font-sans`    | Schibsted Grotesk | variable, 400–900                    | interface: body copy, controls, navigation (default on `<body>`) |
| `--font-serif`   | `font-serif`   | Literata          | variable, 200–900, normal and italic | the original Xenia texts                                         |
| `--font-heading` | `font-heading` | Instrument Serif  | 400, normal and italic               | headings, large numerals, Pro Blocks `heading-*`                 |
| `--font-mono`    | `font-mono`    | DM Mono           | 400, 500                             | labels, counts, measurements                                     |

## Files

`src/lib/styles/fonts/kartei.ts` defines the four fonts with `next/font/google`:

```ts
export const heading = Instrument_Serif({
	weight: '400',
	style: ['normal', 'italic'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-heading',
})
```

`src/lib/styles/fonts/index.ts` re-exports the active theme's set:

```ts
export { heading, mono, sans, serif } from './kartei'
```

## Root layout

`src/app/layout.tsx` puts the four variable classes on `<body>`:

```tsx
<body className={cn(sans.variable, serif.variable, heading.variable, mono.variable, 'flex min-h-full flex-col')}>
```

They don't go on `<html>`. `theme.css` maps `--font-sans: var(--font-sans)` so that `font-sans` reads the `next/font` value, and Tailwind also writes that self-reference to `:root`. On `<html>` it would compete with the `next/font` class at equal specificity, and only the order of the CSS chunks would decide which wins. On `<body>` the class always wins.

## Rules

- Load fonts with `next/font` only. `variables-*.css` holds no `font-family` literal, and no stylesheet links Google Fonts.
- Load the weights and styles DESIGN.md uses, nothing more. Variable fonts load their whole weight axis without a `weight` option.
- Instrument Serif ships weight 400 only. `font-heading` with `font-medium`, `font-semibold` or `font-bold` makes the browser fake a bold; use size, not weight, for hierarchy.
- The original texts are set in `font-serif`, interface words in `font-sans`, labels and numbers in `font-mono` (DESIGN.md, Typography).

## Related

- [Theme system](./theme-system.md)
- [Design tokens](./design-tokens.md)
