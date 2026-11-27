---
type: reference
title: Kartei design system
description: The decisions of the Kartei style that neither Figma nor the token files carry — colour roles and their tokens, type roles, breakpoints, layout and elevation rules, illustration rules, component behaviour, and the open deviations in the Figma screens.
tags:
  [design, design-system, design-tokens, kartei, figma, colors, typography, layout, illustrations]
status: stable
last_reviewed: 2026-11-25
authoritative: true
---

# Kartei design system

This doc holds only what Figma and the code don't say: which colour does which job, which face sets which text, where a layout switches, and what the screens deliberately avoid. The only numbers here are rule thresholds (a minimum text size, a maximum column width, a contrast ratio); every other value lives in one of these sources and is not repeated:

| What                                                      | Source                                                                                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Colour, radius and shadow values                          | Kartei mode of the `Style` collection in the Figma file `ms4MqN4CJhsLTMTKqTSC8p`; in code `src/lib/styles/variables-kartei.css`         |
| Utility mapping and radius scale                          | `src/lib/styles/theme.css` ([Theme system](./theme-system.md))                                                                          |
| Font families and weights                                 | Figma `font/family/*`; in code `src/lib/styles/fonts/kartei.ts` ([Font system](./font-system.md))                                       |
| Sizes, spacing and measurements of screens and components | The Figma screens (pages 1–6) and the Components page. Measure there with the Figma MCP; a ticket spec quotes the node ID, not this doc |

## Overview

### Creative North Star: "Die Kartei im Lesesaal"

The site is the Xenia research archive of 1996, reopened today. It is stone-grey archive paper with index cards on it, graphite type, and one ink colour taken from the Siemens research labs: petrol. A second colour, coral, appears in a single role: the mark that says "Sie sind hier". The Stadtplan is still a real grid of districts set around a petrol centre. Every Viertel has a small line-drawn building on a pale petrol disc. A Rundgang is a row of those buildings you step along. The paper is warm, quiet and exact: hairline rules, precise mono labels, big serif numerals for years and sequences.

The map is the frame and the original Xenia text is the destination. Headings, large numerals and the source texts are set in book serifs. Interface words are set in a plain grotesque. Labels, counts and measurements are set in a monospace, like the stamps and shelf marks on archive cards. Density is low: generous margins, one main thing per view, and navigation that points the way without competing with the text.

The system is the shadcn/ui kit in its "Kartei" style mode, with Light and Dark themes, extended with the Xenia components (Viertel-Kachel, Rundgang-Karte, Thema-Karte, Weg components and the illustration set). Kartei is the default style of the Figma file: every page carries the Kartei mode of the `Style` collection. "Atelier" and "Xeniapolis" remain as alternative modes; in code they stay as tweakcn files in `design/`.

**Key Characteristics:**

- Warm stone-grey archive paper, graphite type and lines, petrol as the single strong colour.
- Display serif for headings and large numerals, text serif for original texts, grotesque for interface, mono for labels and numbers.
- Flat surfaces separated by hairlines and tints; the petrol Zentrum tile is the one inverted surface.
- Line-drawn buildings on pale petrol discs identify every Viertel, Thema and the Stadtplatz.
- Small, barely rounded controls.

## Colors

The Kartei names are the vocabulary of the rules below. Each names one token; its value is in Figma and `variables-kartei.css`, light in `:root`, dark in `.dark`.

| Kartei name    | Token                  | Role                                                                                                                         |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Archivstein    | `background`           | page background, header and footer                                                                                           |
| Karteikarte    | `card`, `popover`      | cards and raised surfaces, a half-step lighter than the page                                                                 |
| Graphit        | `foreground`           | headings, body text, the wordmark, illustration line art                                                                     |
| Bleigrau       | `muted-foreground`     | secondary text, captions, meta lines, the wordmark subtitle                                                                  |
| Pappe          | `muted`                | the active nav item, the Rundgang illustration stage, the Weg-Leiste, open progress segments, disabled fills                 |
| Haarlinie      | `border`               | every border, divider and grid line                                                                                          |
| Feldlinie      | `input`                | input borders                                                                                                                |
| Petrol         | `primary`, `ring`      | primary buttons, the Zentrum tile, completed progress, links, focus rings                                                    |
| Petrolschleier | `secondary`            | illustration discs, the Stadtrundgänge band, the "Gangart wechseln" box, the current station stop, badges, secondary buttons |
| Tiefpetrol     | `secondary-foreground` | text and icons on Petrolschleier                                                                                             |
| Koralle        | `signal`               | the "Sie sind hier" mark and the current place on a map or bar, nothing else                                                 |
| Korallenhauch  | `accent`               | menu and list highlights                                                                                                     |
| Koralle dunkel | `accent-foreground`    | text on Korallenhauch                                                                                                        |
| Siegellack     | `destructive`          | errors and destructive actions only                                                                                          |
| Schieferblau   | `chart-4`              | illustrations only, never UI                                                                                                 |
| Viertel-Reiter | `viertel-<slug>`       | one index-tab tint per Viertel. Reserved: no screen uses them yet                                                            |

