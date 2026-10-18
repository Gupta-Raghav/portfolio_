# Morrow: personal companion frontend

A self-contained, mobile-first companion at `/companion/`, added without changing the portfolio’s React entry point, photography pages, build settings, or production dependencies. Two human users are represented by original male and female SVG avatars. This is an interactive UI prototype, not a connected agent service.

## Preview and production

From the repository root, with Node 20+:

```sh
node tools/companion/serve.cjs
```

Open <http://127.0.0.1:4173/companion/> **on the machine running the server**. The preview server binds only to loopback, serves an explicit allowlist of six static assets, and never exposes repository files. It does not run the rest of the portfolio. The Portfolio link works on the production site, not this focused preview.

The existing Create React App build copies `public/companion/` unchanged to `build/companion/`. On the portfolio’s current deployment, the intended route is `https://portfolio-nine-woad-49.vercel.app/companion/`. That is a deployment target, not a claim that it has been published. A GitHub change must be published through an approved workflow and Vercel must successfully deploy it first. A preview can be public because it contains only synthetic examples and original artwork, never actual private chats or account data.

## Phone access with Tailscale

Run the loopback preview on your personal computer, not just the development machine. Install/sign in to Tailscale on that computer and your phone. Before sharing, restrict tailnet access to the two intended people using your tailnet policy; profile switching in this app is not authorization. Tailscale Serve uses the existing tailnet identity and policy boundary.

