<div align="center">

# QuestMark

**Proof beyond the screen.**

Real-world skill quests that turn action, evidence, and reflection into portable proof of what a student can do.

[Open the installable app](https://ted0103.github.io/questmark/) · [Watch the 20-second walkthrough](./docs/questmark-demo.webm) · [Read the product plan](./PLAN.md)

</div>

[![QuestMark skill world and nearby missions](./docs/questmark-banner.webp)](https://ted0103.github.io/questmark/)

## The idea

Most personal-development products measure activity on a screen. QuestMark sends students into the real world: interview a local founder, notice inaccessible public design, teach a difficult concept, or improve a confusing message.

Every completed quest becomes a private Proof Card that connects concrete evidence and reflection to demonstrated skills. Those cards build a personal skill map and can be deliberately selected for a portfolio.

## Product loop

1. **Discover** — rank short missions from a selected Kuala Lumpur area or device location.
2. **Act** — complete a bounded real-world task with clear evidence and safety guidance.
3. **Reflect** — add one photo and explain what happened and what changed in your thinking.
4. **Prove** — receive XP, a Proof Card, achievements, and an updated skill constellation.

## What the prototype includes

- Three location-aware quests with estimated walking or transit times
- On-device Haversine distance ranking for recognised Kuala Lumpur areas
- JPEG, PNG, or WebP evidence capture with a 5 MB limit
- Structured action and reflection prompts
- Private Proof Cards with explicit portfolio selection and native text sharing
- XP, levels, streaks, achievements, and an evidence-derived skill map
- Light and dark themes, responsive layouts, keyboard-safe dialogs, and reduced-motion support
- Installable PWA behavior with a precached offline app shell
- One-click restoration of the original portfolio demo

## Try it

Open [QuestMark on GitHub Pages](https://ted0103.github.io/questmark/). The public prototype requires no account and stores its state on the current device.

> [!NOTE]
> Install and offline behavior use your browser's native PWA support. Open the app online once so its service worker can cache the exported application before testing it offline.

## Local-first privacy

The deployed prototype has no active backend:

- quest progress, XP, portfolio choices, and reflections use versioned `localStorage` state;
- evidence image blobs stay in IndexedDB;
- location coordinates are used only for on-device ranking;
- Proof Cards are private until the user chooses to share their text or mark them for a portfolio;
- resetting the demo clears only QuestMark's local state and evidence.

> [!IMPORTANT]
> This is a product prototype, not a production assessment system. Travel times are estimates, the quest catalogue is intentionally small, and peer verification is demonstrated rather than authenticated. Accounts, cloud sync, backend AI assessment, production routing, and hosted media storage are not shipped.

## Run locally

```bash
git clone https://github.com/ted0103/questmark.git
cd questmark
npm ci
npm run dev
```

Open `http://localhost:3000`. Local development runs at the root path without registering a service worker.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm test` | Run the recommendation and skill-map model self-tests |
| `npm run lint` | Run ESLint |
| `npm run build` | Create the production static export |
| `npm run test:e2e` | Build the Pages variant and run desktop/mobile Playwright checks |
| `npm run build:pages` | Export the `/questmark` PWA and generate its service worker |

## Architecture

| Area | Source |
| --- | --- |
| Product shell and interaction flow | [`src/app/questmark-app.tsx`](./src/app/questmark-app.tsx) |
| Quest location ranking | [`src/app/quest-recommendations.ts`](./src/app/quest-recommendations.ts) |
| Evidence-derived skill graph | [`src/app/skill-map-model.ts`](./src/app/skill-map-model.ts) |
| Local image persistence | [`src/app/evidence-store.ts`](./src/app/evidence-store.ts) |
| Design tokens, components, and motion | [`src/app/globals.css`](./src/app/globals.css) |
| PWA manifest and worker generation | [`src/app/manifest.ts`](./src/app/manifest.ts), [`scripts/build-service-worker.mjs`](./scripts/build-service-worker.mjs) |
| Optional backend model | [`supabase/migrations/20260727073720_questmark_core.sql`](./supabase/migrations/20260727073720_questmark_core.sql) |

The Supabase clients and row-level-security schema are future-pilot scaffolding. They are not connected to the public local-first experience.

## Quality and deployment

The browser suite verifies quest completion, dialog focus and Escape handling, location reranking, demo restoration, device-local image recovery, and controlled offline reloads on desktop and mobile Chromium.

The [`Deploy QuestMark`](./.github/workflows/pages.yml) workflow installs from the lockfile, runs model tests and linting, builds the `/questmark` export, exercises the exported PWA, and deploys the verified artifact to GitHub Pages.

Product decisions, safety boundaries, and deliberate non-goals live in [`PLAN.md`](./PLAN.md).
