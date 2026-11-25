---
type: how-to
title: How to check Figma against the design specs
description: Run the Figma MCP audit before an epic is specced, so drift between the Figma file and kartei-design-system.md is found before a Sandcastle run, not after it.
tags: [figma, design, kartei, breakpoints, audit, spec]
status: stable
last_reviewed: 2026-11-25
---

# How to check Figma against the design specs

The Sandcastle runner can't open Figma, so every mismatch between the Figma file and the specs reaches a ticket as a `spec_conflict` after the run. Run this check in a session with the Figma MCP before writing an epic spec. Issue #110 ran it on the whole file; #109 on the Stadt templates.

Prerequisites: a session with the Figma MCP (`create_session` on `ms4MqN4CJhsLTMTKqTSC8p` first, `figma-use` loaded), and the spec side open: [Kartei design system](../reference/design/kartei-design-system.md), `src/lib/styles/variables-kartei.css`, `PRODUCT.md`, the [glossary](../reference/glossary.md) and the epic's issue.

## Steps

Every check below is one read-only `use_figma` call per screen page (pages 1–6, `figma.app.templatesPage` in `agents.yaml`), sent in parallel. Each script starts with:

```js
const page = await figma.getNodeByIdAsync(PAGE_ID)
await figma.setCurrentPageAsync(page)
const tops = []
for (const n of page.children) {
	if (n.type === 'SECTION') tops.push(...n.children.filter((c) => c.type === 'FRAME'))
	else if (n.type === 'FRAME') tops.push(n)
}
const vis = (n) => {
	for (let p = n; p && p.type !== 'PAGE'; p = p.parent) if (p.visible === false) return false
	return true
}
```

1. **Layout: overflow and clipping.** A frame is a layout reference only when its content fits it (Kartei design system, Breakpoints). Report every visible node that leaves its screen frame, and every text clipped by any ancestor with `clipsContent`:

   ```js
   const out = []
   for (const f of tops) {
   	const fb = f.absoluteBoundingBox
   	for (const n of f.findAll((n) => ['TEXT', 'INSTANCE', 'FRAME'].includes(n.type))) {
   		try {
   			if (!vis(n)) continue
   			const b = n.absoluteBoundingBox
   			if (b.x + b.width > fb.x + fb.width + 1 || b.x < fb.x - 1) {
   				out.push(`${Math.round(f.width)} overflow ${n.id} ${n.name}`)
   				continue
   			}
   			if (n.type !== 'TEXT') continue
   			for (let p = n.parent; p && p !== f.parent; p = p.parent) {
   				if (!p.clipsContent) continue
   				const pb = p.absoluteBoundingBox
   				const cut = Math.max(
   					b.x + b.width - (pb.x + pb.width),
   					pb.x - b.x,
   					b.y + b.height - (pb.y + pb.height),
   				)
   				if (cut > 2)
   					out.push(`${Math.round(f.width)} clipped "${n.characters.slice(0, 24)}" in ${p.name}`)
   				if (cut > 2) break
   			}
   		} catch {}
   	}
   }
   return [...new Set(out)]
   ```

   A frame named "… (scrollt horizontal)" clips on purpose; skip it.

2. **Variants: which `Breakpoint` each width uses.** Compare the result with the breakpoint table. A component with a `Breakpoint` variant that has no row gets one.

   ```js
   const res = {}
   for (const f of tops) {
   	const w = Math.round(f.width)
   	for (const i of f.findAllWithCriteria({ types: ['INSTANCE'] })) {
   		const vp = i.variantProperties
   		if (!vp || !('Breakpoint' in vp)) continue
   		const set = (await i.getMainComponentAsync())?.parent?.name ?? '?'
   		;((res[set] ??= {})[w] ??= new Set()).add(vp.Breakpoint)
   	}
   }
   return Object.fromEntries(
   	Object.entries(res).map(([k, v]) => [
   		k,
   		Object.fromEntries(Object.entries(v).map(([w, s]) => [w, [...s]])),
   	]),
   )
   ```

   On the Components page (`figma.app.componentsPage`, as `PAGE_ID`), list every `COMPONENT_SET` whose variants carry `Breakpoint`, so the table covers all of them:

   ```js
   return page
   	.findAllWithCriteria({ types: ['COMPONENT_SET'] })
   	.filter((s) =>
   		s.children.some((c) => c.variantProperties && 'Breakpoint' in c.variantProperties),
   	)
   	.map((s) => ({ id: s.id, name: s.name }))
   ```

3. **Tokens: Figma values against `variables-kartei.css`.** Resolve each `Mode` colour variable under the `Style` collection's Kartei mode (follow `VARIABLE_ALIAS` values, using the Kartei mode for `Style` and Light/Dark for `Mode`), then convert the CSS `oklch()` values to hex and compare; a difference above 2/255 per channel is drift. Check the radii the same way (`radius/lg` = `--radius`).

4. **Rules: unbound paints, Koralle, Petrol, Schieferblau, type.** Per screen frame, list solid fills and strokes without `boundVariables.color` (skip illustrations, icons and Pro Blocks), more than one `signal` use per frame (Signal Rule), `primary` fills larger than a card (Petrol Rule), and `chart-4` outside an illustration. For type, read `getStyledTextSegments(['fontName', 'fontSize'])` and flag families other than Instrument Serif, Literata, Schibsted Grotesk and DM Mono; DM Mono outside 11–13px or longer than 70 characters (Legend Rule); Literata below 17px (Source Text Rule).

5. **Content: props against what is visible, and copy.** For every instance, a `BOOLEAN` property like `Show Media` that is `false` while an illustration inside it is visible, and a `TEXT` property whose bound text node is hidden or reads differently. Then search the visible text for glossary spellings ("Potentiale" → "Potenziale") and for features the specs exclude: `Lesezeichen|gelesen|gesehen|besucht|✓|zuletzt|Fortschritt|Konto|Anmeld|Merkliste`.

6. **Coverage.** Compare the frame names and widths with the routes in `src/app` and the epic's scope, and the Components page with `src/components`. A component for an epic not yet built is not drift; a route without a frame is (record it under Open deviations).

7. **Report and decide.** Post one table on the issue: page, frame/component, node ID, width, spec source, cause, decision. Each row gets a human decision: fix Figma, fix the spec, or record it under Open deviations in the Kartei design system. Save before/after screenshots under `review-evidence/figma/` and link them from the report.

## Verify

Run step 1 again after the fixes. It returns `[]` on every page, apart from intentional scroll containers.

## Troubleshooting

- **A variant swap lost the instance's texts.** `setProperties({ Breakpoint })` drops text overrides when the variants' layers differ. Clone the same template's instance from a frame that already uses the target variant (the 768 frame for `Mobile`), insert it at the old instance's index, set it to `FILL` and remove the old one.
- **`The node with id … does not exist` mid-loop.** A swap replaced the nested instances the loop still held. Collect the target IDs first, then mutate.
- **A fixed child in a narrow frame.** Resized copies of 1440 keep fixed widths (560px intro text in a 350px column). Set text to `FILL` with `textAutoResize = 'HEIGHT'`; let a horizontal row of buttons or badges wrap (`layoutWrap = 'WRAP'`).
- **A frame looks right but the check flags it.** The text box is wider than its glyphs (a 576px Section Title in a 310px column). Set it to `FILL`; the drawing doesn't change.
