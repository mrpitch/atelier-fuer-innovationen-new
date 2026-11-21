---
type: reference
title: Component blueprint
description: The structure every UI component follows, matching the base-nova shadcn source - function components on Base UI primitives, data-slot, CVA variants, cn() and the render prop for composition.
tags: [components, react, shadcn, base-ui, cva]
status: stable
last_reviewed: 2026-11-21
authoritative: true
---

# Component blueprint

Components follow the source the shadcn CLI installs for the `base-nova` style: Base UI primitives, React 19, Tailwind v4. A project component and an installed primitive look the same.

| Rule        | Detail                                                                                                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declaration | A named `function`. React 19 passes `ref` as a prop, so there is no `forwardRef` and no `displayName`                                                                                                                                                       |
| Props       | `React.ComponentProps<'element'>` for a plain element, the part's own type around a Base UI part (`AccordionPrimitive.Item.Props`, `DialogPrimitive.Popup.Props`), `useRender.ComponentProps<'element'>` for a component that can render as another element |
| `data-slot` | The root element carries `data-slot="<kebab-name>"` (`data-slot="viertel-tile"`). Parents style parts with `has-data-[slot=…]:` or `*:data-[slot=…]:` instead of an extra prop                                                                              |
| Variants    | `cva()` from `class-variance-authority`; the component exports its `…Variants` function                                                                                                                                                                     |
| Classes     | `className` always goes through `cn()` from `'cn'`, last, so callers can override                                                                                                                                                                           |
| Composition | Base UI's `render` prop: `<DialogTrigger render={<Button variant="outline" />}>`. There is no `asChild`. A project component that needs `render` builds on `useRender`                                                                                      |
| Base UI     | One import per primitive from its subpath: `import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'`. ESLint rejects `radix-ui` and `@radix-ui/*`                                                                                                 |
| Links       | A link that looks like a button is `<Link className={buttonVariants({ variant: 'outline' })}>`. `<Button render={<a />}>` would give the anchor `role="button"`                                                                                             |
| Icons       | `<Icon iconName="…" />`, never a lucide import: [Icon registry](./icon-registry.md). Inside a button, mark it `data-icon="inline-start"` or `"inline-end"` so the padding adjusts                                                                           |
| Exports     | Named exports at the bottom: `export { Button, buttonVariants }`                                                                                                                                                                                            |

## Around a Base UI primitive, with variants

```tsx
import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

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
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
```

## Rendering as another element

`useRender` swaps the element for whatever `render` passes and merges the props. Its `state` becomes data attributes: `{ slot: 'badge', variant }` renders `data-slot="badge" data-variant="default"`.

```tsx
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'

function Badge({
	className,
	variant = 'default',
	render,
	...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	return useRender({
		defaultTagName: 'span',
		props: mergeProps<'span'>({ className: cn(badgeVariants({ variant }), className) }, props),
		render,
		state: { slot: 'badge', variant },
	})
}
```

`<Badge render={<a href="/themen" />}>Themen</Badge>` then renders an `<a>` with the badge's classes and data attributes.

## A plain element

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

## Wrapping a Base UI part

```tsx
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn('not-last:border-b', className)}
			{...props}
		/>
	)
}
```

## Related

- [React component conventions](../react/react-component-conventions.md)
- [shadcn setup](./shadcn-setup.md)
- [Tailwind conventions](../css/tailwind-conventions.md)
