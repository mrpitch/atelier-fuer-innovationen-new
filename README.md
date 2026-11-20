# atelier-fuer-innovationen-new

Next.js rebuild of [atelier-fuer-innovationen](https://github.com/mrpitch/atelier-fuer-innovationen). The original stays live until this one replaces it.

## Checks

| Command             | What it does                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| `pnpm check`        | Runs `format:check`, `lint` and `typecheck`, in that order. Run it before a PR. |
| `pnpm format`       | Rewrites files in the house style with Prettier and sorts Tailwind classes.     |
| `pnpm format:check` | Lists the files `pnpm format` would change. Writes nothing.                     |
| `pnpm lint`         | Runs ESLint. Any warning fails it.                                              |
| `pnpm typecheck`    | Generates the Next.js route types, then runs `tsc --noEmit`.                    |

Sandcastle runs `pnpm check` as `sandbox.checkCommand` from `agents.yaml`, and CI runs it on every pull request.

The pre-commit hook works on staged files. TypeScript files get `eslint --fix`, then Prettier, then one typecheck of the whole project. Every other file gets Prettier. A lint error ESLint can't fix, or a type error, blocks the commit. `pnpm install` installs the hook in every checkout and worktree, Sandcastle's included.
