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
- Named `function` declarations. Arrow functions only for callbacks, render props and closures.
- Typed props. Derive from the element or primitive (`React.ComponentProps<'a'>`) instead of restating its props.
- Group related logic: derived values, then handlers, then the JSX.

## State and effects

- Derive values during render instead of synchronising them into state.
- Keep state in the lowest component that needs it. Never mirror props in state.
- An effect is for synchronising with something outside React: the DOM, a browser API, a subscription. Data transformations, derived state and logic that belongs to an event go elsewhere ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)). `eslint-plugin-react-hooks` flags `setState` called synchronously in an effect.
- `useMemo`, `useCallback` and `memo` only for a measured performance problem.

## Event handlers

Name handlers after the event (`handleSubmit`, `handleToggle`) and define them in the component body, not inline in JSX:

```tsx
function handleToggle() {
	setOpen((open) => !open)
}

return <button onClick={handleToggle}>…</button>
```

Keep handlers short; move logic into a helper in `src/lib/utils/` when it grows.

## Props and composition

- Composition over configuration: `children` and slots before a growing list of boolean props.
- Semantic, predictable prop names. Stable, meaningful `key`s in lists (an ID, never an index for reorderable lists).

## Server and Client Components

The site is a static export, so Server Components run once, at build time: [Static export](./static-export.md).

| Component kind          | Use for                                                           | Rule                                                     |
| ----------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| Server (default)        | Pages, layouts, everything that reads content                     | May import build-time modules such as the content loader |
| Client (`'use client'`) | Interaction: theme switching, menus, reading state in the browser | Receives data as props                                   |

Put `'use client'` on the smallest component that needs interaction, so the rest of the tree stays static HTML.
