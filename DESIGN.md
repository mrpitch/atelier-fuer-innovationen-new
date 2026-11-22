---
name: Xenia · Städte des Wissens
description: Die Kartei im Lesesaal — the Xenia research archive of 1996, reopened: stone-grey archive paper, index cards, graphite type and one petrol ink.
colors:
  petrol: '#00676b'
  petrolschleier: '#dcebe9'
  tiefpetrol: '#00474a'
  koralle: '#e5482b'
  korallenhauch: '#ffd9cc'
  koralle-dunkel: '#8a2b14'
  siegellack: '#c23a1d'
  archivstein: '#f1eee8'
  karteikarte: '#fbfaf7'
  graphit: '#1f2421'
  bleigrau: '#5c5f58'
  pappe: '#e7e3da'
  haarlinie: '#d6d1c5'
  feldlinie: '#c9c3b5'
  petrol-dark: '#5cc8c2'
  petrolschleier-dark: '#163a39'
  tiefpetrol-dark: '#bfe9e5'
  koralle-dark: '#ff8a6e'
  lesesaal-dark: '#121615'
  karteikarte-dark: '#1a201e'
  graphit-dark: '#ecebe4'
  bleigrau-dark: '#a5aaa2'
  pappe-dark: '#1f2624'
  haarlinie-dark: '#2c3431'
typography:
  display:
    fontFamily: 'Instrument Serif, Literata, Georgia, serif'
    fontSize: '88px'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.02em'
  hero:
    fontFamily: 'Instrument Serif, Literata, Georgia, serif'
    fontSize: '60px'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Instrument Serif, Literata, Georgia, serif'
    fontSize: '36px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Instrument Serif, Literata, Georgia, serif'
    fontSize: '32px'
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  heading:
    fontFamily: 'Instrument Serif, Literata, Georgia, serif'
    fontSize: '24px'
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: '-0.6px'
  text:
    fontFamily: 'Literata, Georgia, serif'
    fontSize: '18px'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.5
  ui:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: 'DM Mono, ui-monospace, monospace'
    fontSize: '12px'
    fontWeight: 500
    lineHeight: 1.33
rounded:
  none: '0px'
  sm: '2px'
  md: '2px'
  lg: '4px'
  xl: '8px'
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
    backgroundColor: '{colors.petrol}'
    textColor: '#ffffff'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-secondary:
    backgroundColor: '{colors.petrolschleier}'
    textColor: '{colors.tiefpetrol}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-outline:
    backgroundColor: '{colors.archivstein}'
    textColor: '{colors.graphit}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-ghost:
    textColor: '{colors.graphit}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
    height: '32px'
  button-small:
    typography: '{typography.ui}'
    rounded: '{rounded.sm}'
    padding: '0 8px'
    height: '24px'
  nav-item-active:
    backgroundColor: '{colors.pappe}'
    textColor: '{colors.graphit}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    height: '36px'
  card:
    backgroundColor: '{colors.karteikarte}'
    textColor: '{colors.graphit}'
    rounded: '{rounded.xl}'
  list-item:
    textColor: '{colors.graphit}'
    rounded: '{rounded.lg}'
    padding: '10px 12px'
    height: '60px'
  input:
    textColor: '{colors.graphit}'
    typography: '{typography.ui}'
    rounded: '{rounded.lg}'
    padding: '4px 10px'
    height: '32px'
  badge:
    backgroundColor: '{colors.petrolschleier}'
    textColor: '{colors.tiefpetrol}'
    rounded: '{rounded.pill}'
    padding: '2px 8px'
    height: '20px'
  viertel-tile:
    textColor: '{colors.graphit}'
    rounded: '{rounded.none}'
    padding: '28px'
    width: '416px'
    height: '340px'
  zentrum-tile:
    backgroundColor: '{colors.petrol}'
    textColor: '#ffffff'
    rounded: '{rounded.none}'
    padding: '28px'
    width: '416px'
    height: '340px'
---

# Design System: Xenia · Städte des Wissens

## Overview

**Creative North Star: "Die Kartei im Lesesaal"**

The site is the Xenia research archive of 1996, reopened today. It is stone-grey archive paper with index cards on it, graphite type, and one ink colour taken from the Siemens research labs: petrol. A second colour, coral, appears in a single role: the mark that says "Sie sind hier". The Stadtplan is still a real grid of districts set around a petrol centre. Every Viertel has a small line-drawn building on a pale petrol disc. A Rundgang is a row of those buildings you step along. The paper is warm, quiet and exact: hairline rules, precise mono labels, big serif numerals for years and sequences.

