# Can a Sandcastle sandbox check visual fidelity?

Research for #62 (map #61). Checked on 2026-11-23 against `origin/main` of this repo,
the Home runner `~/Dev/home/tools/sandcastle` and `@ai-hero/sandcastle` 0.12.0.

## Answer

| Question | Answer |
| --- | --- |
| Figma MCP or REST from inside the container? | **Not today.** The network is open, but the container has no Figma credential and no MCP server configured. The REST API works once a `FIGMA_TOKEN` key is added to `.sandcastle/.env`. The Figma MCP does not: it needs an interactive OAuth sign-in. |
| Playwright screenshots at 1440/1024/768/390? | **Yes.** The image ships headless Chromium at the revision the repo's `playwright-core` expects. A four-width screenshot run worked inside the built image as the `agent` user. Nothing in the image serves `out/`, so the agent needs a one-line static server. |
| `SHADCNDESIGN_LICENSE_KEY` in the container? | **No.** The key is not in `.sandcastle/.env`, and Sandcastle forwards only the keys listed in that file. |

## 1. Figma from inside the container

### Network

Sandcastle starts the container with `docker run -d --name … <env> <volumes> [--network …]`.
`--network` is added only when the sandbox options set `network`
(`node_modules/@ai-hero/sandcastle/dist/chunk-CP3TYXZA.js`, lines 82–103). The runner's
`docker({ imageName, mounts, env })` call does not set it
(`run-sandcastle.ts`, `buildDockerSandbox`), so the container sits on Docker's default
bridge with outbound internet.

Run against the built image `sandcastle:atelier-fuer-innovationen-new`:

```text
curl https://api.figma.com/v1/me        -> 401   (reachable, no token)
curl -X POST https://mcp.figma.com/mcp  -> 400   (reachable)
```

### Credentials

- Sandcastle's `resolveEnv` reads `<repo>/.sandcastle/.env` and forwards **only the keys
  listed there**. A listed key's value can come from the file or from the host
  environment (`dist/index.js`, lines 595–638). The runner adds the same keys from the
  main checkout's file when it runs in a linked worktree (`mainCheckoutContainerEnv`),
  plus `IMPECCABLE_NO_TELEMETRY` and the pnpm store path.
- `.sandcastle/.env` currently has one key: `CLAUDE_CODE_OAUTH_TOKEN`. It has no Figma
  key. Inside the image, `env | grep -ci 'figma|shadcn'` returns `0`.

### MCP

- Claude Code inside runs as
  `claude --print --verbose --dangerously-skip-permissions --output-format stream-json --model claude-sonnet-5 -p -`
  (`dist/index.js`, `claudeCode.buildPrintCommand`). The runner passes no `--mcp-config`.
- The repo has no `.mcp.json`. Commit `97f67a7` removed the Playwright one. The
  container's `~/.claude.json` is the runner's trust-only seed (`ensureClaudeJsonSeed`).
- With the real `CLAUDE_CODE_OAUTH_TOKEN` and that seed, `claude mcp list` inside the
  image prints `No MCP servers configured.` claude.ai connectors (such as Figma on the
  host) do not come through a `claude setup-token` token.
- Figma's remote MCP server (`https://mcp.figma.com/mcp`) signs in through a browser:
  "select **Authenticate** … click **Allow access**". The installation docs mention no
  personal access token or headless mode, and only clients in Figma's catalog may
  connect ([remote server installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)).
  The desktop MCP server listens on the host's localhost and needs the Figma app, so the
  container cannot use it either. **An AFK run cannot use the Figma MCP.**

### REST API (viable with one key)

- `GET /v1/images/:key?ids=<node ids>&format=png&scale=2` renders nodes to PNG. Returned
  URLs expire after 30 days, renders are capped at 32 megapixels, and the endpoint needs
  the `file_content:read` scope. `GET /v1/files/:key/nodes?ids=…` returns the node JSON
  (layout, fills, text) ([file endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/)).
