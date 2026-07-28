# Plan Review Log: QuestMark installable GitHub release and showcase rebuild
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex

No files modified. Material problems remain:

- Static export will fail: `next.config.ts` defines unsupported `headers()` and `layout.tsx` calls request-time `headers()`. — Fix: Explicitly remove both dynamic-server features before enabling `output: "export"`.
- The plan falsely claims application safeguards can replace `X-Frame-Options`, `Permissions-Policy`, and header-delivered CSP; GitHub Pages offers no equivalent clickjacking protection. — Fix: Document the residual risk, avoid false security claims, and use a meta CSP only for directives it actually supports.
- Base-path handling is underspecified across `next/image`, the manifest, service worker, metadata, and public assets. — Fix: Define one build-time base-path constant and use it for every manually constructed URL while leaving development empty.
- The manifest lacks a stable `id`, explicit `/questmark/` scope, base-path start URL, and maskable icon treatment. — Fix: Specify `id`, `scope`, `start_url`, `purpose`, Apple metadata, and exact icon dimensions in the plan.
- “Offline after the first successful visit” cannot work by merely reusing the current worker: it registers after initial assets load and does not precache hashed Next.js JS/CSS/font files. — Fix: Generate a build-hashed precache list from `out/` and install it atomically before activating the worker.
- The current worker returns cached HTML for any failed request, including scripts and images, causing MIME failures offline. — Fix: Apply the shell fallback only to navigation requests and return asset-specific cache misses normally.
- Immediate `skipWaiting()`, cache deletion, and unversioned activation can strand open tabs referencing old hashed assets. — Fix: Version caches from the build ID and retain the previous complete cache until the replacement precache succeeds.
- Registering the service worker during local development risks persistent stale dev assets. — Fix: Register only in production and document how developers clear any previously installed local worker.
- Proof photos up to 5 MB are base64-encoded into `localStorage`; one image can exceed quota, while repeated photos certainly will. — Fix: Store evidence blobs in IndexedDB or explicitly make photos non-durable and stop promising persistent Proof Cards.
- Persistence assumes valid JSON and a compatible schema; corrupt or older state can crash hydration, and quota/security errors are silently unhandled. — Fix: Add a versioned validator, guarded parse/write operations, migration/reset behavior, and a visible persistence-failure message.
- The existing E2E command uses `next start`, which is not a valid production server for an exported build, and its `/` tests do not exercise `/questmark/`. — Fix: Serve `out/` under an emulated `/questmark/` mount and run the existing interactions plus a controlled offline reload against that output.
- The workflow omits least-privilege permissions, deployment concurrency, environment reporting, and the repository-settings prerequisite for Pages. — Fix: Specify minimal Pages/OIDC permissions, one deployment concurrency group, the Pages environment URL, and an owner preflight for enabling Actions publishing.
- “Verify the public app” has no reproducible acceptance criteria or rollback path. — Fix: Require post-deploy checks for HTML, canonical metadata, manifest fields, icon responses, worker scope/content type, controlled offline reload, and restoration of the prior artifact on failure.
- Portfolio and profile work names no repositories, commits, files, schemas, or commands, so shared-component reuse and “source-backed metadata” cannot be verified. — Fix: Pin each repository and baseline commit, list exact files/data fields, and name its smallest runnable checks before implementation.
- All three PRs may merge before QuestMark is live, temporarily publishing broken links across the portfolio and profile. — Fix: Merge and verify QuestMark first, then gate the portfolio and profile PRs on the confirmed Pages URL.
- Artwork requirements provide ratios but no pixel sizes, encoding budgets, crop fixtures, or approval gate before integration. — Fix: Define exact exports, maximum file sizes, crop previews for every destination, and explicit artwork approval before downstream PRs.
- Sharing failure is currently swallowed, so unsupported clipboard/native-share paths provide no feedback despite the graceful-degradation promise. — Fix: Add an acceptance case requiring a visible fallback with selectable proof text when both APIs fail.

VERDICT: REVISE

### Codex's response

