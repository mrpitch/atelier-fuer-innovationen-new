---
type: reference
title: React component conventions
description: How components are written here - structure, state, effects, event handlers, props and the Server/Client split in a static export.
tags: [react, components, typescript, state, hooks, server-components]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# React component conventions

React 19 with Next.js App Router. UI components additionally follow the [Component blueprint](../components/component-blueprint.md).

## Structure

- Small components with one responsibility. Flat JSX; extract a part when nesting gets deep.
- Group related logic: derived values, then handlers, then the JSX.

## State and effects

- Derive values during render instead of synchronising them into state.
- Keep state in the lowest component that needs it. Never mirror props in state.
- An effect is for synchronising with something outside React: the DOM, a browser API, a subscription. Data transformations, derived state and logic that belongs to an event go elsewhere ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)). `eslint-plugin-react-hooks` flags `setState` called synchronously in an effect.

## Event handlers

Keep handlers short; move logic into a helper in `src/lib/utils/` when it grows. Lint wants a handler named `handle…`, so rename a prop you forward when you destructure it (`{ onSelect: handleSelect }`), or pass it as `props.onSelect`.

## Props and composition

- Derive props from the element or primitive instead of restating them: `React.ComponentProps<'a'>`, the part's own type around a Base UI part (`AccordionPrimitive.Item.Props`), `useRender.ComponentProps<'a'>` for a component that can render as another element.
- Composition over configuration: `children` and slots before a growing list of boolean props.
- Semantic, predictable prop names.

## Server and Client Components

The site is a static export, so Server Components run once, at build time: [Static export](./static-export.md).

| Component kind          | Use for                                                           | Rule                                                                                     |
| ----------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Server (default)        | Pages, layouts, everything that reads content                     | May import build-time modules such as the content loader                                 |
| Client (`'use client'`) | Interaction: theme switching, menus, reading state in the browser | Receives data as props. Never imports a module that reads files or other build-time APIs |

Importing a domain folder under `src/lib/` goes through its public API, `@/lib/<domain>`, never a file inside it. Lint enforces this ([Folder structure](../global/folder-structure.md#srclib-type-based-or-domain-based)). Lint also rejects `fs` and `@/content` imports anywhere in `src/` outside `src/lib/content/`.

Put `'use client'` on the smallest component that needs interaction, so the rest of the tree stays static HTML.
