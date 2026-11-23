// `server-only` has no real npm package in this repo (content-layer.md,
// docs/explanation/about-architecture.md): Next resolves the bare import
// itself at build time. Vitest has no such special case, so this stub
// stands in for it — aliased in vitest.config.mts — whenever a test imports
// @/lib/content, the one sanctioned way to consume content from outside
// src/lib/content/.
export {}
