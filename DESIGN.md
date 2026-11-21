---
name: Xenia · Städte des Wissens
description: Der Stadtplan auf Zeichenpapier — the original Xeniapolis city map, redrawn as a calm reading city for the Xenia texts.
colors:
  xenia-blau: '#2a35c9'
  himmel: '#e8eafc'
  tiefblau: '#1f2a8f'
  mosaik-rosa: '#fbe1e6'
  mosaik-rot: '#7a2440'
  ziegelrot: '#b4233a'
  zeichenpapier: '#fbfaf6'
  blatt: '#ffffff'
  tusche: '#1b1d3a'
  schiefer: '#5b5d70'
  loeschpapier: '#f2f1ec'
  bleistift: '#dcdad3'
  feldlinie: '#cfcdc5'
  xenia-blau-dark: '#aeb6ff'
  himmel-dark: '#1d2257'
  tiefblau-dark: '#dfe3ff'
  zeichenpapier-dark: '#0c0e2e'
  blatt-dark: '#13163d'
  tusche-dark: '#eceef9'
  schiefer-dark: '#a3a7c7'
  bleistift-dark: '#2a2e63'
typography:
  display:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '88px'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.02em'
  hero:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '60px'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '36px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '32px'
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  heading:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '24px'
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: '-0.6px'
  text:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '18px'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'Nunito Sans, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.5
  ui:
    fontFamily: 'Nunito Sans, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: 'IBM Plex Mono, ui-monospace, monospace'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: 1.33
rounded:
  none: '0px'
  sm: '2px'
  md: '4px'
  lg: '6px'
  xl: '10px'
  2xl: '14px'
  pill: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '14': '56px'
  '16': '64px'
  '18': '72px'
  '20': '80px'
  '24': '96px'
components:
  button-primary:
    backgroundColor: '{colors.xenia-blau}'
    textColor: '{colors.blatt}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-secondary:
    backgroundColor: '{colors.himmel}'
    textColor: '{colors.tiefblau}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-outline:
    backgroundColor: '{colors.zeichenpapier}'
    textColor: '{colors.tusche}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-ghost:
    textColor: '{colors.tusche}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-small:
    typography: '{typography.ui}'
    rounded: '{rounded.md}'
    padding: '0 8px'
    height: '24px'
  nav-item-active:
    backgroundColor: '{colors.loeschpapier}'
    textColor: '{colors.tusche}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    height: '36px'
  card:
    backgroundColor: '{colors.blatt}'
    textColor: '{colors.tusche}'
    rounded: '{rounded.xl}'
  list-item:
    textColor: '{colors.tusche}'
    rounded: '{rounded.lg}'
    padding: '10px 12px'
    height: '60px'
  input:
    textColor: '{colors.tusche}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '4px 10px'
    height: '32px'
  badge:
    backgroundColor: '{colors.himmel}'
    textColor: '{colors.tiefblau}'
    rounded: '{rounded.pill}'
    padding: '2px 8px'
    height: '20px'
  viertel-tile:
    textColor: '{colors.tusche}'
    rounded: '{rounded.none}'
    padding: '28px'
    width: '416px'
    height: '340px'
  zentrum-tile:
    backgroundColor: '{colors.xenia-blau}'
    textColor: '{colors.blatt}'
    rounded: '{rounded.none}'
    padding: '28px'
    width: '416px'
    height: '340px'
---

# Design System: Xenia · Städte des Wissens

## Overview

**Creative North Star: "Der Stadtplan auf Zeichenpapier"**

The site is the city map of the original xeniapolis.de (Siemens AG, 1996–1999), redrawn: a pencil-and-ink plan on white drawing paper, held together by the ultramarine of the old site's frame. The Stadtplan is a real grid of districts set around a blue centre. Every Viertel has a small line-drawn building on a disc of Himmel, painted in Xenia-Blau and Ziegelrot. A Rundgang is a row of those buildings you step along. The paper is calm, cool and learned: ink-blue type and lines on off-white paper, with ultramarine where the visitor acts.

The map is the frame and the original Xenia text is the destination. Headings, large numerals and the source texts are set in a quiet book serif. Interface words are set in a soft, rounded sans that echoes the lowercase district labels of the original map. Labels, counts and measurements are set in a monospace, like the legend and scale bar on a map. Density is low: generous margins, one main thing per view, and navigation that points the way without competing with the text.

