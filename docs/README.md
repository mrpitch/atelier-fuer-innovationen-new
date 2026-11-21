# Documentation

This directory uses the [Diataxis](https://diataxis.fr/) framework.

## Quick Links

| Type                        | Purpose                 | Start Here          |
| --------------------------- | ----------------------- | ------------------- |
| [Tutorials](tutorials/)     | Learn by doing          | New contributors    |
| [How-to Guides](how-to/)    | Solve a specific task   | Day-to-day work     |
| [Reference](reference/)     | Look up technical facts | API / config lookup |
| [Explanation](explanation/) | Understand the "why"    | Onboarding, design  |

Architecture decision records live in [adr/](adr/).

## Finding What You Need

- **New here?** Start with [tutorials](tutorials/) and the root [`AGENTS.md`](../AGENTS.md).
- **Need to ship a change?** See [how-to guides](how-to/).
- **Looking up an API, config, or data model?** See [reference](reference/), starting with the [glossary](reference/glossary.md).
- **Want context on architecture or design decisions?** See [explanation](explanation/) and the [ADRs](adr/).

## Contributing

When adding documentation, pick exactly one type. If a doc seems to need two,
split it. Every doc must start with the frontmatter contract (`type`, `title`,
`description`, plus `tags`, `status`, `last_reviewed`) — agents use
`docs find` to find and rank docs, so weak frontmatter makes your doc
harder to find.
