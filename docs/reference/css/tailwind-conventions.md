---
type: reference
title: Tailwind conventions
description: How to write Tailwind CSS v4 classes here, covering tokens, class order, variants, cn() merging and where custom CSS may go.
tags: [css, tailwind, conventions, styling]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Tailwind conventions

Tailwind CSS v4. The theme is configured in CSS (`src/lib/styles/theme.css`); there is no `tailwind.config` file.

## Classes

| Rule                   | Detail                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens, not raw values | Colours, radii and fonts come from the theme: `bg-card`, `text-muted-foreground`, `rounded-lg`, `font-heading`. No palette colours (`text-zinc-600`) or arbitrary colours (`bg-[#00676b]`): [Design tokens](./design-tokens.md) |
| Spacing scale          | Use the 4px scale (`gap-6`, `px-2.5`). Arbitrary values (`p-[13px]`) only for a measured one-off, such as the 416 × 340px Stadtplan tile                                                                                        |
| Order                  | `prettier-plugin-tailwindcss` sorts classes in `className`, `cn()` and `cva()` on `pnpm format` and in the pre-commit hook. Don't order them by hand                                                                            |

## Variants

- `dark:` is class-based (`next-themes`), but tokens already switch with the theme. Reach for `dark:` only where a token can't express the difference.
- State: prefer `aria-*` and `data-*` variants over JavaScript-toggled classes. Base UI marks state with attributes, and `shadcn/tailwind.css` adds matching variants: `data-open:`, `data-closed:`, `data-checked:`, `data-disabled:`, `data-active:` and more. Enter and exit transitions use `data-starting-style:` and `data-ending-style:`.
- Parent and sibling state: `group-*` and `peer-*`, named when nested (`group/button`).
- Motion: `motion-safe:` for anything that animates.
- Responsive: mobile first. Unprefixed classes are the mobile layout; `md:` and `lg:` add to it. Use container queries (`@container`, `@md:`) when a component's layout depends on its parent, not the viewport.

## Custom CSS

- Component styling is classes in the component. A class list repeated across files becomes a component, not an `@apply` rule.
- `@apply` appears only in the base layer of `globals.css`.
- A new utility is an `@utility` block in `src/lib/styles/`, used only when the same declaration is needed in many places and no token covers it.

## Related

- [Theme system](./theme-system.md)
- [Component blueprint](../components/component-blueprint.md)