The eight `viertel-*` slugs: `annaeherung`, `maerkte`, `kontexte`, `inszenierung`, `zukunft`, `wertschoepfung`, `potenziale`, `fuehrung`.

In Dark the rules don't change; the names do: Lesesaal (`background`), Karteikarte Dark (`card`), Graphit Dark (`foreground`), Bleigrau Dark (`muted-foreground`), Petrol hell (`primary`, with near-black text), Petrolschleier Dark (`secondary`) with Tiefpetrol Dark (`secondary-foreground`), Haarlinie Dark (`border`).

### Illustration

Every drawing is built from seven colours, which the export maps to theme tokens: Petrolschleier (`secondary`), Graphit (`foreground`, line art), Karteikarte (`card`), Petrol (`primary`), Schieferblau (`chart-4`), Haarlinie (`border`) and white (`primary-foreground`). White is only used on Petrol.

### Colour rules

**The Petrol Rule.** Petrol marks what moves the visitor forward and the centre of the city: primary buttons ("Rundgang starten", "Kapitel 3 lesen"), the Zentrum, the current place on the Mini-Stadtplan (a Petrol Plan-Feld with white text), completed progress, links and focus. It's never a section background.

**The Mist Rule.** Petrolschleier marks the guided way: illustration discs, the Stadtrundgänge band, the "Gangart wechseln" box, the current station, secondary buttons and badges. It's never used as a decorative background outside those roles.

**The Signal Rule.** Koralle appears once per view at most, and only as a mark for the current place. Never text, never a fill behind text, never a button: at 3.4:1 on Archivstein it fails text contrast.

**The Ink Rule.** Text and line art are Graphit. Grey text is Bleigrau, never lighter: it is the lightest grey that passes AA (5.6:1 on Archivstein, 6.2:1 on Karteikarte). On Petrolschleier, text is Tiefpetrol (8.6:1); on Petrol, text is white. One exception: the current Stopp on the Weg-Leiste sets its number in Petrol on its Petrolschleier fill.

**The Token Rule.** Components use token utilities only (`bg-card`, `text-muted-foreground`), never palette or arbitrary colours; lint enforces it. A new token goes into `variables-kartei.css` for light and dark, gets a `--color-*` line in `theme.css`, and a row in the table above.

## Typography

**Character:** Instrument Serif (`font-heading`) is the large, condensed face of an archive's title page. Literata (`font-serif`) is the text face of a well-set research report. Schibsted Grotesk (`font-sans`) is the plain signage. DM Mono (`font-mono`) is the shelf mark and stamp on every card.

### Roles

Sizes per screen are in Figma; the roles decide which face a text gets.

- **Display, Headline, Heading, Title** (Instrument Serif 400): page titles, the statement heading of a Startseite section, section headings on inner pages, and the names on tiles, cards and list entries. The Stadtplatz and the subtitle under a page title are Italic.
- **Numerals** (Instrument Serif 400): sequence numbers and years shown large: Rundgang cards, Bibliothek lists, Chronik years, station lists, Dossier pages.
- **Quotes and lead** (Literata, Italic for the lead paragraph): pull quotes, station and Rundgang quotes, the lead of a reading page.
- **Text** (Literata 400): the original Xenia texts, and teasers, which may go down to 17px.
- **Body** (Schibsted Grotesk 400): introductions and interface prose.
- **UI** (Schibsted Grotesk 500): nav items, buttons, section labels and list item titles; meta lines in 400. The Themen-Weg sidebar lists chapters in SemiBold.
- **Label** (DM Mono 500, 12px, uppercase as typed): eyebrows such as "VIERTEL 03", "PROZESSANSATZ", "GANGART WECHSELN". Mono 400 carries mixed-case meta lines, counts and routes ("5 Stationen · 15 Min.", "Annäherung → Kontexte → Zukunft").
- **Wordmark**: "Xenia" in Instrument Serif with "Städte des Wissens" in DM Mono, Bleigrau.