Accepted all material findings. The revision removes the static-export blockers, documents the security-header limitation, defines one base-path source, completes manifest/icon requirements, replaces the worker with an atomic build-hashed precache, limits navigation fallbacks, and avoids local registration. It moves photos to IndexedDB, adds versioned guarded persistence and visible failure feedback, defines exported-build/offline acceptance, adds workflow permissions and rollback, pins all three repositories/files/checks, gates downstream merges on the verified Pages URL, and adds exact artwork sizes, budgets, crop previews, and approval.

## Round 2 — Codex

Most prior findings are addressed. Remaining material issues:

- `themeColor` in Next.js metadata is deprecated; the plan still assigns it to `layout.tsx` metadata. — Fix: Export a static `Viewport` configuration for theme color and keep metadata separate.
- The worker hashes an “inventory,” which may mean filenames only; same-name content changes would reuse a stale cache. — Fix: Hash file contents plus deployed URLs, not merely the file list.
- `public/sw.js` will already exist in `out/` before the generator overwrites it, creating ambiguous/circular precache input. — Fix: Delete `public/sw.js` and explicitly exclude generated `sw.js` from its own precache.
- Filesystem paths from `out/` do not automatically equal GitHub Pages URLs, especially `index.html` versus `/questmark/`. — Fix: Prefix generated URLs with the base path and map `out/index.html` explicitly to `/questmark/`, with an assertion rejecting root-path leaks.
- Existing four-digit random Proof Card IDs can collide; using them as IndexedDB keys can overwrite another photo. — Fix: Use `crypto.randomUUID()` as the storage key and derive any short display label separately.
- IndexedDB and `localStorage` writes are not atomic, allowing orphaned blobs or metadata referencing missing images. — Fix: Define write ordering with rollback and garbage-collect unreferenced blobs after failures or invalid-state resets.
- The offline test does not explicitly prove IndexedDB photo restoration. — Fix: Create a proof with a small image, reload offline, and assert its exact text and image render without console or MIME errors.
- The generated `1200×630` social crop is unused because Step 6 assigns the `1600×900` banner to `public/og.png`. — Fix: Use the social crop for `og.png` and reserve the banner for README/portfolio/profile surfaces.
- A concurrency group without `cancel-in-progress` still permits stale queued deployments. — Fix: Set `cancel-in-progress: true` for the Pages deployment group.
- Pinned downstream baselines can become stale before QuestMark ships, causing isolated worktrees to omit newer changes. — Fix: Compare each baseline with current `origin/main` immediately before work starts and re-inspect touched files if it drifted.

VERDICT: REVISE

### Codex's response

Accepted all findings. The plan now uses static `Viewport`, content-plus-URL cache hashing, no source worker, explicit base-path URL mapping/root-leak assertions, UUID blob keys, ordered persistence with rollback and garbage collection, an offline image-restoration test, the correct social crop, deployment cancellation, and remote-head drift checks before downstream branches.

## Round 3 — Codex

All prior Round 2 findings are addressed. Three new material gaps remain:

- The social crop is specified as WebP but assigned to `public/og.png`; renaming WebP bytes creates a MIME/extension mismatch. — Fix: Export a real PNG or store it as `public/og.webp` and update metadata accordingly.
- The workflow lists tests, lint, and `build:pages` but never invokes the new exported-build/offline browser test. — Fix: Add a required post-build Playwright command that serves the existing `out/` artifact without rebuilding it.
- QuestMark itself lacks the isolated-worktree requirement while its current checkout has dirty `PLAN.md` and review-log changes. — Fix: Create the QuestMark implementation branch in a clean worktree from `07b9234` and leave the planning checkout untouched.

VERDICT: REVISE

### Codex's response

Accepted all three findings. The social crop is now a real PNG with its own budget, the Pages workflow requires a post-build exported-artifact Playwright check without rebuilding, and QuestMark implementation starts in a clean worktree while the planning checkout remains untouched.

## Round 4 — Codex

All prior findings are addressed. The plan is internally consistent, preserves the dirty planning checkout, defines durable persistence and cache behavior, exercises the exported artifact offline, and gates downstream releases correctly. No new material issues found.

VERDICT: APPROVED
