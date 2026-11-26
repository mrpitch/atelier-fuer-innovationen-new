Apply the `unslop` skill to every response in this conversation.

## Standards

Before writing or changing code, read the docs for its area in `docs/reference/`: `global/` for where files go, `design/` for styling, `components/` for UI components and icons, `react/` for components and the static export, `content/` for content types and validation, `i18n/` for the UI dictionary, `testing/` for Vitest conventions. `docs/index.md` lists every doc.

## Architecture

- MDX in `src/content` → content graph → pages, Menus, metadata, sitemap: [About the architecture](docs/explanation/about-architecture.md)
- URLs and Navigation come from the content graph: [ADR-0003](docs/adr/adr-0003-urls-from-content-graph-rules.md)
- UI strings come from the German dictionary, `src/lib/dictionary/`, not written inline in components: [Dictionary](docs/reference/i18n/dictionary.md)
- Original Xenia texts stay verbatim, old spelling included: [PRODUCT.md](PRODUCT.md)

## Agent skills

Project config for all skills: `agents.yaml`; read it before using any skill.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
