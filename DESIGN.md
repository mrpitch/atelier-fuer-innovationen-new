---
name: Xenia · Städte des Wissens
description: Die Wissensstadt auf Papier — a calm, warm, learned reading city for the original Xenia texts.
colors:
  tinte-auf-leder: '#644a40'
  morgenlicht: '#ffdfb5'
  tiefes-leder: '#582d1d'
  papier: '#f9f9f9'
  blatt: '#fcfcfc'
  druckschwarz: '#202020'
  bleistift: '#646464'
  loeschpapier: '#efefef'
  falzlinie: '#d8d8d8'
  tinte-auf-leder-dark: '#ffe0c2'
  morgenlicht-dark: '#393028'
  papier-dark: '#111111'
  blatt-dark: '#191919'
  druckschwarz-dark: '#eeeeee'
  bleistift-dark: '#b4b4b4'
typography:
  display:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '88px'
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '48px'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '32px'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  text:
    fontFamily: 'Newsreader, Georgia, serif'
    fontSize: '20px'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.5
  ui:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: 1.33
rounded:
  none: '0px'
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  pill: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '12': '48px'
  '24': '96px'
components:
  button-primary:
    backgroundColor: '{colors.tinte-auf-leder}'
    textColor: '{colors.blatt}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-secondary:
    backgroundColor: '{colors.morgenlicht}'
    textColor: '{colors.tiefes-leder}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-outline:
    backgroundColor: '{colors.papier}'
    textColor: '{colors.druckschwarz}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-ghost:
    textColor: '{colors.druckschwarz}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  nav-item-active:
    backgroundColor: '{colors.morgenlicht}'
    textColor: '{colors.tiefes-leder}'
    typography: '{typography.ui}'
    rounded: '{rounded.md}'
    height: '28px'
  card:
    backgroundColor: '{colors.blatt}'
    textColor: '{colors.druckschwarz}'
    rounded: '{rounded.xl}'
    padding: '16px'
  input:
    textColor: '{colors.druckschwarz}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '4px 10px'
    height: '32px'
  badge:
    backgroundColor: '{colors.morgenlicht}'
    textColor: '{colors.tiefes-leder}'
    rounded: '{rounded.pill}'
    padding: '2px 8px'
    height: '20px'
  viertel-tile:
    backgroundColor: '{colors.papier}'
    textColor: '{colors.druckschwarz}'
    rounded: '{rounded.none}'
    padding: '28px'
    height: '340px'
  zentrum-tile:
    backgroundColor: '{colors.tinte-auf-leder}'
    textColor: '{colors.blatt}'
    rounded: '{rounded.none}'
    padding: '28px'
    height: '340px'
---

# Design System: Xenia · Städte des Wissens

## Overview

**Creative North Star: "Die Wissensstadt auf Papier"**

The site is an architectural city map you can walk on: drawn, numbered and spatial. The Stadtplan is a real grid of districts set around a dark centre. Every Viertel has a small line-drawn building on a disc of Morgenlicht. A Rundgang is a row of those buildings you step along. The paper is calm, warm and learned. Ink-brown lines and type sit on off-white paper. Peach light falls only where the visitor is meant to go next.

The map is the frame and the original Xenia text is the destination. Headings and the source texts are set in a quiet book serif. Interface words are set in a plain sans, and numbers and measurements in a monospace, like the scale bar on a map. Density is low: generous margins, one main thing per view, and navigation that points the way without competing with the text.

The system is the shadcn/ui kit in its "Atelier" style mode, with Light and Dark themes, extended with the Xenia components (Viertel-Kachel, Rundgang-Karte, Thema-Karte, Weg components and the illustration set). The Figma file `ms4MqN4CJhsLTMTKqTSC8p` is the source. The code has not implemented it yet.

**Key Characteristics:**

- Off-white paper, ink-brown type and lines, Morgenlicht peach as the single warm accent.
- Book serif for headings and original texts; Inter for interface; Geist Mono only for numbers and metadata.
- Flat surfaces separated by hairlines and tints; the dark Zentrum tile is the one inverted surface.
- Line-drawn buildings on Morgenlicht discs identify every Viertel, Thema and the Stadtplatz.
- Small, gently rounded controls (28–32px tall, 8px corners).

## Colors

A two-colour ink-on-paper palette: one dark warm brown, one pale warm peach, and greys that read as paper and pencil.

### Primary

