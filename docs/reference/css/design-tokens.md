---
type: reference
title: Design tokens
description: The Kartei colour, radius, shadow and spacing tokens, the DESIGN.md colour each one implements, and the rules for using them in components.
tags: [css, design-tokens, oklch, colors, radius, shadows, kartei]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Design tokens

Token values live in `src/lib/styles/variables-kartei.css`; `src/lib/styles/theme.css` turns them into utilities. DESIGN.md names the colours.

## Colours

Colour tokens are OKLCH. Light values sit in `:root`, dark values in `.dark`.

| Token                  | Utility example              | DESIGN.md colour (light)            |
| ---------------------- | ---------------------------- | ----------------------------------- |
| `background`           | `bg-background`              | Archivstein                         |
| `foreground`           | `text-foreground`            | Graphit                             |
| `card`, `popover`      | `bg-card`                    | Karteikarte                         |
| `primary`              | `bg-primary`, `text-primary` | Petrol                              |
| `secondary`            | `bg-secondary`               | Petrolschleier                      |
| `secondary-foreground` | `text-secondary-foreground`  | Tiefpetrol                          |
| `muted`                | `bg-muted`                   | Pappe                               |
| `muted-foreground`     | `text-muted-foreground`      | Bleigrau                            |
| `accent`               | `bg-accent`                  | Korallenhauch                       |
| `accent-foreground`    | `text-accent-foreground`     | Koralle dunkel                      |
| `destructive`          | `text-destructive`           | Siegellack                          |
| `border`               | `border-border`              | Haarlinie                           |
| `input`                | `border-input`               | Feldlinie                           |
| `ring`                 | `ring-ring`                  | Petrol                              |
| `signal`               | `bg-signal`                  | Koralle                             |
| `viertel-<slug>`       | `bg-viertel-kontexte`        | Viertel-Reiter tint of that Viertel |

The eight `viertel-*` slugs: `annaeherung`, `maerkte`, `kontexte`, `inszenierung`, `zukunft`, `wertschoepfung`, `potenziale`, `fuehrung`.

Rules:

- `signal` marks "Sie sind hier" and the current place only. It never fills a button.
- Petrol (`primary`) marks what moves the visitor forward. It is never a section background (DESIGN.md, the Petrol Rule).
- A new token goes into `variables-kartei.css` for light and dark, gets a `--color-*` line in `theme.css`, and is named in DESIGN.md.

## Radius

`--radius` is `0.25rem`. `theme.css` derives the scale from it so that it matches DESIGN.md's `rounded` values:

| Utility                       | Value                                  | DESIGN.md use                                |
| ----------------------------- | -------------------------------------- | -------------------------------------------- |
| `rounded-sm`, `rounded-md`    | `calc(var(--radius) * 0.5)`, 2px       | small buttons, tab triggers, menu items      |
| `rounded-lg`                  | `var(--radius)`, 4px                   | buttons, inputs, selects, nav and list items |
| `rounded-xl`                  | `calc(var(--radius) * 2)`, 8px         | cards                                        |
| `rounded-2xl` … `rounded-4xl` | Tailwind defaults (1rem, 1.5rem, 2rem) | shadcn uses `rounded-4xl` for pill badges    |
| `rounded-none`                | 0                                      | Stadtplan tiles                              |

## Shadows

The theme maps no shadow tokens, so `shadow-*` utilities carry Tailwind's defaults. DESIGN.md decides where they may appear:

- Anything that is part of the page is flat: cards, tiles, buttons, inputs.
- Only layers that float above the page cast a shadow: menus, popovers, select lists, the active tab trigger.
- A border and a shadow never sit on the same element.

The base-nova primitives already follow this: buttons, inputs and cards are flat, while popover, select and dropdown menu carry `shadow-md` and the active tab `shadow-sm`. The one exception is the sheet's `shadow-lg`; the Kartei kit gives sheets and drawers no shadow, so remove it when a sheet is built.

## Spacing

Tailwind's 4px spacing scale (`--spacing: 0.25rem`) covers every DESIGN.md spacing step (4, 8, 12, 16, 24, 32, 40, 56, 64, 72, 80 and 96px).

## Related

- [Theme system](./theme-system.md)
- [Font system](./font-system.md)
