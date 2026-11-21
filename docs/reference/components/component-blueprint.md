---
type: reference
title: Component blueprint
description: The structure every UI component follows, matching the radix-nova shadcn source - function components with ref as a prop, data-slot, CVA variants, cn() and asChild through Radix Slot.
tags: [components, react, shadcn, radix, cva]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Component blueprint

Components follow the source the shadcn CLI installs for the `radix-nova` style (React 19, Tailwind v4). A project component and an installed primitive look the same.

| Rule        | Detail                                                                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declaration | A named `function`. React 19 passes `ref` as a prop, so there is no `forwardRef` and no `displayName`                                                                             |
| Props       | `React.ComponentProps<'element'>`, or `React.ComponentProps<typeof Primitive.Part>` around a Radix part. Both include `ref`; spreading `props` passes it on                       |
| `data-slot` | The root element carries `data-slot="<kebab-name>"` (`data-slot="viertel-tile"`). Parents style parts with `has-data-[slot=…]:` or `*:data-[slot=…]:` instead of an extra prop    |
| Variants    | `cva()` from `class-variance-authority`. A component with variants also sets `data-variant` and `data-size`, and exports its `…Variants` function                                 |
| Classes     | `className` always goes through `cn()` from `'cn'`, last, so callers can override                                                                                                 |
| Composition | Interactive components with variants accept `asChild` and render `Slot.Root` from `'radix-ui'`                                                                                    |
| Radix       | Import primitives from the `radix-ui` package (`import { Dialog as DialogPrimitive } from 'radix-ui'`), not from `@radix-ui/react-*`                                              |
| Icons       | `<Icon iconName="…" />`, never a lucide import: [Icon registry](./icon-registry.md). Inside a button, mark it `data-icon="inline-start"` or `"inline-end"` so the padding adjusts |
| Exports     | Named exports at the bottom: `export { Button, buttonVariants }`                                                                                                                  |

## With variants

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'
import * as React from 'react'

const buttonVariants = cva('inline-flex items-center justify-center rounded-lg …', {
	variants: {
		variant: { default: 'bg-primary text-primary-foreground', outline: '…' },
		size: { default: 'h-8 px-2.5', xs: 'h-6 px-2' },
	},
	defaultVariants: { variant: 'default', size: 'default' },
})

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot.Root : 'button'

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
```

## Without variants

```tsx
function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card"
			className={cn('rounded-xl border bg-card text-card-foreground', className)}
			{...props}
		/>
	)
}
```

## Wrapping a Radix part

```tsx
function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn('border-b last:border-b-0', className)}
			{...props}
		/>
	)
}
```

## Related

- [React component conventions](../react/react-component-conventions.md)
- [shadcn setup](./shadcn-setup.md)
- [Tailwind conventions](../css/tailwind-conventions.md)
