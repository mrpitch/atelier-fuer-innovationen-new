---
type: reference
title: Icon registry
description: Icons render through the typed <Icon iconName="..." /> wrapper in src/components/ui/icons.tsx; lucide-react is imported nowhere else, and ESLint enforces it.
tags: [icons, components, lucide-react, eslint]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Icon registry

`src/components/ui/icons.tsx` is the only file that imports `lucide-react`. Everything else renders icons through `Icon`:

```tsx
import { Icon } from '@/components/ui/icons'

;<Icon iconName="arrowRight" className="size-4" />
```

`iconName` is typed as `IconType`, the keys of the registry, so an unknown name is a type error. All other props are lucide's `LucideProps` (`className`, `size`, `strokeWidth`, `aria-*` …).

## Registering an icon

Two lines in `icons.tsx`: the lucide import and an entry in `icons`.

```tsx
import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	Check,
	type LucideIcon,
	type LucideProps,
} from 'lucide-react'

const icons = {
	arrowDown: ArrowDown,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
	check: Check,
} satisfies Record<string, LucideIcon>
```

| Lucide name    | Registry key  | Rule                                          |
| -------------- | ------------- | --------------------------------------------- |
| `ArrowRight`   | `arrowRight`  | camelCase of the lucide name                  |
| `Trash2`       | `trash`       | Drop a number suffix                          |
| `CheckCircle2` | `checkCircle` | Drop a number suffix                          |
| `SunMedium`    | `sun`         | A plain alias when the lucide name is awkward |

## Enforcement

`restrictions/icon-registry-imports` in `eslint.config.mjs` rejects `lucide-react` everywhere except `src/components/ui/icons.tsx`. `pnpm lint` and the pre-commit hook fail on a direct import.

The shadcn CLI and the Pro Blocks registry always write `import { XIcon } from 'lucide-react'` into the files they install; that is the CLI's template, not a setting. Swapping those imports for `<Icon>` is part of every install: [How to add a shadcn component or Pro Block](../../how-to/how-to-add-a-shadcn-component.md).

## Icons inside controls

base-nova buttons adjust their padding for an icon marked with `data-icon`:

```tsx
<Button variant="ghost">
	Wege durch dieses Viertel
	<Icon iconName="arrowDown" data-icon="inline-end" />
</Button>
```

An icon without visible text next to it needs an accessible name on its control (`aria-label` on the button). A decorative icon next to text needs nothing; lucide sets `aria-hidden="true"`.

## Related

- [Component blueprint](./component-blueprint.md)
- [shadcn setup](./shadcn-setup.md)
