# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- People researching innovation, the knowledge society or the history of the 1990s digital society: academics, students, journalists.
- Practitioners of innovation and knowledge work looking for methods, for example the MOSAIK building blocks in the Viertel der Potenziale.
- Former Xenia participants and contemporaries revisiting the material.
- Curious first-time visitors with no background, who need a guided way in (the Rundgänge).

## Product Purpose

The site is a redesign of the existing site xeniapolis.de. It republishes **Xenia**, the Siemens AG research concept of the 1990s, "Städte des Wissens als Stätten der Begegnung", led by Dr. Helmut Volkmann, under the **Atelier für Innovationen** brand. It makes the original material readable and findable again. Success means a visitor can orient themselves in the concept, follow a guided path or go straight to a topic, and read the original texts.

## Positioning

The content is laid out as a **Wissensstadt** the visitor walks through: one Zentrum, eight Stadtviertel, Rundgänge, Themen, Bibliothek and Chronik. The city metaphor is the navigation itself, taken from the concept being published, not decoration on top of a document tree.

## Capabilities and Constraints

- German only, for UI copy and content. Domain terms stay German and follow the project glossary (Zentrum, Stadtviertel, Gestaltungsschwerpunkt, Stadtrundgang, MOSAIK, Medienspiegel and so on).
- The original Xenia texts are reproduced verbatim. Protected copy is never rewritten, summarised, split or merged.
- UI labels spell the Stadtviertel "Potenziale". Original texts keep their own spelling.
- A Kapitel has one canonical home, under its Thema: `/themen/<thema>/kapitel-<n>/<abschnitt>`. Viertel pages link to it; they don't host a second copy.
- Static site (Next.js static export). No server features and no search backend.
- Light and dark mode.
- Copyright in the original material: VIP Verbundforschung GmbH / Dr. Helmut Volkmann, Magnus Volkmann.

### Open decisions

- **Resume reading:** returning readers continue where they left off. This is an idea the team likes and keeps for now, not a decided feature. If built, bookmarks most likely live in the browser's local storage, with no accounts.
- **Search:** full-text search is not decided. A search would need a static index built with the site.

## Brand Commitments

- Xenia is the visible name. The wordmark is "Xenia · Städte des Wissens".
- Atelier für Innovationen is the publisher, named in the footer and the Impressum, not as the site's headline brand.
- Readers are addressed formally, with "Sie".

## Evidence on Hand

- The original Xenia content, already migrated in the previous repository (`mrpitch/atelier-fuer-innovationen`, Xeniapolis section, including the Archiv with Medienspiegel and Präsentationen).
- Illustrations for the eight Stadtviertel, the Zentrum (Stadtplatz) and three Themen, as components in the Figma file `ms4MqN4CJhsLTMTKqTSC8p`.
- No testimonials, quotes from users, visitor numbers or press claims beyond what the original Medienspiegel documents. Do not invent any.

## Product Principles

1. The original text is the product. Navigation and design serve reading it; nothing alters it.
2. The city is the map. Every place in the site has a location in the Wissensstadt, and the visitor can always tell where they are and how to get to the next place.
3. Several ways through one city: guided (Rundgang), by topic (Thema), by district (Stadtviertel), or by archive (Bibliothek, Chronik). Switching between them must not lose the visitor's place.
4. Newcomers get a guided start. Returning readers should get back to where they left off (see Open decisions).

## Accessibility & Inclusion

WCAG 2.2 AA.
