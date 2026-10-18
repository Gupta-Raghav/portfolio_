# Cocoa: a personal space for two

A mobile-first companion at `/companion/`, with a desktop sidebar, phone bottom navigation, original illustrated artifact covers, light/evening themes, and Milk/Mocha bear avatars. Raghav uses Milk; Ananya uses Mocha. The bears represent the two people, not two agents. Agent replies, task progress, and connector cards remain explicitly labeled previews.

**Current status:** Production Google OAuth settings and two distinct private Vercel Blob stores are configured. Both stores were tested to reject anonymous requests and the other store's credential before receiving any user content. See [Cocoa setup and account isolation](cocoa-setup.md) for configuration and the real-account acceptance checks the owners should perform. Missing configuration still fails closed rather than falling back to the former public demo.

## Current architecture

- The public HTML, CSS, and JavaScript contain no user content or credentials.
- `bootstrap.mjs` checks the protected session endpoint, then loads only the authenticated person's workspace. Without a valid session it shows the Cocoa sign-in page.
- Google OpenID Connect is implemented using pinned Auth.js, including state, nonce, PKCE, CSRF validation, encrypted session cookies, and exact server-side verification of the two approved accounts.
- `api/cocoa.mjs` is a Vercel Node adapter. Narrow rewrites in `vercel.json` route only Cocoa's API paths; the existing portfolio and photography routes are unchanged.
- `server/cocoa/auth.mjs` verifies identity and authorization. `handler.mjs` checks every read and write. `store.mjs` selects a separate private Blob credential for each person and derives document paths from the verified Google subject.
- The UI does not select an owner. Account switching requires sign-out and a new Google authentication. A stale tab includes its expected identity on workspace requests, so changing browser sessions cannot redirect its writes into the other person's store.
- Workspace contents are never persisted in localStorage or sessionStorage. Private writes are debounced and serialized; conditional ETags prevent stale overwrite. Failed saves show a warning and remain exportable from the current tab.
- No Google access tokens, Blob URLs, storage tokens, email allowlists, or secrets are returned to the frontend. The browser requests only same-origin session and workspace endpoints. Google is reached by top-level navigation during sign-in.

## Features

Chat has conversations, searchable history, drafts, desktop keyboard sending, explicit touch sending, and file-name-only attachment previews. The artifact library includes four illustrated examples, filters, search, bookmarks, document reading, Markdown export, and editable notes. Heartbeat has three explicitly illustrative long-running-task scenarios. Memories support add/edit/search/pin/delete. Six connector cards let each person record permission preferences but do not connect any accounts. Google **sign-in** is separate from future connector OAuth.

Names and preferences belong to the signed-in person's workspace. The other person's data and settings never appear in that session. Exports are intentional downloads of the current person's data only; keep downloaded files private on shared devices.

## Design research

- [Muse product announcement](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/): conversational goals, long-running work, explicit approvals, editable memories, and scoped connectors. The authenticated product UI was not accessible, so this is interaction inspiration, not pixel-perfect reverse engineering.
- [New Computer / Dot](https://new.computer/): personal, human-centered computing. The official site announced the product's wind-down; its former live application was not inspected.
- [REA](https://github.com/morluto/rea): reviewed the public toolkit capabilities. It was not installed or used against commercial binaries. Exact behavioral inspection would need an authorized app build or browser session.
- [Milk and Mocha official store](https://milkmochabear.com/): visual reference for the white and brown bear avatar renditions. These are hand-drawn SVG renditions, not official licensed assets or an endorsement. No remote character images are loaded at runtime.

The surrounding aesthetic is original: paper surfaces, sage and cocoa-adjacent warm accents, editorial serif headings, quiet spacing, and original SVG landscape/still-life artwork. All fonts use the system stack and there are no analytics scripts or remote image/font dependencies.

## Running and testing

Use the package's required Node 24.x:

```sh
npm ci
node --env-file-if-exists=.env.local tools/companion/serve.cjs
```

The local URL is <http://127.0.0.1:4173/companion/>. Without OAuth configuration it intentionally shows a disabled sign-in screen. The preview server listens only on loopback, serves an explicit static allowlist and Cocoa's API, and never serves repository files. It does not serve the portfolio root.

```sh
npm --prefix tools/companion ci
node --test tools/companion/state.test.mjs tools/companion/auth.test.mjs
npm --prefix tools/companion run test:browser
npm run build
```

Browser checks use browser-only HTTP mocks, not a deployed authentication bypass. They cover the interface at five sizes, persistence through mocked private APIs, isolated account fixtures, inaccessible account switching, stale-tab identity changes, zero browser persistence, untrusted text, logout, failure states, and automated WCAG A/AA checks. Backend tests independently exercise real Auth.js encrypted test sessions, allowlist checks, forged/expired session denial, cross-owner attempts, cross-site write rejection, revision conflicts, and missing configuration. Live Google, Vercel private stores, Safari/mobile keyboards, and the production callback need the owner's setup and real-device checks described in `cocoa-setup.md`.

## Tailscale and future agents

The hosting target remains `https://portfolio-nine-woad-49.vercel.app/companion/`; a new authenticated deployment must be explicitly approved and verified. No automatic publishing occurs from these scripts.

For personal-machine access, keep the local listener on loopback and use [Tailscale Serve](https://tailscale.com/kb/1312/serve), not Funnel. Restrict the tailnet to the two intended people before sharing. Configure `AUTH_URL` and Google's authorized redirect URI for the actual HTTPS device hostname; do not invent a tailnet URL or bypass Google because a request arrived over Tailscale. No Tailscale configuration is changed by this repository.

Future agents must inherit the verified owner identity on the server. Use separate runtime directories/containers or stronger isolation, secrets, connector tokens, job streams, and artifact paths per account. Never accept an owner identifier from an agent-generated payload or browser selector as authorization. Executable artifacts must live in sandboxed, separate-origin contexts, not arbitrary HTML inserted into this app. Sensitive real-world actions require explicit approval from the owning person. The current deployment runs no agents and does not yet provide separate VMs.

## Legacy prototype data

The older public demo used `morrow.prototype.v1` in localStorage. The key remains in legacy schema tests but authenticated Cocoa never loads or imports it. It is not silently deleted. If it contains private information, its owner should export or remove it on the original browser before sharing that browser. New authenticated workspaces start separately; there is no ambiguous cross-account migration of shared demo history.