### Typography rules

**The Source Text Rule.** Original Xenia texts are always set in Literata at 18px or larger, in a column no wider than 608px, and interface copy never is. A reader can tell at a glance what is source and what is site.

**The Label Rule.** A heading gets at most one label row above it. Page titles carry an uppercase DM Mono eyebrow that names the place and its position ("VIERTEL 03", "RUNDGANG 02 · STATION 0–8 · CA. 20 MIN.", "LEITTHEMA · 8 KAPITEL IN 8 VIERTELN"); a Schibsted Grotesk badge may sit next to it. Section headings carry a Schibsted Grotesk 500 section label ("Der Stadtplan", "Wege durch dieses Viertel"). Cards may carry a mono meta line above their title.

**The Legend Rule.** DM Mono is for labels, counts, dates, durations and routes. It never carries prose or button labels. It stays at 12px on every breakpoint (11–13px for the K1–K8 chapter chips). Years and sequence numbers that are shown large are set in the display serif, not in mono.

**The Weight Rule.** Instrument Serif has weight 400 only. Hierarchy comes from size, never from `font-medium`, `font-semibold` or `font-bold` on `font-heading`.

## Layout

### Breakpoints

Every screen on the Figma pages 1–6 is drawn at 1440, 1024, 768 and 390px, with a `Breakpoint` variant on each component. The code switches at Tailwind's `sm` (640), `md` (768), `lg` (1024) and `xl` (1280), or at a container width. The table maps one to the other; a ticket spec names the row it relies on instead of restating "Desktop at 768".

| Component                         | 390             | 768             | 1024                     | 1440          | Switch           |
| --------------------------------- | --------------- | --------------- | ------------------------ | ------------- | ---------------- |
| Header, Footer, Ebenen-Leiste     | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Ortsleiste                        | Mobile          | Mobile          | Mobile                   | Desktop       | `xl`             |
| Bild-Hero                         | Mobile          | Mobile          | Mobile                   | Desktop       | `xl`             |
| Home / Hero                       | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Stadtplan                         | 1 column        | 3 × 3           | 3 × 3                    | 3 × 3         | `sm`             |
| Steckbrief                        | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Weg-Leiste                        | Mobile          | Desktop         | Desktop                  | Desktop       | `@xl`, `@3xl`    |
| Gangart cards                     | stacked         | stacked         | side by side             | side by side  | `lg`             |
| "Weiter im Stadtplan" Items       | stacked         | side by side    | side by side             | side by side  | `sm`             |
| Reading layout                    | 1 column, Sheet | 1 column, Sheet | text + Randspalte, Sheet | three columns | `lg`, `xl`       |
| Kapitel-Hero                      | Mobile          | Desktop         | Desktop                  | Desktop       | container, 512px |
| Thema-Karte, Typ Leitthema        | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Thema-Karte, Typ Themen-Ort       | Mobile          | Desktop         | Desktop                  | Desktop       | `md`             |
| Rundgang-Eintrag, Rundgang-Leiste | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Stationsnavigation                | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Stations-Bühne                    | Mobile          | Mobile          | Mobile                   | Desktop       | `xl`             |
| Bibliothek / Listen-Eintrag       | Mobile          | Mobile          | Desktop                  | Desktop       | `lg`             |
| Chronik / Zeitleisten-Eintrag     | Mobile          | Desktop         | Desktop                  | Desktop       | `md`             |