The map is the frame and the original Xenia text is the destination. Headings, large numerals and the source texts are set in book serifs. Interface words are set in a plain grotesque. Labels, counts and measurements are set in a monospace, like the stamps and shelf marks on archive cards. Density is low: generous margins, one main thing per view, and navigation that points the way without competing with the text.

The system is the shadcn/ui kit in its "Kartei" style mode, with Light and Dark themes, extended with the Xenia components (Viertel-Kachel, Rundgang-Karte, Thema-Karte, Weg components and the illustration set). Kartei is the default style of the Figma file `ms4MqN4CJhsLTMTKqTSC8p`: every page carries the Kartei mode of the `Style` collection. "Atelier" and "Xeniapolis" remain as alternative modes. In code, `src/lib/styles/variables-kartei.css` holds the Kartei tokens and `src/lib/styles/fonts/kartei.ts` loads its fonts; the alternative modes stay as tweakcn files in `design/`.

**Key Characteristics:**

- Warm stone-grey archive paper, graphite type and lines, petrol as the single strong colour.
- Display serif for headings and large numerals, text serif for original texts, grotesque for interface, mono for labels and numbers.
- Flat surfaces separated by hairlines and tints; the petrol Zentrum tile is the one inverted surface.
- Line-drawn buildings on pale petrol discs identify every Viertel, Thema and the Stadtplatz.
- Small, barely rounded controls (24–32px tall, 2–4px corners).

## Colors

An ink-on-archive-paper palette: one petrol, one pale petrol mist, one coral signal, and warm greys that read as card stock and pencil.

### Primary

- **Petrol** (`#00676b`): the ink of the Siemens research labs. Primary buttons, the Zentrum tile, completed progress segments, links and focus rings. In Dark it lightens to Petrol hell (`#5cc8c2`) with near-black text.

### Secondary

- **Petrolschleier** (`#dcebe9`): the pale petrol mist. The disc behind every illustration, the Stadtrundgänge band on the Startseite, the "Gangart wechseln" box, the current station stop, badges and secondary buttons.
- **Tiefpetrol** (`#00474a`): text and icons set on Petrolschleier (8.6:1).

### Signal

- **Koralle** (`#e5482b`, `--signal`): marks only: the "Sie sind hier" mark and the current place on a map or bar. 3.4:1 on Archivstein, so it never carries text and never fills a button. In Dark it becomes `#ff8a6e`.
- **Korallenhauch** (`#ffd9cc`) with **Koralle dunkel** (`#8a2b14`) text: the shadcn `accent`, for menu and list highlights.
- **Siegellack** (`#c23a1d`): `destructive`, for errors and destructive actions only.

### Neutral

- **Archivstein** (`#f1eee8`): page background, header and footer.
- **Karteikarte** (`#fbfaf7`): cards and raised surfaces, a half-step lighter than the page.
- **Graphit** (`#1f2421`): headings, body text, the wordmark and illustration line art (13.6:1 on Archivstein).
- **Bleigrau** (`#5c5f58`): secondary text, captions, meta lines and the wordmark subtitle (5.6:1 on Archivstein, 6.2:1 on Karteikarte).
- **Pappe** (`#e7e3da`): muted surfaces: the active nav item, the Rundgang illustration stage, the Weg-Leiste, open progress segments and disabled fills.
- **Haarlinie** (`#d6d1c5`): every border, divider and grid line.
- **Feldlinie** (`#c9c3b5`): input borders.

### Illustration