After reviewing and authorizing that exposure, use the official [Tailscale Serve guide](https://tailscale.com/kb/1312/serve) and run on the personal computer:

```sh
tailscale serve --bg http://127.0.0.1:4173
tailscale serve status
```

Open the HTTPS device URL printed by Tailscale, with `/companion/` appended. The exact hostname depends on your machine and tailnet, so it must not be invented. Use **Serve, not Funnel**. Do not broaden the local listener to all interfaces. Before adding private backend data, verify that an unauthenticated device and an unauthorized tailnet user cannot access the service. The local development preview has no account authentication, and a Tailscale connection does not make the profile dropdown an authentication system.

To stop sharing, disable the specific Serve listener using the current `tailscale serve --help` instructions. Do not reset unrelated Serve routes. The server itself exits with Ctrl+C. No Tailscale configuration is changed by this repository.

## What works

- Chat: local conversations, history search, per-conversation drafts, keyboard sending on desktop, explicit send button on touch devices, and file-name-only attachment previews. Replies are deterministic, visibly labeled demo content. File contents are never read.
- Artifacts: four original illustrated sample documents, full reading view, categories, search, bookmarking, Markdown download, and editable/deletable personal notes.
- Heartbeat: clearly labeled offline status and three illustrative task timelines, with locally persisted pause/resume preview states. No scheduler or background worker exists.
- Memory: add, edit, filter, pin, and deliberately forget memories. Seed memories are labeled samples.
- Connectors: six application cards and an explicit permission preference sheet. Preferences save locally, but there is no OAuth, token input, linked account, or external request.
- Two people: independently stored chats, notes, memories, bookmarks, permissions, task previews, and drafts. The names are editable in Settings. The avatars represent people, not two agents. There is no sharing between their workspaces.
- Light/evening themes, phone bottom navigation, desktop sidebar and inspiration shelf, keyboard search, reduced-motion support, native modal focus management, data export, and per-person reset with confirmation.

## Design research and provenance

Public materials were inspected rather than copying proprietary code or bypassing sign-in:

- [Muse’s product announcement](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/): conversational entry point, longer-running work, explicit approvals, memory users can correct, and individually scoped connections. These are interaction references, not an assertion about the authenticated product’s exact pixel layout. The Muse web app redirected to authentication; its private UI was not inspected.
- [New Computer / Dot](https://new.computer/): the official site describes its personal, human-centered north star and announces the product’s wind-down. The former live application was not available for hands-on inspection, so no claim of reverse engineering its internals is made.
- [REA](https://github.com/morluto/rea): reviewed its public capabilities and requirements. REA is an inspection toolkit, not the Muse app. It was not installed or run against commercial app binaries. If exact behavioral parity is later wanted, supply an authorized app build or browser session first; keep that investigation separate from this frontend.

The implemented aesthetic is original: warm paper surfaces, forest/sage accents, editorial serif headings, quiet spacing, small tactile controls, original SVG landscape and still-life covers, and two original human avatar illustrations. All fonts use the system stack; there are no trackers, remote images, font CDNs, or third-party runtime libraries.

## Structure and future agent integration

| File | Responsibility |
| --- | --- |
| `public/companion/index.html` | Isolated page shell and restrictive Content Security Policy |
| `public/companion/styles.css` | Responsive layouts, light/dark tokens, safe-area navigation, reduced motion |
| `public/companion/visuals.mjs` | Original inline SVG artwork, avatars, icons, and companion mascot |
| `public/companion/state.mjs` | Seed data, schema validation, bounded storage hydration, explicit demo replies |
| `public/companion/app.mjs` | Rendering, event delegation, browser-only interactions and persistence |
| `tools/companion/serve.cjs` | Loopback-only, allowlisted static preview server |
| `tools/companion/*.test.*` | Pure state tests and browser interaction/responsiveness/accessibility checks |

State is versioned under `morrow.prototype.v1` in localStorage. It is neither encrypted nor synchronized between devices. Both people’s workspaces can be accessed by anyone using this browser. Treat it as a visual demo until backend authentication and per-user authorization are implemented. Storage failures fall back to session-only behavior with a visible warning. Collections and message sizes are bounded; no existing user data is silently evicted to save new data.

Future backend boundaries, intentionally not implemented:

1. **Identity before sync:** bind each workspace to a verified person on the server, not a client-provided profile name. Authorize every conversation, artifact, memory, and connector operation for that person. Preserve the switcher as presentation only unless both accounts have separately authenticated sessions.
2. **Chat transport:** replace `demoReply()` at the submission boundary with a server-mediated message transport. Preserve drafts, add cancel/error/reconnect states and request IDs, and make streamed content text-safe. Never place model or connector credentials in the bundle or localStorage.
3. **Long-running jobs:** heartbeat should consume persisted server events with timestamps, progress, outputs, approval requests, and terminal states. Pausing must be acknowledged by the server before presenting it as real. Browser closure must not terminate an authorized server-side job.
4. **Artifacts:** start with typed document schemas (title, sections, charts, tables, sources) and trusted renderers. Never insert generated HTML into this origin. If executable artifacts are later necessary, isolate them on a separate origin with an appropriately sandboxed iframe and no access to account cookies or parent storage.
5. **Memory:** distinguish user-authored facts from proposed/inferred memories. Require review, expose provenance and deletion controls, and propagate deletions to the backing store.
6. **Connectors:** implement provider OAuth and server-side credential storage, least-privilege scopes, revocation, and action-level approval. The preference controls currently make no such security guarantee.
7. **Release gate:** keep the public portfolio version as a synthetic demo. Put actual private agent data behind verified access controls before enabling any requests; then narrow `connect-src` to the chosen same-origin service. Do not remove the CSP wholesale or broaden listener binds to make integration easier.

## Validation

The browser tooling is isolated so it cannot change the portfolio’s existing dependency tree:

```sh
npm ci
npm run build  # Use the package’s required Node 24.x
npm --prefix tools/companion ci
npm --prefix tools/companion test
cd tools/companion
npx playwright install chromium
npm run test:browser
```

Browser tests start a loopback server if needed and stop only the one they started. They cover interactions, profile separation, reload persistence, untrusted input escaping, blocked localStorage, security headers, zero external runtime requests, accessibility scans, and all five sections at 320, 390, 768, 1024, and 1920px. Screenshots and audit output are in ignored `tools/companion/test-results/`. Automated Chromium emulation is not a substitute for testing an actual iPhone/Android keyboard and Safari; those require the owner’s devices.