The system is the shadcn/ui kit in its "Xeniapolis" style mode, with Light and Dark themes, extended with the Xenia components (Viertel-Kachel, Rundgang-Karte, Thema-Karte, Weg components and the illustration set). Xeniapolis is the default style of the Figma file `ms4MqN4CJhsLTMTKqTSC8p`; "Atelier" and "Kartei" remain as alternative modes of the same `Style` collection. The code-side theme is `design/xeniapolis.tweakcn.css`. The code has not implemented it yet.

**Key Characteristics:**

- Off-white drawing paper, ink-blue type and lines, Xenia-Blau as the single strong colour.
- Book serif for headings, large numerals and original texts; Nunito Sans for interface; IBM Plex Mono for labels and numbers.
- Flat surfaces separated by pencil hairlines and tints; the blue Zentrum tile is the one inverted surface.
- Line-drawn buildings on Himmel discs identify every Viertel, Thema and the Stadtplatz.
- Small, slightly rounded controls (24–32px tall, 4–6px corners).

## Colors

An ink-on-drawing-paper palette: one saturated ultramarine, one pale sky blue, a brick red used only inside the illustrations, and cool greys that read as paper and pencil.

### Primary

- **Xenia-Blau**: the ultramarine of the original site. Primary buttons, the Zentrum tile, completed progress segments and focus rings. In Dark it lightens to Blaupause (`#aeb6ff`) with Netscape-Nacht text.

### Secondary

- **Himmel**: the pale sky. The disc behind every illustration, the Stadtrundgänge band on the Startseite, the "Gangart wechseln" box, the current station stop, badges and secondary buttons.
- **Tiefblau**: text and icons set on Himmel.

### Illustration