Line art is Graphit. Surfaces are painted Karteikarte, Petrol and Schieferblau (`#3d5a80`, the kit's `chart-4`). Schieferblau is never used for UI.

### Dark

Lesesaal (`#121615`) page, Karteikarte Dark (`#1a201e`) cards, Graphit Dark (`#ecebe4`) text, Bleigrau Dark (`#a5aaa2`) secondary text, Petrolschleier Dark (`#163a39`) with Tiefpetrol Dark (`#bfe9e5`) text, Haarlinie Dark (`#2c3431`) lines.

### Reserved

These tokens exist in the Kartei theme but no screen uses them yet:

- **Viertel-Reiter** (`--viertel-*`): one index-tab tint per Viertel, Light and Dark: Annäherung `#e4dcef`, Märkte `#d9e3f1`, Kontexte `#d3e9e7`, Inszenierung `#e9e1c9`, Zukunft `#f3e6b8`, Wertschöpfung `#f6d8cc`, Potenziale `#f1d4dc`, Führung `#dde6d2`.

### Named Rules

**The Petrol Rule.** Petrol marks what moves the visitor forward and the centre of the city: primary buttons ("Rundgang starten", "Kapitel 3 weiterlesen"), the Zentrum, completed progress, links and focus. It's never a section background.

**The Mist Rule.** Petrolschleier marks the guided way: illustration discs, the Stadtrundgänge band, the "Gangart wechseln" box, the current station, secondary buttons and badges. It's never used as a decorative background outside those roles.

**The Signal Rule.** Koralle appears once per view at most, and only as a mark for the current place. Never text, never a fill behind text, never a button.

**The Ink Rule.** Text and line art are Graphit. Grey text is Bleigrau, never lighter. On Petrolschleier, text is Tiefpetrol; on Petrol, text is white.

## Typography

**Display Font:** Instrument Serif (with Literata, Georgia, serif)
**Text Font:** Literata (with Georgia, serif)
**Body Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** DM Mono (with ui-monospace, monospace)

**Character:** Instrument Serif is the large, condensed face of an archive's title page. Literata is the text face of a well-set research report. Schibsted Grotesk is the plain signage. DM Mono is the shelf mark and stamp on every card.

In Figma these come from the `Style` collection: `font/family/heading` is Instrument Serif, `font/family/serif` is Literata, `font/family/sans` is Schibsted Grotesk, `font/family/mono` is DM Mono (see Open Deviations for the library state).

### Hierarchy

Sizes are desktop / mobile; where only one size is given, both use it. The sizes are those drawn in the screens.

- **Display** (Instrument Serif 400, 88px / 48px, line height 1.0, tracking −2%): page titles of the Viertel, Rundgang, Thema, Stadtplan-Hub and Rundgänge-Hub pages.
- **Page titles, other sizes** (Instrument Serif 400): Startseite hero 60px / 48px (line height 1.0, −2%); Station 64px (1.02); Übersicht, Chronik and legal pages 60px (1.0, −1.5px); Inhaltsseiten 48px (1.05); Kapitel and Abschnitt 48px (1.02–1.05).
- **Headline** (Instrument Serif 400, 36px, line height 1.5, −1.5%): the statement heading of a Startseite section, such as "Jedes Viertel blickt aus einem anderen Winkel auf die Zukunft." The Rundgänge-Hub uses 48px / 36px.
- **Heading** (Instrument Serif 400, 24px, line height 32px, −0.6px): section headings on inner pages, such as "Ein Weg, zwei Gangarten" and "Was in jedem Viertel liegt".
- **Title** (Instrument Serif 400, 1.05–1.15, −1%): Viertel names on tiles 34px, the Stadtplatz 40px Italic, Rundgang titles 32px (44px on the hub), Thema-Karte 44px, Bibliothek entries 36px, Themen-Orte 28px, Chronik entries 26px, Steckbrief values 22px (1.25).
- **Numerals** (Instrument Serif 400): sequence numbers and years are serif, not mono: Rundgang cards 64px (40px on the hub), Bibliothek lists and Chronik years 40px, station lists 28px, Dossier pages 24px.
- **Subtitle and quotes** (Instrument Serif Italic for the subtitle, Literata for quotes): the subtitle under a page title is Italic 28px (1.25, −0.5%); pull quotes 40px (1.25); station quotes 24px (1.4); Rundgang quotes 22px (1.35); the lead paragraph of a reading page Italic 22px (1.4).
- **Text** (Literata 400, 18px, line height 1.6; Aufsatz 1.65): the original Xenia texts, in a 608px column. Teasers use Literata 17–20px at 1.45.
- **Body** (Schibsted Grotesk 400, 16px, 1.5): introductions and interface prose. Hero and section introductions use 18px (line height 32px and 29.25px); hub introductions 17px (1.5); Chronik entries 15px (1.55).
- **UI** (Schibsted Grotesk 500, 14px, 20px line height): nav items, buttons, section labels and list item titles. Meta lines use Schibsted Grotesk 400 at 14px. Small links, badges and card meta use 12px (16px line height). The Themen-Weg sidebar lists chapters in SemiBold 14px.
- **Label** (DM Mono 500, 12px, 16px line height, no tracking): uppercase as typed ("VIERTEL 03", "PROZESSANSATZ", "GANGART WECHSELN"). Mono 400 at 12px carries mixed-case meta lines, counts and routes ("5 Stationen · 15 Min.", "März 1995 · Hannover", "Annäherung → Kontexte → Zukunft"). The K1–K8 chapter chips use 11–13px.
- **Wordmark**: "Xenia" in Instrument Serif 400 28px (1.0, −1%) with "Städte des Wissens" in DM Mono 400 12px in Bleigrau. Instrument Serif has no medium weight.

### Named Rules

**The Source Text Rule.** Original Xenia texts are always set in Literata at 18px or larger, and interface copy never is. A reader can tell at a glance what is source and what is site.

**The Label Rule.** A heading gets at most one label row above it. Page titles carry an uppercase DM Mono eyebrow that names the place and its position ("VIERTEL 03", "RUNDGANG 02 · STATION 0–8 · CA. 20 MIN.", "LEITTHEMA · 8 KAPITEL IN 8 VIERTELN"); a Schibsted Grotesk 12px badge may sit next to it. Section headings carry a Schibsted Grotesk 500 14px section label ("Der Stadtplan", "Wege durch dieses Viertel"). Cards may carry a mono meta line above their title ("5 Stationen · 15 Min.").

**The Legend Rule.** DM Mono is for labels, counts, dates, durations and routes. It never carries prose or button labels. It stays at 12px on every breakpoint. Years and sequence numbers that are shown large are set in the display serif, not in mono.

## Layout

- **Desktop canvas:** 1440px. Content sits in a 1248px column with 96px side margins. The header is 64px tall with a 1280px container and 24px inner padding.
- **Mobile canvas:** 390px. Content sits in a 350px column with 20px side margins.
- **Tablet:** the Startseite and Viertel-Seite are also drawn at 768px and 1024px.
- **Spacing:** on the Tailwind 4px scale. Sections have 64–80px of padding top and bottom (80px on the Startseite, 72px on the Viertel-Seite, 56–64px on hubs and inner pages) and 40px on mobile. A section's heading block sits 24–40px above its content; list items are 12–16px apart.
- **Page hero (Bild-Hero):** a 748px text column and a 420px illustration, 80px apart, with 48px padding above and 80px below. On mobile the illustration comes first, then the text.
- **Place bar:** Viertel, Rundgang and Thema pages and every Übersicht, Inhaltsseite and Chronik page have an Ortsleiste under the header: the breadcrumb on the left, the neighbouring places on the right, named after them ("← 02 Märkte", "04 Inszenierung →", "Xenia in Telepolis ’95 →"). Kapitel and Abschnitt pages use the Ebenen-Leiste instead: the current place with "Sie sind hier", the breadcrumb, and a progress count ("KAPITEL 4 · 3 VON 8").
- **Stadtplan:** a 3 × 3 grid of square-cornered 416 × 340px tiles sharing Haarlinie borders. The eight Viertel run clockwise from top left, with the Zentrum in the middle. On mobile the tiles stack in one column in the desktop reading order (01, 02, 03, 08, Zentrum, 04, 07, 06, 05).
- **Reading pages (Kapitel, Abschnitt):** three columns 56px apart: a 300px Themen-Weg sidebar, a 608px text column and a 260px right column, with 64px margin on the left and 96px on the right. The right column holds the "Gangart wechseln" box and an "Im Viertel außerdem" list of related material. On mobile a Themen-Weg button opens the sidebar, and the right-column content follows the text.
- **Rundgang station pages:** the Rundgang-Leiste on top, then a 620px illustration stage on Pappe beside an 820px text area, and the station navigation along the bottom. On mobile they stack, and the bottom bar keeps only the previous and next buttons.
- **Seitenkopf (Übersicht, Inhaltsseite, Chronik):** the uppercase mono eyebrow in Petrol, the page title, then a Schibsted Grotesk introduction on an Übersicht or the Chronik, or an Italic subtitle and an optional mono meta line on an Inhaltsseite. Items 24px apart.
- **Übersicht** (`/bibliothek`, `/bibliothek/[typ]`): the Seitenkopf in a 608px column, a filter row with tabs and search, then the Bibliothek entries across the full 1248px column.
- **Inhaltsseite** (Dossier, Mosaik-Baustein, Aufsatz, Ereignis, and the Idee, Menschen and Kontakt pages): three columns 56px apart with 96px margins on both sides, so they line up with the header and the Ortsleiste: a 268px navigation column, a 608px content column and a 260px right column. The left column is always navigation, in one of two forms: the sections of the page as jump links ("Inhalt") on long texts, or the siblings of a collection entry with the current one active ("Alle Dossiers · 4", "Alle Mosaik-Bausteine · 17", "Ausstellungen · 3"). The right column holds links to related places as outline list items under a section label ("Zum Dossier", "Zur Ausstellung"). The content column opens with the Seitenkopf and then carries only the blocks the page needs, 48px apart: Steckbrief (facts in two columns), Fließtext (Literata with Heading-size subheads and Italic quotes), Inhaltsliste (numbered list items that link to original texts).
- **Chronik** (`/chronik`): the Seitenkopf, the Zeitleiste of milestones in an 880px column (year, line with dot, entry), then the Arbeitsschwerpunkte list. Mobile versions of Übersicht, Inhaltsseite and Chronik are not drawn yet.

**The Text Leads Rule.** On a reading page the text column is the widest thing on screen. When navigation competes with it, collapse the navigation.

## Elevation & Depth

Flat paper. Surfaces and controls sit at rest with no shadow: the kit's `shadow/surface` and `shadow/control` tokens are zero in Kartei (`--shadow-opacity: 0` in the theme). Depth comes from Haarlinie hairlines, the half-step between Archivstein and Karteikarte, Petrolschleier bands and the inverted Zentrum tile.

### Shadow Vocabulary

- **Tab lift** (`box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`): the active tab trigger only.
- **Popover** (`box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.10)`): menus, popovers and select lists.
- **Overlay**: sheets and drawers have no shadow in the kit (`shadow/overlay` is zero). A proposal of `0 8px 24px` in Graphit at 12% is not in the Kartei theme; it stays provisional.

### Named Rules

**The Paper Rule.** Anything that's part of the page is flat. Only something that floats above the page (menu, popover, sheet, drawer) may cast a shadow. A border and a shadow never appear on the same element.

## Shapes

- **Controls:** buttons, inputs, selects, list items and nav items have barely rounded corners (4px). Small buttons, tab triggers and menu items have 2px.
- **Cards, dialogs and the Gangart box:** 8px. The Thema-Karte is drawn with 12px (see Open Deviations).
- **Badges:** pills.
- **Stadtplan tiles and Rundgang cards:** square-cornered, so the grid reads as one continuous map rather than a set of cards.
- **Illustrations:** each sits on a full circle of Petrolschleier with a thin horizon line at its base. Line art is Graphit in a single stroke weight; surfaces are painted Karteikarte, Petrol and Schieferblau. Sizes: 420px in a page hero, 128px on a tile, 44 × 64px as a station stop.

## Components

### Buttons

Quiet signage: small, barely rounded, never louder than the heading they serve.

- **Shape:** 32px tall with 4px corners and 10px side padding. The small size is 24px tall with 2px corners and 8px padding.
- **Primary:** Petrol with white text, for the action that moves the visitor forward ("Rundgang starten", "Kapitel 3 weiterlesen"). The Startseite uses it in the hero and on each Rundgang card.
- **Secondary:** Petrolschleier with Tiefpetrol text, for a step that leads somewhere else in the city.
- **Outline / Ghost / Link:** outline is Archivstein with a Haarlinie border (Kontakt in the header); ghost has no fill ("Wege durch dieses Viertel ↓"); link is plain 12–14px text. An arrow (→, ↓, ←) marks movement.
- **Hover / Focus:** not designed yet. When implemented, focus is a 2px Petrol ring.

### Cards / Containers

- **Card:** Karteikarte with a 1px Haarlinie border and 8px corners, no shadow.
- **List item:** 60px tall, 4px corners, Haarlinie outline, 10px × 12px padding. Used for station lists, the Themen-Weg chapters and "Weiter im Stadtplan".
- **Thema-Karte:** Karteikarte with a Haarlinie border; 40px padding for the large card, 32px for the small one.
- **Gangart-Box:** Petrolschleier, 8px corners: the "you are here / go here" card in the reading-page right column.

### Inputs / Fields

- **Style:** transparent fill, 1px Feldlinie border, 4px corners, 32px tall.
- **Contrast gap:** Feldlinie on Archivstein is 1.5:1, below the 3:1 that WCAG 2.2 AA asks for the boundary of a control. Darken the input border before inputs ship.
- **Focus / Error:** not designed yet.

### Navigation

- **Desktop header:** the wordmark on the left, then six areas in Schibsted Grotesk 500 14px: Idee, Stadtplan, Rundgänge, Themen, Bibliothek, Chronik, with Kontakt as an outline button. The current area sits on a Pappe pill (36px, 4px corners); the Startseite has none.
- **Mobile header:** a 64px navbar with the wordmark and a menu button. The open mobile menu isn't drawn yet.
- **Footer:** on Archivstein, with the wordmark and link columns (Entdecken, Lesen, Projekt, Kontakt).

### Viertel-Kachel (signature)

- A square-cornered 416 × 340px map tile with 28px padding: "VIERTEL 0n" in uppercase DM Mono at the top left and a mono pointer at the top right ("→ Idee"), the building illustration (128px), then the Viertel name in the display serif 34px and its focus question in Schibsted Grotesk 14px.
- The Zentrum tile is the same shape, inverted to Petrol with white type: "ZENTRUM" and "↗" on top, "Der Stadtplatz" in Instrument Serif Italic 40px.
- Names follow the glossary: "Märkte & Kooperation", "Potenziale".

### Rundgang-Karte

- Square-cornered, on the Petrolschleier band: a display serif 64px numeral, a mono meta line ("5 Stationen · 15 Min."), the title in the display serif 32px, a Schibsted Grotesk 16px description, the route in mono ("Annäherung → Kontexte → Zukunft") and a primary "Rundgang starten" button.

### Steckbrief

- Four facts in a row, each an uppercase DM Mono label ("PROZESSANSATZ", "BAUFORM") over a display serif 22px value.

### Rundgang-Leiste and Station Bar (signature)

- **Top bar (65px):** the wordmark, "RUNDGANG" over the tour name, "Station 3 von 8 · Kontexte", eight 100 × 4px progress segments (completed ones Petrol, the rest Pappe), "noch ca. 11 Min.", and "Route" / "Rundgang beenden".
- **Bottom bar (101px):** the previous station ("Station 2 · Märkte") on the left, the stops 0–8 as small illustrations in the middle, and "Weiter zu Station 4 · Inszenierung" on the right. The current stop is slightly larger (48 × 68px), on Petrolschleier, with a 2px frame.

## Do's and Don'ts

### Do:

- **Do** set every original Xenia text in Literata at 18px or larger, in a column no wider than 608px.
- **Do** use Petrol for what moves the visitor forward and Petrolschleier for the guided way. Nothing else gets those colours.
- **Do** give every Viertel, Thema and the Stadtplatz its line-drawn building on a Petrolschleier disc. Reuse the existing illustration components rather than drawing new ones.
- **Do** bind every colour to the Style and Mode variables, so every style mode and Light and Dark all work.
- **Do** name places by their glossary names ("das Viertel der Kontexte"), and use numbers only where the sequence matters.

### Don't:

- **Don't** stack more than one label row above a heading.
- **Don't** use DM Mono for prose or button labels.
- **Don't** add shadows to cards, tiles or anything that sits on the page.
- **Don't** use Koralle for text, fills or buttons, or more than once per view.
- **Don't** use Schieferblau outside the illustrations.
- **Don't** use a one-sided bar or border to highlight a quote or note. Use italics, a tint or a full border.
- **Don't** number things that aren't a sequence, such as nav items.

## Open Deviations

Places where the screens break their own system. They're recorded here, not adopted as rules:

- The published kit library (`4EJ76bQptCoMzeCin5ZeOM`) still has `font/family/serif` and `font/family/heading` set to Newsreader in the Kartei mode, so the Figma pages render headings and source text in Newsreader. The code (`src/lib/styles/fonts/kartei.ts`) and the local `Style` collection in the app file say Literata and Instrument Serif. Align the kit and republish, then re-check title sizes and line heights against Instrument Serif, which is narrower than Newsreader.
- On mobile, the Station and Abschnitt titles are set in Schibsted Grotesk ExtraBold 36px instead of the display serif.
- On mobile, the pull quotes on the Startseite and Thema-Seite are set in Schibsted Grotesk 500 18px, which breaks the Source Text Rule.
- The Thema-Karte uses a raw 12px corner radius instead of the kit's 8px card radius.
- Input borders are below 3:1 contrast (see Inputs).
