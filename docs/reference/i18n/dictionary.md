---
type: reference
title: Dictionary
description: The German UI dictionary — looking up a UI string by key, and interpolating a placeholder into it.
tags: [i18n, dictionary, ui-copy]
status: stable
last_reviewed: 2026-11-22
authoritative: true
---

# Dictionary

The site is German-only today ([ADR-0001](../../adr/adr-0001-unprefixed-default-locale-urls.md)), but UI copy still goes through one dictionary instead of sitting inline in components, so every string is in one place and ready for a later locale. `src/lib/dictionary/` is the domain folder ([Folder structure](../global/folder-structure.md)), with `index.ts` as its public API.

## Keys

`src/lib/dictionary/de.ts` exports `de`, a flat object of dot-namespaced keys to German strings:

```ts
export const de = {
	'navigation.youAreHere': 'Sie sind hier',
	'navigation.previous': 'Vorherige Seite',
	'navigation.next': 'Nächste Seite',
}
```

This is the dictionary every later UI string goes into — a new piece of UI copy gets a new key here, named after the UI area it belongs to (`navigation.*`), not written inline in the component that shows it.

## Looking up a string

`t(key, params?)` (`src/lib/dictionary/index.ts`) looks up `key` in `de` and returns the string. A component imports it from `@/lib/dictionary`:

```tsx
import { t } from '@/lib/dictionary'

t('navigation.previous') // 'Vorherige Seite'
```

## Interpolation

A dictionary value can carry `{name}` placeholders; `t`'s second argument fills them in. No current key needs one, but a later key like a reading progress count would:

```ts
// if de.ts held 'reading.progress': 'Station {current} von {total}'
t('reading.progress', { current: 3, total: 8 }) // 'Station 3 von 8'
```

`src/lib/dictionary/interpolate.ts` does the substitution: a placeholder with no matching param is left in the string as written, rather than throwing or silently dropping it.