- **Ziegelrot** (`#b4233a`, the kit's `chart-4`): the second paint colour of the buildings, next to Xenia-Blau and Blatt. Never used for UI.

### Neutral

- **Zeichenpapier**: page background, header and footer.
- **Blatt**: cards and raised surfaces, pure white, a half-step lighter than the page.
- **Tusche**: headings, body text, the wordmark and illustration line art.
- **Schiefer**: secondary text, captions, meta lines and the wordmark subtitle (6.2:1 on Zeichenpapier).
- **Löschpapier**: muted surfaces: the active nav item, the Rundgang illustration stage, the Weg-Leiste, open progress segments and disabled fills.
- **Bleistift**: every border, divider and grid line.
- **Feldlinie**: input borders.

### Dark

Netscape-Nacht (`#0c0e2e`) page, Blatt Dark (`#13163d`) cards, Mondlicht (`#eceef9`) text, Schiefer Dark (`#a3a7c7`) secondary text, Himmel Dark (`#1d2257`) with Tiefblau Dark (`#dfe3ff`) text, Bleistift Dark (`#2a2e63`) lines.

### Reserved

These tokens exist in the kit's Xeniapolis mode but no screen uses them yet:

- **Mosaik-Rosa** (`#fbe1e6`) with **Mosaik-Rot** (`#7a2440`) text: the shadcn `accent`, taken from the pink Mosaik paving of the original map. Menu and list highlights.
- **Signal** (`#c2255c`, `custom/signal`).
- **Viertel-Aquarelle** (`custom/viertel-*`): one watercolour wash per Viertel, Light and Dark, from Annäherung (`#ece4f6`) to Führung (`#f8dcea`).

### Named Rules

**The Ultramarine Rule.** Xenia-Blau marks what moves the visitor forward and the centre of the city: primary buttons ("Rundgang starten", "Kapitel 3 weiterlesen"), the Zentrum, completed progress and focus. It's never a section background.

**The Sky Rule.** Himmel marks the guided way: illustration discs, the Stadtrundgänge band, the "Gangart wechseln" box, the current station, secondary buttons and badges. It's never used as a decorative background outside those roles.

**The Ink Rule.** Text and line art are Tusche. Grey text is Schiefer, never lighter. On Himmel, text is Tiefblau; on Xenia-Blau, text is white.

## Typography

**Display Font:** Newsreader (with Georgia, serif)
**Body Font:** Nunito Sans (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace)

**Character:** Newsreader reads like a well-printed 1990s research report. Nunito Sans is the signage, rounded like the hand-lettered district names on the original map. IBM Plex Mono is the map's legend, scale bar and house numbers.

In Figma these come from the `Style` collection: `font/family/heading` and `font/family/serif` are Newsreader, `font/family/sans` is Nunito Sans, `font/family/mono` is IBM Plex Mono.

### Hierarchy

Sizes are desktop / mobile; where only one size is given, both use it.

- **Display** (Newsreader 400, 88px / 48px, line height 1.0, tracking −2%): page titles of the Viertel, Rundgang, Thema, Stadtplan-Hub and Rundgänge-Hub pages.
- **Page titles, other sizes** (Newsreader 400): Startseite hero 60px / 48px (line height 1.0, −2%); Station 64px (1.02); Bibliothek, Mosaik and legal pages 60px (1.0, −1.5px); Dossier 64px and Aufsatz 52px (1.05); Kapitel and Abschnitt 48px (1.02–1.05).
- **Headline** (Newsreader 400, 36px, line height 1.5, −1.5%): the statement heading of a Startseite section, such as "Jedes Viertel blickt aus einem anderen Winkel auf die Zukunft." The Rundgänge-Hub uses 48px / 36px.
- **Heading** (Newsreader 400, 24px, line height 32px, −0.6px): section headings on inner pages, such as "Ein Weg, zwei Gangarten" and "Was in jedem Viertel liegt".
- **Title** (Newsreader 400, 1.05–1.15, −1%): Viertel names on tiles 34px, the Stadtplatz 40px Italic, Rundgang titles 32px (44px on the hub), Thema-Karte 44px, Bibliothek entries 36px, Themen-Orte 28px, Chronik entries 26px, Steckbrief values 22px (1.25).
- **Numerals** (Newsreader 400): sequence numbers are serif, not mono: Rundgang cards 64px (40px on the hub), Bibliothek lists and Chronik years 40px, station lists 28px, Dossier pages 24px.
- **Subtitle and quotes** (Newsreader): the subtitle under a page title is Italic 28px (1.25, −0.5%); pull quotes 40px (1.25); station quotes 24px (1.4); Rundgang quotes 22px (1.35); the lead paragraph of a reading page Italic 22px (1.4).
- **Text** (Newsreader 400, 18px, line height 1.6; Aufsatz 1.65): the original Xenia texts, in a 608px column. Teasers use Newsreader 17–20px at 1.45.
- **Body** (Nunito Sans 400, 16px, 1.5): introductions and interface prose. Hero and section introductions use 18px (line height 32px and 29.25px); hub introductions 17px (1.5); Chronik entries 15px (1.55).
- **UI** (Nunito Sans 500, 14px, 20px line height): nav items, buttons, section labels and list item titles. Meta lines use Nunito Sans 400 at 14px. Small links, badges and card meta use 12px (16px line height). The Themen-Weg sidebar lists chapters in SemiBold 14px.
- **Label** (IBM Plex Mono 500, 12px, 16px line height, no tracking): uppercase as typed ("VIERTEL 03", "PROZESSANSATZ", "GANGART WECHSELN"). Mono 400 at 12px carries mixed-case meta lines, counts and routes ("5 Stationen · 15 Min.", "März 1995 · Hannover", "Annäherung → Kontexte → Zukunft"). The K1–K8 chapter chips use 11–13px.
- **Wordmark**: "Xenia" in Newsreader 500 28px (1.0, −1%) with "Städte des Wissens" in IBM Plex Mono 400 12px in Schiefer.

### Named Rules

**The Source Text Rule.** Original Xenia texts are always set in Newsreader at 18px or larger, and interface copy never is. A reader can tell at a glance what is source and what is site.

**The Label Rule.** A heading gets at most one label row above it. Page titles carry an uppercase IBM Plex Mono eyebrow that names the place and its position ("VIERTEL 03", "RUNDGANG 02 · STATION 0–8 · CA. 20 MIN.", "LEITTHEMA · 8 KAPITEL IN 8 VIERTELN"); a Nunito Sans 12px badge may sit next to it. Section headings carry a Nunito Sans 500 14px section label ("Der Stadtplan", "Wege durch dieses Viertel"). Cards may carry a mono meta line above their title ("5 Stationen · 15 Min.").

**The Legend Rule.** IBM Plex Mono is for labels, numbers, counts, dates, durations and routes. It never carries prose or button labels. It stays at 12px on every breakpoint.

## Layout

- **Desktop canvas:** 1440px. Content sits in a 1248px column with 96px side margins. The header is 64px tall with a 1280px container and 24px inner padding.
- **Mobile canvas:** 390px. Content sits in a 350px column with 20px side margins.
- **Tablet:** the Startseite and Viertel-Seite are also drawn at 768px and 1024px.
- **Spacing:** on the Tailwind 4px scale. Sections have 64–80px of padding top and bottom (80px on the Startseite, 72px on the Viertel-Seite, 56–64px on hubs and inner pages) and 40px on mobile. A section's heading block sits 24–40px above its content; list items are 12–16px apart.
- **Page hero (Bild-Hero):** a 748px text column and a 420px illustration, 80px apart, with 48px padding above and 80px below. On mobile the illustration comes first, then the text.
- **Place bar:** Viertel, Rundgang and Thema pages have an Ortsleiste under the header: the breadcrumb on the left, the neighbouring places on the right ("← 02 Märkte", "04 Inszenierung →"). Kapitel and Abschnitt pages use the Ebenen-Leiste instead: the current place with "Sie sind hier", the breadcrumb, and a progress count ("KAPITEL 4 · 3 VON 8").
- **Stadtplan:** a 3 × 3 grid of square-cornered 416 × 340px tiles sharing Bleistift borders. The eight Viertel run clockwise from top left, with the Zentrum in the middle. On mobile the tiles stack in one column in the desktop reading order (01, 02, 03, 08, Zentrum, 04, 07, 06, 05).
- **Reading pages (Kapitel, Abschnitt):** three columns 56px apart: a 300px Themen-Weg sidebar, a 608px text column and a 260px right column, with 64px margin on the left and 96px on the right. The right column holds the "Gangart wechseln" box and an "Im Viertel außerdem" list of related material. On mobile a Themen-Weg button opens the sidebar, and the right-column content follows the text.
- **Rundgang station pages:** the Rundgang-Leiste on top, then a 620px illustration stage on Löschpapier beside an 820px text area, and the station navigation along the bottom. On mobile they stack, and the bottom bar keeps only the previous and next buttons.

**The Text Leads Rule.** On a reading page the text column is the widest thing on screen. When navigation competes with it, collapse the navigation.

## Elevation & Depth

Flat paper. Surfaces and controls sit at rest with no shadow: the kit's `shadow/surface` and `shadow/control` tokens are zero in Xeniapolis. Depth comes from Bleistift hairlines, the half-step between Zeichenpapier and Blatt, Himmel bands and the inverted Zentrum tile.

### Shadow Vocabulary

- **Tab lift** (`box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`): the active tab trigger only.
- **Popover** (`box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.10)`): menus, popovers and select lists.
- **Overlay**: sheets and drawers have no shadow in the kit (`shadow/overlay` is zero). `design/xeniapolis.tweakcn.css` proposes `0 8px 24px` in Tusche at 12%; it's a proposal until it appears in the kit.

### Named Rules

**The Paper Rule.** Anything that's part of the page is flat. Only something that floats above the page (menu, popover, sheet, drawer) may cast a shadow. A border and a shadow never appear on the same element.

## Shapes

- **Controls:** buttons, inputs, selects, list items and nav items have slightly rounded corners (6px). Small buttons, tab triggers and menu items have 4px.
- **Cards, dialogs and the Gangart box:** 10px. The Thema-Karte is drawn with 12px (see Open Deviations).
- **Badges:** pills.
- **Stadtplan tiles and Rundgang cards:** square-cornered, so the grid reads as one continuous map rather than a set of cards.
- **Illustrations:** each sits on a full circle of Himmel with a thin horizon line at its base. Line art is Tusche in a single stroke weight; surfaces are painted Blatt, Xenia-Blau and Ziegelrot. Sizes: 420px in a page hero, 128px on a tile, 44 × 64px as a station stop.

## Components

### Buttons

Quiet signage: small, slightly rounded, never louder than the heading they serve.

- **Shape:** 32px tall with 6px corners and 10px side padding. The small size is 24px tall with 4px corners and 8px padding.
- **Primary:** Xenia-Blau with white text, for the action that moves the visitor forward ("Rundgang starten", "Kapitel 3 weiterlesen"). The Startseite uses it in the hero and on each Rundgang card.
- **Secondary:** Himmel with Tiefblau text, for a step that leads somewhere else in the city.
- **Outline / Ghost / Link:** outline is Zeichenpapier with a Bleistift border (Kontakt in the header); ghost has no fill ("Wege durch dieses Viertel ↓"); link is plain 12–14px text. An arrow (→, ↓, ←) marks movement.
- **Hover / Focus:** not designed yet. When implemented, focus is a 2px Xenia-Blau ring.

### Cards / Containers

- **Card:** Blatt with a 1px Bleistift border and 10px corners, no shadow.
- **List item:** 60px tall, 6px corners, Bleistift outline, 10px × 12px padding. Used for station lists, the Themen-Weg chapters and "Weiter im Stadtplan".
- **Thema-Karte:** Blatt with a Bleistift border; 40px padding for the large card, 32px for the small one.
- **Gangart-Box:** Himmel, 10px corners: the "you are here / go here" card in the reading-page right column.

### Inputs / Fields

- **Style:** transparent fill, 1px Feldlinie border, 6px corners, 32px tall.
- **Contrast gap:** Feldlinie on Zeichenpapier is 1.5:1, below the 3:1 that WCAG 2.2 AA asks for the boundary of a control. Darken the input border before inputs ship.
- **Focus / Error:** not designed yet.

### Navigation

- **Desktop header:** the wordmark on the left, then six areas in Nunito Sans 500 14px: Idee, Stadtplan, Rundgänge, Themen, Bibliothek, Chronik, with Kontakt as an outline button. The current area sits on a Löschpapier pill (36px, 6px corners); the Startseite has none.
- **Mobile header:** a 64px navbar with the wordmark and a menu button. The open mobile menu isn't drawn yet.
- **Footer:** on Zeichenpapier, with the wordmark and link columns (Entdecken, Lesen, Projekt, Kontakt).

### Viertel-Kachel (signature)

- A square-cornered 416 × 340px map tile with 28px padding: "VIERTEL 0n" in uppercase IBM Plex Mono at the top left and a mono pointer at the top right ("→ Idee"), the building illustration (128px), then the Viertel name in Newsreader 34px and its focus question in Nunito Sans 14px.
- The Zentrum tile is the same shape, inverted to Xenia-Blau with white type: "ZENTRUM" and "↗" on top, "Der Stadtplatz" in Newsreader Italic 40px.
- Names follow the glossary: "Märkte & Kooperation", "Potenziale".

### Rundgang-Karte

- Square-cornered, on the Himmel band: a Newsreader 64px numeral, a mono meta line ("5 Stationen · 15 Min."), the title in Newsreader 32px, a Nunito Sans 16px description, the route in mono ("Annäherung → Kontexte → Zukunft") and a primary "Rundgang starten" button.

### Steckbrief

- Four facts in a row, each an uppercase IBM Plex Mono label ("PROZESSANSATZ", "BAUFORM") over a Newsreader 22px value.

### Rundgang-Leiste and Station Bar (signature)

- **Top bar (65px):** the wordmark, "RUNDGANG" over the tour name, "Station 3 von 8 · Kontexte", eight 100 × 4px progress segments (completed ones Xenia-Blau, the rest Löschpapier), "noch ca. 11 Min.", and "Route" / "Rundgang beenden".
- **Bottom bar (101px):** the previous station ("Station 2 · Märkte") on the left, the stops 0–8 as small illustrations in the middle, and "Weiter zu Station 4 · Inszenierung" on the right. The current stop is slightly larger (48 × 68px), on Himmel, with a 2px frame.

## Do's and Don'ts

### Do:

- **Do** set every original Xenia text in Newsreader at 18px or larger, in a column no wider than 608px.
- **Do** use Xenia-Blau for what moves the visitor forward and Himmel for the guided way. Nothing else gets those colours.
- **Do** give every Viertel, Thema and the Stadtplatz its line-drawn building on a Himmel disc. Reuse the existing illustration components rather than drawing new ones.
- **Do** bind every colour to the Mode variables, so Light and Dark both work.
- **Do** name places by their glossary names ("das Viertel der Kontexte"), and use numbers only where the sequence matters.

### Don't:

- **Don't** stack more than one label row above a heading.
- **Don't** use IBM Plex Mono for prose or button labels.
- **Don't** add shadows to cards, tiles or anything that sits on the page.
- **Don't** use Ziegelrot outside the illustrations.
- **Don't** use a one-sided bar or border to highlight a quote or note. Use italics, a tint or a full border.
- **Don't** number things that aren't a sequence, such as nav items.

## Open Deviations

Places where the screens break their own system. They're recorded here, not adopted as rules:

- On mobile, the Station and Abschnitt titles are set in Nunito Sans ExtraBold 36px instead of Newsreader.
- On mobile, the pull quotes on the Startseite and Thema-Seite are set in Nunito Sans 500 18px, which breaks the Source Text Rule.
- The Thema-Karte uses a raw 12px corner radius instead of the kit's 10px card radius.
- Input borders are below 3:1 contrast (see Inputs).
