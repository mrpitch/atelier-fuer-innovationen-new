---
type: adr
title: 'ADR-0001: Unprefixed URLs for the default locale'
description: German pages live at unprefixed URLs; any later locale gets a prefix, because German is the site and translations are only prepared.
tags: [adr, i18n, routing, urls]
status: accepted
date: 2026-11-20
---

# ADR-0001: Unprefixed URLs for the default locale

## Context and Problem Statement

The site is German-only, but its structure has to allow translations later. It is a static export with no server and no middleware, so nothing can detect a visitor's language and redirect. Every published URL depends on how the locale shows up in the path, and changing that after launch breaks every link.

## Decision

German, the default locale, has no prefix (`/stadt/kontexte`). A later locale gets a prefix and may use its own slugs (`/en/city/contexts`). German readers shouldn't carry a `/de` segment for translations that don't exist yet.

## Consequences

- Good: German URLs stay short and won't change when a translation is added.
- Good: `/` is the real start page, not a static redirect.
- Bad: Routing has to handle an optional locale segment from day one, so default-locale pages and prefixed pages are generated from the same content.
- Bad: The locale can't be read from the first path segment alone; a missing prefix means the default locale.

## Considered Options

- Prefix every locale (`/de/…`, `/` as a static redirect page): one uniform route tree, but every German URL carries `/de` and the start page becomes a redirect hop.
