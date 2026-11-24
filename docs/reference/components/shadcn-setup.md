---
type: reference
title: shadcn setup
description: The components.json settings (base-nova style on Base UI, aliases, the @shadcndesign Pro Blocks registry), the packages behind them, and where the Pro Blocks license key lives.
tags: [shadcn, components, pro-blocks, base-ui, configuration, license]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# shadcn setup

## components.json

| Key             | Value                        | Why                                                                                                                                                             |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `style`         | `base-nova`                  | Base UI primitives at the Kartei control sizes: 32px buttons and inputs, 24px `xs` buttons ([Kartei design system](../design/kartei-design-system.md), Buttons) |
| `tailwind.css`  | `src/lib/styles/globals.css` | The CLI writes CSS here; move what it adds into the right file in `src/lib/styles/`                                                                             |
| `iconLibrary`   | `lucide`                     | Installed files import lucide; the imports get swapped for `<Icon>`: [Icon registry](./icon-registry.md)                                                        |
| `rtl`           | `false`                      | German only                                                                                                                                                     |
| `aliases.ui`    | `@/components/ui`            | Primitives land in `src/components/ui/`                                                                                                                         |
| `aliases.hooks` | `@/lib/hooks`                | Hooks from the registry land with the project's hooks                                                                                                           |
| `aliases.utils` | `@/lib/utils/cn`             | Pro Blocks import `cn` through this alias; `src/lib/utils/cn.ts` re-exports the `cn` package                                                                    |
| `registries`    | `@shadcndesign`              | Pro Blocks, see below                                                                                                                                           |

`baseColor` only shapes the CSS that `shadcn init` writes, and the Kartei tokens replace that CSS: [Theme system](../css/theme-system.md). `menuColor` and `menuAccent` keep the CLI defaults.

## Packages

| Package                    | Role                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `shadcn`                   | The CLI, and `shadcn/tailwind.css`: accordion keyframes and the `data-*` variants base-nova uses                                          |
| `@base-ui/react`           | The primitives, one subpath each (`import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'`), plus `useRender` and `mergeProps` |
| `cn`                       | Class merging, the shadcn replacement for `clsx` plus `tailwind-merge`                                                                    |
| `class-variance-authority` | `cva()` variants                                                                                                                          |
| `lucide-react`             | Icons, imported only by `src/components/ui/icons.tsx`                                                                                     |
| `tw-animate-css`           | Enter and exit animations                                                                                                                 |
| `next-themes`              | Dark mode through the `dark` class                                                                                                        |

## Pro Blocks registry

```json
"@shadcndesign": {
	"url": "https://www.shadcndesign.com/api/registry/styles/{style}/{name}",
	"headers": { "X-License-Key": "${SHADCNDESIGN_LICENSE_KEY}" }
}
```

`{style}` and `{name}` are filled in by the CLI. The registry serves each block in its `base-nova` variant. Blocks land in `src/components/pro-blocks/<category>/` (`shadcn.proBlocksDir` in `agents.yaml`); their shared utilities are `src/lib/styles/pro-blocks.css`.

## License key

| Where                                   | Needed for                               | How it gets there                                                                    |
| --------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `.env` in the main checkout             | `shadcn add @shadcndesign/…` on the host | Added by hand: `SHADCNDESIGN_LICENSE_KEY=SD-…` from the shadcndesign Customer Portal |
| `.env` in an Orca worktree              | the same, inside the worktree            | Orca copies it from the main checkout (`.worktreeinclude`)                           |
| `.sandcastle/.env` in the main checkout | an afk run that installs a block         | Added by hand; `.sandcastle/.env.example` names the variable                         |
| CI, `pnpm build`                        | nothing                                  | Blocks are copied into the repository at install time, so builds never fetch them    |

All three files are gitignored. The key never goes into a commit, an issue or a chat.

## Related

- [How to add a shadcn component or Pro Block](../../how-to/how-to-add-a-shadcn-component.md)
- [Component blueprint](./component-blueprint.md)