- **Tinte auf Leder**: the ink. Primary buttons, the Zentrum tile, the footer band, the progress segments, focus rings and section rules. In Dark it inverts to a pale peach.

### Secondary

- **Morgenlicht**: the warm light. The disc behind every illustration, the Stadtrundgänge band, the active nav item, the "Dieser Ort im Rundgang" card, badges and secondary buttons.
- **Tiefes Leder**: text and icons set on Morgenlicht.

### Neutral

- **Papier**: page background.
- **Blatt**: cards and raised surfaces, a half-step lighter than the page.
- **Druckschwarz**: headings and body text.
- **Bleistift**: secondary text, captions and meta lines (5.7:1 on Papier).
- **Löschpapier**: muted surfaces, the Card footer and disabled fills.
- **Falzlinie**: every border, divider and grid line.

### Named Rules

**The One Light Rule.** Morgenlicht marks where the visitor is or should go next: the current place, the next step, a chosen nav item. Never use it as a decorative background.

**The Ink Rule.** Text and line art are Druckschwarz or Tinte auf Leder. Grey text is Bleistift, never lighter. On Morgenlicht, text is Tiefes Leder.

## Typography

**Display Font:** Newsreader (with Georgia, serif)
**Body Font:** Inter (with system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace)

**Character:** Newsreader reads like a well-printed 1990s research report. Inter is the signage. Geist Mono is the map's scale bar and house numbers.

### Hierarchy

- **Display** (Newsreader 400, 88px desktop / 44px mobile, line height 1.02, tracking −0.02em): the Startseite hero only. Station and Abschnitt titles use the same style at 56–64px.
- **Headline** (Newsreader 400, 48px / 30px mobile, 1.1, −0.015em): one statement heading per section, such as "Jedes Viertel blickt aus einem anderen Winkel auf die Zukunft."
- **Title** (Newsreader 400, 32–34px / 22–26px mobile, 1.05–1.1, −0.01em): section names, Viertel names on tiles, Rundgang and Thema titles. Subtitles use Newsreader Italic at 26px.
- **Text** (Newsreader 400, 20px, 1.6; quotes 24px at 1.4): the original Xenia texts. Measure 60–70 characters (a 608px column).
- **Body** (Inter 400, 16–18px, 1.5): introductions and interface prose.
- **UI** (Inter 500, 14px): nav items, buttons, item titles. Meta lines use Inter 400 at 14px.
- **Label** (Geist Mono 500, 12px desktop / 14px mobile, no tracking, set as written): numbers and measurements only, such as "Viertel 03", "5 Stationen · 15 Min." and "1996".

### Named Rules

**The Source Text Rule.** Original Xenia texts are always set in Newsreader at Text size or larger, and interface copy never is. A reader can tell at a glance what is source and what is site.

**The No Kicker Rule.** There are no labels above headings. A heading names itself. Metadata goes below the title as a meta line, and attributions go below the quote.

**The Scale Bar Rule.** Geist Mono is for numbers, counts, dates and durations. It never carries prose, button labels or section names. On mobile it's at least 14px.

## Layout

- **Desktop canvas:** 1440px. Content sits in a 1248px column with 96px side margins.
- **Mobile canvas:** 390px. Content sits in a 350px column with 20px side margins.
- **Spacing:** on the Tailwind 4px scale. Sections are separated by 96–112px, groups inside a section by 40px, related items by 16px, and label to content by 8px.
- **Stadtplan:** a 3 × 3 grid of square-cornered tiles sharing Falzlinie borders. The eight Viertel run clockwise from top left, with the Zentrum in the middle. On mobile the Zentrum becomes a full-width tile on top, followed by a two-column grid in numeric order.
- **Reading pages:** three columns. A 300px Themen-Weg sidebar on the left, a 608px text column, and a 260px right column holding the "Dieser Ort im Rundgang" card. Related material goes under the text, not in the right column.
- **Rundgang pages:** split into an illustration stage (620px, Löschpapier) and the text, with a fixed station bar along the bottom. On tablet and mobile, navigation opens on demand in a sheet or bottom drawer.

**The Text Leads Rule.** On a reading page the text column is the widest thing on screen. When navigation competes with it, collapse the navigation.

## Elevation & Depth

Flat paper. Surfaces sit at rest with no shadow: card and surface shadow tokens are zero. Depth comes from Falzlinie hairlines, the half-step between Papier and Blatt, Morgenlicht bands and the inverted Zentrum tile. The one existing shadow is a hairline lift on the active tab.

