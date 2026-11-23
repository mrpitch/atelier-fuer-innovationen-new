---
type: reference
title: Glossary
description: Canonical definitions for domain terms — the shared vocabulary used by the codebase, docs, and AI agents.
tags: [glossary, domain, language]
status: stable
last_reviewed: 2026-11-23
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

**Leitsatz**
The one-sentence motto of a Viertel, e.g. "Erweiterte, kontextuelle Orientierungen haben konsensstiftende Wirkung."
_Avoid_: Zitat, motto

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
_Avoid_: tour, Stadtrundgang, Route

**Station**
One stop on a Rundgang, with the city guide's text for that place. It stands at the Zentrum or at a Viertel.
_Avoid_: stop, step

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

**Themen-Ort**
A Thema presented as a single place instead of a walk. It branches off from one Kapitel of the Leitthema.
_Avoid_: Abzweig, Themenseite

**Aufsatz**
A self-contained essay belonging to a Viertel.
_Avoid_: article, Artikel, Text