The Ortsleiste and the Bild-Hero switch at `xl` because their desktop rows don't fit 1024: long neighbour names ("Besuch in der Umgebung →") clip beside the breadcrumb, and the hero's text column would be too narrow for its title (issue #110). The Rundgang-Eintrag route wraps onto a second row when its column is narrower than the route. The Stationsnavigation's Mobile variant drops the stop illustrations from its two buttons; at 390 they don't fit beside each other.

### Layout rules

- **A frame is a layout reference only when its content fits it.** A responsive frame whose children are wider than its body, or are clipped by it, is a resized copy of the 1440 frame, not a design for that width. Use the breakpoint table, and correct the frame. The same holds one level down: text clipped by its own card, column or row is a drawing error, not a truncation rule. [How to check Figma against the design specs](../../how-to/how-to-check-figma-against-the-design-specs.md) finds both.
- **Section heads wrap.** A section's heading row (heading on the left, a count or link on the right, "25 Aufsätze · 17 Mosaik-Bausteine →") wraps the right-hand part under the heading when both don't fit.
- **Spacing** is on Tailwind's 4px scale. A measured one-off that isn't on it gets an `eslint-disable` comment that states the measurement and its Figma source.
- **Page hero (Bild-Hero):** below `xl` the illustration comes first, then the text. The title hyphenates, so a one-word title breaks at a syllable ("Futur-systeme").
- **Place bar:** Viertel, Rundgang and Thema pages and every Übersicht, Inhaltsseite and Chronik page have an Ortsleiste under the header: the breadcrumb on the left, the neighbouring places on the right, named after them ("← 02 Märkte", "04 Inszenierung →"). Kapitel and Abschnitt pages use the Ebenen-Leiste instead: the current place with "Sie sind hier", the breadcrumb, and a progress count ("KAPITEL 4 · 3 VON 8").
- **Stadtplan:** a 3 × 3 grid of square-cornered tiles sharing Haarlinie borders. The eight Viertel run clockwise from top left, with the Zentrum in the middle. On mobile the tiles stack in one column in the desktop reading order (01, 02, 03, 08, Zentrum, 04, 07, 06, 05).
- **Reading pages (Kapitel, Abschnitt):** at `xl` three columns: the Themen-Weg sidebar, the text column and a right column with the "Gangart wechseln" box and "Im Viertel außerdem". At `lg` the sidebar becomes the Themen-Weg button, because three columns would leave the text too narrow (the Text Leads Rule). Below `lg` the right-column content follows the text.
- **Rundgang station pages:** on mobile the illustration stage and the text stack, and the bottom bar keeps only the previous and next buttons, without their stop illustrations.
- **Inhaltsseite** (Dossier, Mosaik-Baustein, Aufsatz, Ereignis, Idee and Menschen pages): three columns aligned with the header and the Ortsleiste. The left column is always navigation, in one of two forms: the sections of the page as jump links ("Inhalt") on long texts, or the siblings of a collection entry with the current one active ("Alle Dossiers · 4"). The right column holds links to related places as outline list items under a section label ("Zum Dossier"). The content column opens with the Seitenkopf and then carries only the blocks the page needs: Steckbrief, Fließtext, Inhaltsliste.
- **Seitenkopf (Übersicht, Inhaltsseite, Chronik):** the uppercase mono eyebrow in Petrol, the page title, then a Schibsted Grotesk introduction on an Übersicht or the Chronik, or an Italic subtitle and an optional mono meta line on an Inhaltsseite.
- **Übersicht** (`/bibliothek`, `/bibliothek/[typ]`): the Seitenkopf, a filter row with tabs and search, then the Bibliothek entries across the full content column.
- **Chronik** (`/chronik`): the Seitenkopf, the Zeitleiste of milestones (year, line with dot, entry), then the Arbeitsschwerpunkte list.

**The Text Leads Rule.** On a reading page the text column is the widest thing on screen. When navigation competes with it, collapse the navigation.

## Elevation & Depth

Flat paper. Surfaces and controls sit at rest with no shadow (`--shadow-opacity: 0` in Kartei). Depth comes from Haarlinie hairlines, the half-step between Archivstein and Karteikarte, Petrolschleier bands and the inverted Zentrum tile.

**The Paper Rule.** Anything that's part of the page is flat: cards, tiles, buttons, inputs. Only something that floats above the page may cast a shadow: menus, popovers, select lists and the active tab trigger. A border and a shadow never appear on the same element.

The theme maps no shadow tokens, so `shadow-*` utilities carry Tailwind's defaults. The base-nova primitives follow the Paper Rule (popover, select and dropdown menu `shadow-md`, the active tab `shadow-sm`), except the sheet's `shadow-lg`: the Kartei kit gives sheets and drawers no shadow, so remove it when a sheet is built.

## Shapes

| Element                                         | Utility              |
| ----------------------------------------------- | -------------------- |
| Small buttons, tab triggers, menu items         | `rounded-sm`         |
| Buttons, inputs, selects, list items, nav items | `rounded-lg`         |
| Cards, dialogs, the Gangart box                 | `rounded-xl`         |
| Badges                                          | `rounded-4xl` (pill) |
| Stadtplan tiles, Rundgang cards                 | `rounded-none`       |

Stadtplan tiles and Rundgang cards are square-cornered so the grid reads as one continuous map rather than a set of cards.

**Illustrations** each sit on a full circle of Petrolschleier with a thin horizon line and a flat shadow at its base. The Figma page `Illustrationen` holds the catalogue and the reasoning.

### Shape rules

**The One Object Rule.** Each Viertel, Thema and the Stadtplatz is one object that could stand in a city, chosen because it tells the place's focus at a glance. Viertel are objects seen from the front, the Zentrum is the only piece of architecture, Themen are abstract sculptures, Rundgänge are floor plans seen from above. One place, one object, one statement.

**The One Line Rule.** Contours are one weight of Graphit, 2px with round caps and joins (3–4px only for load-bearing parts). No gradients, no cast shadows, no hatching. A drawing that no longer reads as a silhouette at 64px has too much detail.

**The Key Part Rule.** Surfaces are mostly Karteikarte. Petrol paints the one part that carries the statement (the signpost arrow, the globe, the tree trunk). Schieferblau is the second accent and exists only here. Koralle never appears in an illustration.

**The Dashed Way Rule.** Movement is a dashed line (4px dash, 6px gap): a path, a flight line, an orbit, a Rundgang route. A filled dot marks a start or a position.

## Components

What a component looks like is in Figma. This section holds when to use which variant, and behaviour Figma doesn't draw.

### Buttons

Quiet signage, never louder than the heading they serve.

- **Primary:** for the action that moves the visitor forward ("Rundgang starten", "Kapitel 3 lesen").
- **Secondary:** for a step that leads somewhere else in the city.
- **Outline / Ghost / Link:** ghost for in-page jumps ("Wege durch dieses Viertel ↓"), link for small text links. An arrow (→, ↓, ←) marks movement.
- **Hover / Focus:** not designed yet. Focus is the `ring` (Petrol).

### Inputs

Feldlinie on Archivstein is 1.5:1, below the 3:1 that WCAG 2.2 AA asks for the boundary of a control. Darken the input border before inputs ship. Focus and error states are not designed yet.

### Navigation

- **Desktop header:** six areas: Idee, Stadtplan, Rundgänge, Themen, Bibliothek, Chronik. The current area sits on a Pappe pill; the Startseite has none.
- **Mobile header:** below `lg` a menu button opens a panel under the navbar with the header Menu stacked full-width, the current area on the same Pappe pill. Escape closes it and returns focus to the button. The open state is drawn only in Figma 36622:10621, not in a screen.
- **Footer:** every link is a Button link instance. Kontakt is not in the header or the footer.

### Viertel-Kachel

- The Zentrum tile is the same shape, inverted to Petrol with white type.
- Names follow the glossary: "Märkte & Kooperation", "Potenziale".

## Do's and Don'ts

### Do

- **Do** set every original Xenia text in Literata at 18px or larger, in a column no wider than 608px.
- **Do** use Petrol for what moves the visitor forward and Petrolschleier for the guided way. Nothing else gets those colours.
- **Do** give every Viertel, Thema and the Stadtplatz its line-drawn building on a Petrolschleier disc. Reuse the existing illustration components rather than drawing new ones.
- **Do** bind every colour to the Style and Mode variables, so every style mode and Light and Dark all work.
- **Do** name places by their glossary names ("das Viertel der Kontexte"), and use numbers only where the sequence matters.

### Don't

- **Don't** stack more than one label row above a heading.
- **Don't** use DM Mono for prose or button labels.
- **Don't** add shadows to cards, tiles or anything that sits on the page.
- **Don't** use Koralle for text, fills or buttons, or more than once per view.
- **Don't** use Schieferblau outside the illustrations.
- **Don't** use a one-sided bar or border to highlight a quote or note. Use italics, a tint or a full border.
- **Don't** number things that aren't a sequence, such as nav items.

## Open deviations

Places where the screens break their own system. They are recorded here, not adopted as rules:

- The published kit library (`4EJ76bQptCoMzeCin5ZeOM`) had `font/family/serif` and `font/family/heading` set to Newsreader in the Kartei mode. The kit's `Style` collection now says Literata and Instrument Serif, but the library has to be republished and the app file updated before its pages render them. Then re-check title sizes and line heights against Instrument Serif, which is narrower than Newsreader.
- On mobile, the Station and Abschnitt titles are set in Schibsted Grotesk ExtraBold instead of the display serif.
- On mobile, the pull quotes on the Startseite and Thema-Seite are set in Schibsted Grotesk 500, which breaks the Source Text Rule.
- The Thema-Karte uses a raw 12px corner radius instead of `rounded-xl`.
- Input borders are below 3:1 contrast (see Inputs).
- Sheets and drawers have no shadow in the kit (`shadow/overlay` is zero). A proposal of `0 8px 24px` in Graphit at 12% is not in the Kartei theme; it stays provisional.
- Reading state is drawn but not decided (issue #64): T01 Wiederkehr ("Hier waren Sie zuletzt", "Kapitel 1–2 gelesen") and the Datenschutz page ("Lesezeichen auf diesem Gerät"). The specs of the Startseite and Seiten epics (#72, #74) decide per screen once #64 is settled; until then these screens are not a reference for that copy. The Rundgang screens are decided: no reading state (epic #115). T05's "✓ Besucht", T07's "Sie waren zuletzt hier" and "Ihr Fortschritt bleibt gespeichert" are not built, and the Stopp's `gesehen` status (`stopp.tsx`) is derived from the Station's position in the Rundgang, not stored.
- The Zentrum page (`/stadt/zentrum`) has no Figma frame. Epic #92 specs it as the Viertel composition (T02) without Steckbrief and Aufsätze; the code follows that.
- The Weg-Leiste switches by container width, not viewport (issue #112, `@container`): its Info block moves beside the Stopps from `@3xl` (768px of its own width), and the Stopps stay in one un-wrapped row from `@xl` (576px). The Breakpoints table's "Desktop" column would suggest `md` (issue #98). Figma T02@768 (36626:9182) draws Info and the nine Stopps side by side in a 688px-wide frame (a 40px page margin); the page sections around the Weg-Leiste in code give it only 576px at 768 (`PageSection`'s `md:px-24`), not enough room for both side by side without wrapping the Stopps. So Info stacks above them below `@3xl`, which lands at about 1024 in the page. The container thresholds are chosen to match the viewports (768, 1024) the old `md`/`lg` switches had.
- The Thema pages (review #127, T09a `36603:12965`, T09b `36603:14391`) differ from Figma in four accepted ways. (1) The Ortsleiste on the Leitthema puts "←" before the first Themen-Ort, which Figma leaves bare; on a Themen-Ort page the neighbour that is a Themen-Ort shows its `shortTitle` ("Netzwerk" for "Netzwerk der Innovatoren"), not the full title, so the row fits at 390 and 768. (2) At 390 and 768 the Ortsleiste neighbours stay in one row, where Figma T09b stacks them. (3) In the Themen-Weg list the K label and "Lesen" are centred on the row, where Figma top-aligns them; the rows wrap to three lines on mobile. (4) The Themen-Ort eyebrow badge ("zweigt bei Kapitel 5 ab") wraps below the label at 390, where Figma wraps the label beside it. The Zitat attribution ("Xenia · Präsentation zum Thema …"), the chapter titles, the Abschnitt counts and the Themen-Ort bodies in Figma are real Xenia texts; the code shows placeholders until the content epic lands. Dark mode has no Figma reference; it was checked for contrast and overflow only.
- The desktop header's current area (issue #81) has no dedicated active state in Figma: the screens draw it as the NavigationMenu item's `State=Hover` variant, the same Pappe pill a pointer hover shows. The code gives the current entry a real active state (`aria-current="page"`, `data-active`), which happens to render identically to Hover since both map to `bg-muted`.
