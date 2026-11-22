---
type: reference
title: Tailwind conventions
description: How to write Tailwind CSS v4 classes here, covering class order, complete class names, variants and where custom CSS may go.
tags: [css, tailwind, conventions, styling]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Tailwind conventions

Tailwind CSS v4. The theme is configured in CSS (`src/lib/styles/theme.css`); there is no `tailwind.config` file.

## Classes

| Rule        | Detail                                                                                                                                                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order       | `prettier-plugin-tailwindcss` sorts classes in `className`, `cn()` and `cva()` on `pnpm format` and in the pre-commit hook. Don't order them by hand                                                                                                                                                                    |
| Class names | Write complete class names, wherever you write them. Tailwind finds classes by scanning source text, so a class built from a variable never reaches the CSS: `bg-viertel-${slug}`, `'bg-viertel-' + slug`. Map values to full names instead. Lint catches only template literals inside `className`, `cn()` and `cva()` |

```tsx
// A lookup with complete class names, not a template string.
const viertelTint = {
	kontexte: 'bg-viertel-kontexte',
	maerkte: 'bg-viertel-maerkte',
} as const
```

## Variants

- State: prefer `aria-*` and `data-*` variants over JavaScript-toggled classes. Base UI marks state with attributes, and `shadcn/tailwind.css` adds matching variants: `data-open:`, `data-closed:`, `data-checked:`, `data-disabled:`, `data-active:` and more. Enter and exit transitions use `data-starting-style:` and `data-ending-style:`.
- Parent and sibling state: `group-*` and `peer-*`.
- Motion: `motion-safe:` for anything that animates.
- Responsive: use container queries (`@container`, `@md:`) when a component's layout depends on its parent, not the viewport.

## Custom CSS

- Component styling is classes in the component. A class list repeated across files becomes a component, not an `@apply` rule.
- `@apply` appears only in the base layer of `globals.css`.
- A new utility is an `@utility` block in `src/lib/styles/`, used only when the same declaration is needed in many places and no token covers it.

## Related

- [Theme system](./theme-system.md)
- [Component blueprint](../components/component-blueprint.md)
