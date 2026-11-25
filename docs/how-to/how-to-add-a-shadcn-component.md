---
type: how-to
title: How to add a shadcn component or Pro Block
description: Install a shadcn primitive or a shadcndesign Pro Block, swap its lucide imports for the icon registry and get it through the checks.
tags: [shadcn, pro-blocks, components, icons, install]
status: stable
last_reviewed: 2026-11-22
---

# How to add a shadcn component or Pro Block

Prerequisite for Pro Blocks: `SHADCNDESIGN_LICENSE_KEY` in `.env` ([shadcn setup](../reference/components/shadcn-setup.md#license-key)).

## Steps

1. Install the item. A primitive comes from the shadcn registry, a block from `@shadcndesign`:

   ```bash
   pnpm exec shadcn add dialog
   pnpm exec shadcn add @shadcndesign/<block-name>
   ```

   Find block names with `pnpm exec shadcn search @shadcndesign -q "<topic>"`. Add `--dry-run` to see the files first.

2. Swap the icon imports. Every installed file that imports from `lucide-react` gets `<Icon>` instead, and each missing icon gets its two lines in `src/components/ui/icons.tsx` ([Icon registry](../reference/components/icon-registry.md)):

   ```diff
   -import { XIcon } from 'lucide-react'
   +import { Icon } from '@/components/ui/icons'
   …
   -<XIcon />
   +<Icon iconName="x" />
   ```

3. If the CLI changed `src/lib/styles/globals.css`, move what it added into the matching file: tokens into `variables-kartei.css`, mappings into `theme.css`, block utilities into `pro-blocks.css`.

4. Format and fix imports:

   ```bash
   pnpm format
   pnpm exec eslint --fix src/components
   ```

5. Fix what `pnpm lint` still reports in the installed files. Registry code ships palette colours (`bg-black/10`, `bg-white`) and arbitrary values (`max-w-[calc(100%-2rem)]`, `rounded-[min(var(--radius-md),10px)]`, `w-[32px]`). Each error names the token or scale class to use instead. A measured one-off gets a disable comment that states the measurement.

6. Check the Kartei rules lint can't see: flat page surfaces, no `font-semibold` on `font-heading` ([Kartei design system](../reference/design/kartei-design-system.md), [Font system](../reference/design/font-system.md)).

## Verify

```bash
pnpm check && pnpm build
```

Both pass, and `git status` shows no stray changes in `globals.css`.

## Troubleshooting

| Symptom                                                                       | Fix                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `401` or `403` from `@shadcndesign`                                           | The key is missing, empty or expired. Check `.env` in the directory you run the CLI in                                                                                                                              |
| `404` from `@shadcndesign`                                                    | The registry URL in `components.json` was changed; it must keep the literal `{style}/{name}`                                                                                                                        |
| `'lucide-react' import is restricted` in `pnpm lint`                          | Step 2 isn't done for that file                                                                                                                                                                                     |
| `palette-color-classes` or an `arbitrary-…-classes` rule fails in `pnpm lint` | The registry code uses a raw colour or value. Step 5: swap in the token or scale class the message names                                                                                                            |
| `'radix-ui'` or `'@radix-ui/…'` import is restricted                          | The code came from a Radix source. Install the item from the registry, which serves its `base-nova` variant, or port it to `@base-ui/react` ([Component blueprint](../reference/components/component-blueprint.md)) |
| A block renders without its spacing or heading styles                         | `pro-blocks.css` isn't imported in `globals.css`                                                                                                                                                                    |
