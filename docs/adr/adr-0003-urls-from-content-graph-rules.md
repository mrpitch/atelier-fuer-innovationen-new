---
type: adr
title: 'ADR-0003: URLs come from per-type rules in the content graph'
description: Every content type has one URL rule in the content graph, so a URL follows the domain relationships (Viertel, numbers) rather than where the file lives.
tags: [adr, content, routing, urls]
status: accepted
date: 2026-11-20
---

# ADR-0003: URLs come from per-type rules in the content graph

## Context and Problem Statement

The site's URL scheme follows the reader's walk through the Wissensstadt, not the editorial structure. A Kapitel belongs to the Leitthema but is read inside its Viertel (`/stadt/inszenierung/kapitel-4`). Abschnitte and Stationen are addressed by number (`/stadt/inszenierung/kapitel-4/3`, `/rundgaenge/besuch-im-zentrum/3`). Deriving URLs from file paths would force content into folders that mirror URLs, and the Leitthema would be split across eight Viertel folders.

## Decision

Each content type has exactly one URL rule in the content graph, built from resolved relationships and derived numbers:

| Type              | URL                                |
| ----------------- | ---------------------------------- |
| Viertel           | `/stadt/{viertel}`                 |
| Zentrum           | `/stadt/zentrum`                   |
| Kapitel           | `/stadt/{viertel}/kapitel-{n}`     |
| Abschnitt         | `/stadt/{viertel}/kapitel-{n}/{m}` |
| Rundgang          | `/rundgaenge/{rundgang}`           |
| Station           | `/rundgaenge/{rundgang}/{n}`       |
| Thema, Themen-Ort | `/themen/{thema}`                  |
| Aufsatz           | `/bibliothek/aufsaetze/{slug}`     |
| Seite             | its folder path                    |

Files sit where they belong in the domain: Kapitel under their Leitthema, Abschnitte in their Kapitel, Stationen in their Rundgang. Document IDs are paths under `src/content` and never appear in URLs.

## Consequences

- Good: URLs match the Figma navigation model ("Zusammenführung") while each document lives once, next to the things it belongs to.
- Good: Links, Menus, the sitemap and metadata all ask the graph for a URL; no component builds one by hand.
- Bad: The URL can't be read off the file path; you look it up in the graph's rule for that type.
- Bad: Numbered URLs depend on position in `meta.json`. Reordering Viertel, Kapitel content or Stationen changes published URLs, which is accepted because that order is historical. So does publishing a Draft that sits before them in `meta.json`: numbers count only published documents, so a production build has no gaps.

## Considered Options

- File path = URL: simplest, but Kapitel would have to live under Viertel folders, splitting the Leitthema apart.
- `/themen/eine-welt-fuer-morgen/{kapitel}/{abschnitt}` (the earlier IA frame): keeps the Leitthema in one URL tree but disconnects reading from the Viertel the "Zusammenführung" design puts it in.