- Personal access tokens are sent in the `X-Figma-Token` header, and their scopes are
  chosen when the token is created
  ([authentication](https://developers.figma.com/docs/rest-api/authentication/)).
- Rate limits: both endpoints are Tier 1. A Dev/Full seat gets 10/min on Starter and
  15/min on Professional. **A View/Collab seat gets "up to 20/month"**
  ([rate limits](https://developers.figma.com/docs/rest-api/rate-limits/)). The token must
  belong to a Dev or Full seat, or one epic exhausts it.
- Not proven: an end-to-end call with a real token. Minimal experiment: add
  `FIGMA_TOKEN=<PAT with file_content:read>` to `.sandcastle/.env`, then
  `docker run --rm --env-file <file with only that key> --entrypoint sh sandcastle:atelier-fuer-innovationen-new -c 'curl -s -H "X-Figma-Token: $FIGMA_TOKEN" "https://api.figma.com/v1/images/ms4MqN4CJhsLTMTKqTSC8p?ids=36617:15021&format=png&scale=1" | jq .'`
  The call should return an `images` map with an S3 URL.

## 2. Playwright against the static build

### What the image has

`.sandcastle/Dockerfile` (base `node:24-bookworm-slim`):

```dockerfile
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx --yes playwright install --with-deps chromium \
  && chmod -R o+rx /ms-playwright
```

Inside the built image:

- `/ms-playwright` holds `chromium-1255`, `chromium_headless_shell-1255` and `ffmpeg-1013`.
- The repo's `@playwright/mcp` 0.0.86 depends on `playwright-core@1.66.0-alpha-2026-11-18`,
  whose `browsers.json` pins Chromium revision `1255`. The revisions match.
- `node_modules/.bin/playwright-mcp` exists. pnpm does not hoist `playwright`, so the
  `playwright` CLI and test runner are not on the path.
- The image has no `python3` and no `serve`.

### Proof run

As the `agent` user in the built image, a Node script that loads `playwright-core` from
`node_modules/.pnpm/playwright-core@1.66.0-alpha-2026-11-18/…` launched headless
Chromium. It wrote full-page PNGs at widths 1440, 1024, 768 and 390.

### Caveats

1. **Version drift.** `npx --yes playwright install` installs the *latest* Playwright's
   browser at image build time, not the repo's version. The revisions match today by
   coincidence. Fix: add `playwright` as a devDependency, then in the Dockerfile run
   `pnpm exec playwright install --with-deps chromium` as root after `pnpm install`, so
   the browser follows the lockfile. `/ms-playwright` is
   read-only for `agent`, so a runtime install would need
   `PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright` and a download.
2. **No MCP wiring.** `prompts/efficiency-rules.md` in the Home runner says
   "`playwright-mcp` is bundled inside this container". The binary is there, but since
   `97f67a7` no `.mcp.json` registers it, so the agent has no `browser_*` tools. Either
   restore `.mcp.json` (`playwright-mcp --headless`) or let tickets screenshot through a
   committed script (recommended: deterministic, reviewable, no MCP round trips).
3. **Serving `out/`.** `next.config.ts` sets `output: 'export'`, so `next start` does not
   apply. The agent needs a static server, for example a ~15-line `node:http` script in
   `scripts/` or `pnpm dlx serve out` (that one uses the network). `file://` breaks
   absolute asset paths.
4. **Fonts.** `src/lib/styles/fonts/kartei.ts` uses `next/font/google`, which downloads
   at build time (the network is open) and self-hosts the fonts in `out/`. Screenshots
   therefore render the real typefaces offline.
5. **Not proven:** a full `pnpm build` plus served screenshots of a real page in the
   container. Minimal experiment: run `pnpm build`, start a static server on `out/`,
   then run the same Playwright script against `http://localhost:<port>/` at the four
   widths.

A screenshot alone does not check fidelity. The agent (Sonnet, multimodal) can read both
PNGs and compare them, but that is a judgement call. A pixel diff against Figma renders
will not pass, because Figma exports have no real content or font hinting. Use
screenshots as evidence for the review pass and for a human, not as a hard gate.

## 3. `SHADCNDESIGN_LICENSE_KEY`

- `agents.yaml`: `shadcn.licenseEnvVar: SHADCNDESIGN_LICENSE_KEY`. `components.json`
  sends it as the `X-License-Key` header for the `@shadcndesign` registry.
- `.sandcastle/.env.example` lists it commented out ("Needed only when an afk run installs
  a Pro Block"). The real `.sandcastle/.env` does not list it, so `resolveEnv` never
  forwards it, even when the host shell has it set.
- Fix: add `SHADCNDESIGN_LICENSE_KEY=<key>` to `.sandcastle/.env`. A bare
  `SHADCNDESIGN_LICENSE_KEY=` line is not enough unless the host shell exports the key
  when `sandcastle-run` starts.
- Not proven: `shadcn add @shadcndesign/<block>` inside the container. The registry host
  is reachable on the open network, so the key is the only blocker.

## What an implementation ticket must embed

As long as Figma is unreachable from the sandbox (no `FIGMA_TOKEN`), the ticket is the
agent's only view of the design:

- **Node IDs and a deep link** per screen and per component (file
  `ms4MqN4CJhsLTMTKqTSC8p`, for example `node-id=36617-15021`), so the reviewer and a
  human can trace the design.
- **Exported PNGs** of each target frame at every breakpoint the design defines (where
  Figma has only desktop and mobile frames, say which widths are interpolated), at
  `scale=1` so 1 px = 1 CSS px. Commit them under the ticket's spec folder (for example
  `docs/specs/<epic>/figma/<node-id>@<width>.png`), because GitHub attachment URLs need
  a login and `/v1/images` URLs expire after 30 days.
- **Extracted specs that a PNG does not carry:** the Kartei token for each colour and
  spacing value (DESIGN.md / `variables-kartei.css` names, not hex), type styles, and the
  auto-layout direction, gap and padding. A human session with the Figma MCP
  (`get_design_context`, `get_variable_defs`) can extract these when writing the ticket.
- **Kit and Pro Block names** used in the frame, so the agent installs rather than rebuilds.
- **Verification steps:** `pnpm build`, serve `out/`, screenshot the routes at
  1440/1024/768/390, attach the PNGs to the run output, and compare them against the
  embedded exports. Layout and composition must match; small text and rendering
  differences are expected.

## Recommended setup changes (for the map, not done here)

1. Add `FIGMA_TOKEN` (PAT, `file_content:read`, Dev/Full seat) and
   `SHADCNDESIGN_LICENSE_KEY` to `.sandcastle/.env` and `.env.example`. Then the agent
   can fetch node PNGs and JSON itself, and tickets need only node IDs.
2. Pin the Chromium install to the repo's Playwright version (caveat 1).
3. Add a `scripts/screenshot.mts` (static server plus Playwright at the four widths) and
   either drop the stale `playwright-mcp` claim from `prompts/efficiency-rules.md` or
   restore `.mcp.json`.
