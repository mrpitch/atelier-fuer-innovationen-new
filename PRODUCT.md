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

The site republishes **Xenia**, the Siemens AG research concept of the 1990s, "Städte des Wissens als Stätten der Begegnung", led by Dr. Helmut Volkmann, under the **Atelier für Innovationen** brand. It makes the original material readable and findable again. Success means a visitor can orient themselves in the concept, follow a guided path or go straight to a topic, and read the original texts.

## Positioning

The content is laid out as a **Wissensstadt** the visitor walks through: one Zentrum, eight Stadtviertel, Rundgänge, Themen, Bibliothek and Chronik. The city metaphor is the navigation itself, taken from the concept being published, not decoration on top of a document tree.

## Capabilities and Constraints

- German only, for UI copy and content. Domain terms stay German and follow the project glossary (Zentrum, Stadtviertel, Gestaltungsschwerpunkt, Stadtrundgang, MOSAIK, Medienspiegel and so on).
- The original Xenia texts are reproduced verbatim. Protected copy is never rewritten, summarised, split or merged.
- UI labels spell the Stadtviertel "Potenziale". Original texts keep their own spelling.
- A Kapitel has one canonical home, under its Thema: `/themen/<thema>/kapitel-<n>/<abschnitt>`. Viertel pages link to it; they don't host a second copy.
- Static site (Next.js static export). No server features and no search backend.
- Light and dark mode.

## Evidence on Hand

- The original Xenia content, already migrated in the previous repository (`mrpitch/atelier-fuer-innovationen`, Xeniapolis section, including the Archiv with Medienspiegel and Präsentationen).
- Illustrations for the eight Stadtviertel, the Zentrum (Stadtplatz) and three Themen, as components in the Figma file `ms4MqN4CJhsLTMTKqTSC8p`.
- No testimonials, quotes from users, visitor numbers or press claims beyond what the original Medienspiegel documents. Do not invent any.

## Product Principles

1. The original text is the product. Navigation and design serve reading it; nothing alters it.
2. The city is the map. Every place in the site has a location in the Wissensstadt, and the visitor can always tell where they are and how to get to the next place.
3. Several ways through one city: guided (Rundgang), by topic (Thema), by district (Stadtviertel), or by archive (Bibliothek, Chronik). Switching between them must not lose the visitor's place.
4. Newcomers get a guided start; returning readers get straight to where they left off.

## Accessibility & Inclusion

WCAG 2.2 AA.
