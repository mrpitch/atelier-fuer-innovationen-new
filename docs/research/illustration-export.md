---
type: research
title: Illustrations, Figma completeness and export
description: Which of the 14 illustration IDs are finished in Figma, how to export them as token-coloured inline-SVG React components, and whether sizes need separate drawings (issue #63).
status: draft
last_reviewed: 2026-11-23
---

# Illustrations: Figma completeness and export to React

Research for issue #63. Figma file `ms4MqN4CJhsLTMTKqTSC8p`, page `Illustrationen` (`36768:15544`), inspected read-only on 2026-11-23 through the Figma MCP server (`get_metadata`, `get_screenshot`, `get_variable_defs`, `get_design_context`, `download_assets`).

## Answer

- **Complete:** 13 of the 14 registry IDs have a finished component on the page. `rundgaenge/durch-die-viertel` has no drawing under that name. Figma draws three Rundgänge (Erste Annäherung, Besuch im Zentrum, Besuch in der Umgebung) while the content has two (Besuch im Zentrum, Durch die Viertel), so someone has to decide which drawing goes with Durch die Viertel.
- **Station stops:** no separate drawings exist and none are needed. The 44 × 64 stop (`Xenia / Weg / Stopp`, `36585:8230`) puts an instance of the place's own illustration in a 36 × 36 slot.
- **Export:** export each component as SVG, keep only the component's group, swap the seven hex values for token utility classes (`fill-card`, `stroke-foreground`, …), and commit one TSX component per ID. The hex-to-token map below comes from Figma's own variable bindings.
- **Sizes:** one drawing on a `0 0 240 240` viewBox per ID, scaled by CSS. Figma scales the same component for its 240, 128, 64 and 36 px uses.

## 1. Which of the 14 are finished?

All illustrations are components (`symbol`) in section `Katalog · Stadtviertel, Zentrum, Themen, Rundgänge` (`36474:7237`), 240 × 240 each. Every one has the Petrolschleier disc, horizon and shadow, and a dark-mode preview instance (frames `36474:7426` and `36515:10989`). Source: `get_metadata` on `36768:15544`, screenshot of `36474:7237`.

| Registry ID (`src/components/ui/illustration.tsx`) | Figma component                                               | Node          | Motif                              | Status      |
| -------------------------------------------------- | ------------------------------------------------------------- | ------------- | ---------------------------------- | ----------- |
| `stadt/annaeherung`                                | Illustration / Viertel / Annäherung                           | `36474:7249`  | Wegweiser                          | finished    |
| `stadt/maerkte-kooperation`                        | Illustration / Viertel / Märkte & Kooperation                 | `36474:7262`  | Ideenbox                           | finished    |
| `stadt/kontexte`                                   | Illustration / Viertel / Kontexte                             | `36474:7276`  | Becherglas mit Welt                | finished    |
| `stadt/inszenierung`                               | Illustration / Viertel / Inszenierung                         | `36474:7294`  | Zeitungsleser                      | finished    |
| `stadt/zukunft`                                    | Illustration / Viertel / Zukunft                              | `36474:7306`  | Rutsche                            | finished    |
| `stadt/wertschoepfung`                             | Illustration / Viertel / Wertschöpfung                        | `36474:7319`  | Baum                               | finished    |
| `stadt/potenziale`                                 | Illustration / Viertel / Potentiale (spelt with _t_ in Figma) | `36474:7334`  | Waben / Mosaik                     | finished    |
| `stadt/fuehrung`                                   | Illustration / Viertel / Führung                              | `36474:7350`  | Netz-Pavillon                      | finished    |
| `stadt/zentrum`                                    | Illustration / Zentrum / Stadtplatz                           | `36474:7364`  | Stadtplatz mit Häuserzeile         | finished    |
| `themen/eine-welt-fuer-morgen`                     | Illustration / Thema / Eine Welt für morgen                   | `36474:7374`  | Kugel-Skulptur mit Umlaufbahn      | finished    |
| `themen/futursysteme`                              | Illustration / Thema / Futursysteme                           | `36474:7385`  | Faltprisma mit Flugbahn            | finished    |
| `themen/netzwerk-der-innovatoren`                  | Illustration / Thema / Netzwerk der Innovatoren               | `36474:7400`  | Segel-Skulptur mit Netzwerk        | finished    |
| `rundgaenge/besuch-im-zentrum`                     | Illustration / Rundgang / Besuch im Zentrum                   | `36515:10973` | Grundriss mit Rundweg um den Platz | finished    |
| `rundgaenge/durch-die-viertel`                     | none                                                          | —             | —                                  | **missing** |

Figma components without a content counterpart:

| Figma component                                  | Node          | Motif                                    |
| ------------------------------------------------ | ------------- | ---------------------------------------- |
| Illustration / Rundgang / Erste Annäherung       | `36515:10960` | Grundriss mit Weg durchs Tor, "hinein"   |
| Illustration / Rundgang / Besuch in der Umgebung | `36515:10986` | Labyrinth mit Weg zum Horizont, "hinaus" |

The content has two Rundgänge (`src/content/rundgaenge/besuch-im-zentrum`, `src/content/rundgaenge/durch-die-viertel`). The comment in `illustration.tsx` says "3 Rundgänge", but the map has 2 entries. Before export, decide whether Durch die Viertel uses Erste Annäherung (its "hinein" path fits a Rundgang that starts in a Viertel) or needs a new drawing.

### Station stops (44 × 64)

`Xenia / Weg / Stopp` (`36585:8230`, Components page) has three variants: `gesehen` 44 × 64 (`36585:8190`), `aktuell` 48 × 68 (`36585:8207`) and `offen` 44 × 64 (`36585:8228`). Each variant holds a `Media` slot of 36 × 36 that contains an illustration **instance** (in the main component it's `Illustration / Zentrum / Stadtplatz`), plus the `Nummer` text below it. A stop shows the illustration of the place where the station is, scaled down. It is not a separate drawing (`get_metadata` on `36585:8190`).

## 2. How to export to inline-SVG React with token colours

### What Figma has

- Every fill and stroke is bound to a mode variable. The Gestaltungsprinzipien section (`36770:26697`, "MODUS" principle) says so, and so does each component's description ("Farben an Mode-Variablen gebunden (secondary, card, primary, foreground …)").
- `get_variable_defs` on three samples returns the full set:

| Figma variable         | Light hex | DESIGN.md name | CSS token / Tailwind utility                            | Role in the drawing                             |
| ---------------------- | --------- | -------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `--secondary`          | `#DCEBE9` | Petrolschleier | `--secondary` / `fill-secondary`                        | the disc                                        |
| `--foreground`         | `#1F2421` | Graphit        | `--foreground` / `stroke-foreground`, `fill-foreground` | all lines, shadow (at 8 % opacity)              |
| `--card`               | `#FBFAF7` | Karteikarte    | `--card` / `fill-card`                                  | default surface                                 |
| `--primary`            | `#00676B` | Petrol         | `--primary` / `fill-primary`, `stroke-primary`          | the key part, dashed paths                      |
| `--chart-4`            | `#3D5A80` | Schieferblau   | `--chart-4` / `fill-chart-4`                            | second accent (Themen, Rundgänge, some Viertel) |
| `--border`             | `#D6D1C5` | Haarlinie      | `--border` / `stroke-border`                            | text lines on signs and papers                  |
| `--primary-foreground` | `#FFFFFF` | white          | `--primary-foreground` / `stroke-primary-foreground`    | line on a Petrol surface                        |

Samples: `36474:7249` (Viertel), `36474:7385` (Thema), `36515:10960` (Rundgang). All seven tokens already exist in `src/lib/styles/variables-kartei.css` with light and dark values, and `src/lib/styles/theme.css` maps them to Tailwind colours (`--color-card`, `--color-chart-4`, …). Figma's dark preview and the dark values in code use the same variable names, so dark mode needs no extra work.

### What the export gives you

`get_design_context` on `36474:7249` returns only an `<img>` that points to an SVG asset. Code Connect gives nothing extra. `download_assets` with `defaultFormat: svg` returns a 3.8 KB SVG, and it has three problems:

1. **Parent bleed.** The file starts with a `#F5F5F5` 240 × 240 `rect` and the white section background with its border (`<g id="Katalog · Stadtviertel…">`). The drawing itself is the nested `<g id="Illustration / Viertel / Annäherung">`. Only that group should be kept.
2. **Hex only.** Fills and strokes come out as literal hex (`fill="#DCEBE9"`, `stroke="#1F2421"`, `stroke="white"`). The variable bindings are lost, so the map above has to be applied again. The map can't go wrong: each hex value belongs to exactly one of the seven variables listed, and the MODUS principle forbids hand-set colours.
3. **Dashes are baked.** The dashed path (`Vector`, `36474:7242`) comes out as many short subpaths with a solid stroke instead of `stroke-dasharray`. The drawing still looks right; this only matters if someone wants to animate the dash.

The rest of the file is clean: `viewBox="0 0 240 240"`, `stroke-width="2"`, round caps and joins, shadow as `opacity="0.08"` on a Graphit fill.

The component descriptions name a target path `illustrations/svg/viertel-01-annaeherung.svg`. That path doesn't exist in this repo or in `~/Dev/atelier-fuer-innovationen`.

### Recommended pipeline

Run it once per ID, commit the result, and add no build-time SVG loader:

1. Export each component node from the table as SVG (`download_assets` with `defaultFormat: svg`, or Export → SVG in Figma on the component itself).
2. Keep only `<g id="Illustration / …">` and its children, and wrap it in `<svg viewBox="0 0 240 240">`. Drop `width`/`height` so CSS sets the size.
3. Replace each hex value with a token class according to the map: `fill="#FBFAF7"` → `className="fill-card"`, `stroke="#1F2421"` → `className="stroke-foreground"`. A path with both fill and stroke gets both classes. `fill="none"` stays.
4. Convert to TSX (camelCase attributes, `strokeWidth`, `strokeLinecap`; drop `id`s, since inline SVG ids are page-global) and keep the existing `role="img"` / `aria-label` contract from `Placeholder`.
5. Put each ID's component into the `illustrations` map. Callers don't change (issue #28).

Use classes rather than `currentColor`: one `currentColor` covers one colour, and these drawings have up to seven. `fill="var(--card)"` in the attribute also works in current browsers. Tailwind classes match how the project already applies tokens, and they show up in a grep for tokens.

SVGR can do steps 3 and 4 in one call with its `replaceAttrValues` option (for example `#FBFAF7=var(--card)`). It isn't a dependency yet. With only 14–15 files, a small one-off script or a hand conversion is just as reliable, and the output can be checked against the Figma screenshot.

## 3. Separate drawings per size?

No. Use one scalable SVG per ID.

- The Größenleiter in the Gestaltungsprinzipien (`36770:26951`) shows the same `Illustration / Viertel / Inszenierung` instance at 240, 128 and 64 px. The text under it reads: "Im Seitenkopf läuft die Illustration mit 420 px, auf der Kachel mit 128 px, als Haltepunkt der Rundgang-Leiste mit 44 × 64 px. Was bei 64 px nicht mehr als Silhouette lesbar ist, ist zu viel Detail." So the rule is to design one drawing that still reads small, not to draw it again for each size.
- The family examples use 128 px instances (`36770:26807` …), and the Stopp uses a 36 px instance. None of these are separate components.
- Figma scales the stroke along with the drawing (visible in the size-ladder screenshot). Plain `viewBox` scaling in the browser does the same, so the 2 px line becomes 3.5 px at 420 and about 0.3 px at 36. If the 36 px stop looks too faint in the browser, add `vector-effect="non-scaling-stroke"` to the stroked paths for that use. That's a decision for implementation, not a reason for a second drawing.
- The 44 × 64 box is the stop (36 px illustration plus number). It isn't the illustration's aspect ratio, so the square viewBox stays.
