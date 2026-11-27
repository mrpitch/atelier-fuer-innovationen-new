---
type: reference
title: Glossary
description: Canonical definitions for domain terms — the shared vocabulary used by the codebase, docs, and AI agents.
tags: [glossary, domain, language]
status: stable
last_reviewed: 2026-11-27
authoritative: true
---

# Glossary

## Site structure

**Navigation**
The hierarchy of content as it sits in the site: parents, children, siblings and their order. Sidebars, breadcrumbs and previous/next links are views of it; nobody writes it down separately.
_Avoid_: sitemap (for this meaning), menu

**Menu**
A hand-curated, ordered list of links, such as the header or footer links. It points at content or external addresses and takes titles and addresses from its targets instead of restating them. A Menu may instead hold labelled Menu groups, never a mix of the two.
_Avoid_: navigation, nav

**Menu group**
A labelled, ordered set of Menu entries inside a Menu, such as a footer column. A Menu holds either entries or groups, never both.
_Avoid_: column, section

**Short title**
An optional shorter name a document carries for places where space is tight: Menus, breadcrumbs, previous/next links. The document owns it; links never rename their target.
_Avoid_: nav title, menu label

**Seite**
A plain standalone page outside the Wissensstadt model, such as Start, Idee, Impressum or Datenschutz.
_Avoid_: page (for the Wissensstadt types), Artikel

**Draft**
A document that is written and checked but not yet published.
_Avoid_: Entwurf, unpublished, hidden

**Sitemap**
A generated page and `sitemap.xml` file that list every published document in Navigation order, derived from the content graph. Distinct from Navigation, which is the hierarchy itself.
_Avoid_: site map

## The Wissensstadt

**Viertel**
One of the eight districts of the Wissensstadt, each standing for a design focus. It has a fixed number (01–08), a name and an illustration.
_Avoid_: Stadtviertel, Stadtteil, district

**Hinweis**
A Viertel's optional link to one other document, of any type, resolved to that document's Short title and URL. Not every Viertel sets one.
_Avoid_: hint, tip, cross-reference

**Stadtplan**
The arrangement of the Zentrum and the eight Viertel on a 3×3 grid, the Zentrum in the middle. The Stadtplan, its small Mini-Stadtplan and the Weg-Leiste all draw it.
_Avoid_: map, city map

**Stadtplan-Hub**
The `/stadt` page: the Stadtplan with its overview table, the landing page of the Stadt area. Not the Stadtplan itself (code: `StadtplanHub` vs `Stadtplan`).
_Avoid_: Stadtplan (for the page)

**Leitsatz**
A one-sentence statement set apart from the body text. Three kinds share the field name `leitsatz`: a Viertel's motto, e.g. "Erweiterte, kontextuelle Orientierungen haben konsensstiftende Wirkung."; an Abschnitt's own optional pull-quote, which is not tied to the Viertel's motto; and a Thema's, set in italic display serif in its Bild-Hero. The Leitthema's `zitat` is a separate field: an attributed quote with its Quelle, not a Leitsatz.
_Avoid_: Zitat (for a Leitsatz), motto (for the Viertel's, use Leitsatz)

**Steckbrief**
The short profile of a Viertel: its Prozessansatz, Bauform, Prozessdokument and its place in the Stadtzentrum.
_Avoid_: Profil, fact sheet

**Zentrum**
The Stadtplatz at the heart of the Wissensstadt, surrounded by the eight Viertel. It isn't a Viertel.
_Avoid_: Stadtplatz (as an entity name), Station 0

**Ort**
A Viertel or the Zentrum together — wherever a Station can stand. Not to be confused with Themen-Ort, a Thema presented as a single place.
_Avoid_: place, location

**Rundgang**
A guided walk through the Wissensstadt: an ordered sequence of Stationen with an introduction.
_Avoid_: tour, Stadtrundgang

**Route**
The order in which a Rundgang visits its Stationen, shown as "Die Route" on the Rundgang-Übersicht, in the Weg-Leiste and on the Rundgänge-Hub. It is a view of the Rundgang's Stationen, not a thing of its own, and not another word for the Rundgang.
_Avoid_: Rundgang (for the sequence alone), path

**Station**
One place on a Rundgang, with the city guide's text for that place. It usually stands at an Ort; some stand at none. Its marker on the Route is a Routen-Stopp, a numbered UI element; the Station itself is never called a stop.
_Avoid_: stop, step

**Rundgänge-Hub**
The landing Seite of the Rundgänge area (`/rundgaenge`): all Rundgänge in their order, each with its route, and a short explanation of how a Rundgang works. It is a Seite with its own layout.
_Avoid_: Rundgänge-Liste, Rundgang overview (that is a single Rundgang's page)

**Rundgang-Leiste**
The top bar of a Station page, in place of the site Header: the Rundgang's name, "Station n von N", remaining time, progress, and the links "Route" and "Rundgang beenden".
_Avoid_: Rundgang header, progress bar

**Stationsnavigation**
The bar at the foot of a Station page with the previous and next Station and the Stopps of the whole Rundgang. Not the Navigation, which is the hierarchy of content.
_Avoid_: Station pager, previous/next (for the Station links alone)

**Stations-Bühne**
The stage beside a Station's text: the Ort's name and number, its illustration, the Mini-Stadtplan with the Ort marked, the Gangart switch and the link to explore the Viertel freely. A Station without an Ort shows only the Station number and the Rundgang's illustration.
_Avoid_: Station header, Station sidebar

**Thema**
One of the three XENIA themes. The Leitthema is the one told as a walk through the Viertel; the other two are Themen-Orte.
_Avoid_: topic, Themenschwerpunkt

**Leitthema**
The Thema "Eine Welt für morgen", told in Kapitel, each set in one Viertel.
_Avoid_: Themen-Weg (as an entity name)

**Kapitel**
One chapter of the Leitthema, set in one Viertel and made up of Abschnitte.
_Avoid_: chapter

**Abschnitt**
One readable section of a Kapitel, numbered within it (e.g. 4.3).
_Avoid_: section, Seite

**Gangart**
One of the two ways to visit the same Ort, a Viertel or the Zentrum: Schauen, a Rundgang's guided walk, or Lesen, the Leitthema's Kapitel (for the Zentrum, its Einführung). The Gangart-Box and the Gangart-Karten link to the other Gangart; a Gangart carries no reading state.
_Avoid_: mode, way

**Themen-Ort**
A Thema presented as a single place instead of a walk. It branches off from one Kapitel of the Leitthema.
_Avoid_: Abzweig, Themenseite

**Aufsatz**
A self-contained essay belonging to a Viertel.
_Avoid_: article, Artikel, Text
