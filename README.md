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

Sandcastle runs `pnpm check` as `sandbox.checkCommand` from `agents.yaml`. CI, in `.github/workflows/ci.yml`, runs `pnpm check` and `pnpm build` on every pull request and every push to `main`. CI reads the Node version from `.nvmrc`. A Node upgrade changes `.nvmrc`, `engines.node` in `package.json` and the `FROM` line in `.sandcastle/Dockerfile` together.

A pull request into `main` merges only when `Check and build` is green. Its branch doesn't have to be up to date with `main` first. Repository admins can still push to `main` directly, and CI checks those pushes after they land. The ruleset "Require CI on main" holds these settings.

The pre-commit hook works on staged files. TypeScript files get `eslint --fix`, then Prettier, then one typecheck of the whole project. Every other file gets Prettier. A lint error or warning ESLint can't fix, or a type error, blocks the commit. `pnpm install` installs the hook in every checkout and worktree, Sandcastle's included.