### Shadow Vocabulary

- **Tab lift** (`box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`): the active tab trigger only.
- **Overlay** (provisional, `box-shadow: 0 8px 24px rgba(32,32,32,0.12)`): menus, sheets and drawers that float over the page. It's allowed in principle; the value is a proposal until it appears in the kit.

### Named Rules

**The Paper Rule.** Anything that's part of the page is flat. Only something that floats above the page (menu, sheet, drawer) may cast a shadow. A border and a shadow never appear on the same element.

## Shapes

- **Controls:** buttons, inputs and items have gently rounded corners (8px). Small buttons and nav items have 6px.
- **Cards:** 12px.
- **Badges:** pills.
- **Stadtplan tiles:** square-cornered, so the grid reads as one continuous map rather than a set of cards.
- **Illustrations:** each sits on a full circle of Morgenlicht with a thin horizon line at its base, and line art drawn in a single stroke weight.

## Components

### Buttons

Quiet signage: small, gently rounded, never louder than the heading they serve.

- **Shape:** gently rounded (8px), 32px tall (28px for the small size).
- **Primary:** Tinte auf Leder with white text. Used once per view for the next step ("Rundgang starten", "Zum Stadtplan").
- **Secondary:** Morgenlicht with Tiefes Leder text. Used for the step that leads somewhere else in the city ("Kapitel 3 lesen").
- **Outline / Ghost / Link:** outline is Papier with a Falzlinie border; ghost has no fill; link is plain text that sits flush with the text column. An arrow (→) marks movement.
- **Hover / Focus:** not designed yet. When implemented, focus is a 2px Tinte auf Leder ring.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** Blatt on Papier, or Morgenlicht for the one "you are here / go here" card.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Falzlinie.
- **Internal Padding:** 16px, or 28–40px for feature cards such as Thema-Karte.

### Inputs / Fields

- **Style:** transparent fill, 1px Falzlinie border, 8px corners, 32px tall.
- **Focus / Error:** not designed yet.

### Navigation

- **Desktop header:** wordmark on the left, then eight areas in Inter 500 14px: Idee, Stadtplan, Rundgänge, Themen, Bibliothek, Chronik, Menschen, with Kontakt as an outline button. The current area sits on a Morgenlicht pill.
- **Below the header:** a breadcrumb starting at the area, and a plain "Abschnitt 3 von 8" count with segment bar at the right.
- **Mobile menu:** a full sheet with the areas in Newsreader 28px, a row of the eight Viertel illustrations, and the primary action at the bottom.

### Viertel-Kachel (signature)

- A square-cornered map tile: "Viertel 0n" in Geist Mono at the top left, the building illustration (128px), then the Viertel name in Newsreader and its focus line in Inter 14px.
- The Zentrum tile is the same shape, inverted to Tinte auf Leder with white type and an italic name.
- Names follow the glossary: "Märkte & Kooperation", "Potenziale".

### Rundgang-Leiste and Station Bar (signature)

- **Top bar:** the tour name, eight thin progress segments (the Stadtplatz prologue is unnumbered), remaining time, and "Route" / "Rundgang beenden".
- **Bottom bar:** the stations as small illustrations labelled Prolog and 1–8, the current one framed in Tinte auf Leder on Morgenlicht, with named previous and next buttons on either side.

## Do's and Don'ts

### Do:

- **Do** set every original Xenia text in Newsreader at 20px or larger, in a column no wider than 608px.
- **Do** mark the current place and the next step with Morgenlicht, and nothing else.
- **Do** give every Viertel, Thema and the Stadtplatz its line-drawn building on a Morgenlicht disc. Reuse the existing illustration components rather than drawing new ones.
- **Do** bind every colour to the Mode variables, so Light and Dark both work.
- **Do** name places by their glossary names ("das Viertel der Kontexte"), and use numbers only where the sequence matters.

### Don't:

- **Don't** put a label or kicker above a heading.
- **Don't** use Geist Mono for prose, buttons or section names, or below 14px on mobile.
- **Don't** add shadows to cards, tiles or anything that sits on the page.
- **Don't** use a one-sided bar or border to highlight a quote or note. Use italics, a tint or a full border.
- **Don't** number things that aren't a sequence (nav items, Rundgang cards).
