# Plan: QuestMark installable GitHub release and showcase rebuild
_Locked via grill — by Codex + Ted_

## Goal
Publish QuestMark as a zero-budget, account-free, installable PWA at `https://ted0103.github.io/questmark/`, then rebuild its portfolio and GitHub-profile presentation so it matches Celestial Archive’s established hierarchy. Replace the portrait screenshot that currently breaks the shared portfolio frame with approved coordinated banner and poster artwork, keep QuestMark first as the newest featured system, and link every public surface to the verified GitHub Pages app and source repository.

## Approach
1. **Create and approve coordinated QuestMark artwork before integration.**
   - Use the approved liquid-glass globe and mission interface as source direction; generate no unrelated assets.
   - Produce a `1600×900` WebP banner (maximum `400 KB`), a `1200×1500` WebP poster (maximum `500 KB`), and a real `1200×630` PNG social crop (maximum `900 KB`).
   - Keep the globe and mission card inside the centre safe area, omit baked-in text, and preview the banner in the portfolio card, portfolio hero, and profile widths plus the poster in the case-study/README width.
   - Present the final crop sheet to Ted; integrate only the approved artwork. Use meaningful alt text wherever an asset is informative.

2. **Create a clean QuestMark implementation worktree, then remove the real static-export blockers in `ted0103/questmark` at baseline `07b9234`.**
   - Leave the current planning checkout and its dirty `PLAN.md`/`PLAN-REVIEW-LOG.md` untouched. Create an isolated implementation branch/worktree from `07b9234`, then bring the approved plan/log into that branch as explicit deliverables before code changes.
   - In `next.config.ts`, enable `output: "export"`, use `NEXT_PUBLIC_BASE_PATH` as the single build-time path source, and remove `headers()` because GitHub Pages cannot apply Next.js response headers.
   - In `src/app/layout.tsx`, replace request-time `headers()` metadata with static canonical metadata for `https://ted0103.github.io/questmark/`, declare the manifest, Apple web-app metadata, social image, and canonical URL. Export a separate static Next.js `Viewport` configuration for theme colour.
   - Document that GitHub Pages cannot reproduce `X-Frame-Options`, `Permissions-Policy`, or header CSP. Do not claim a meta CSP replaces unsupported header directives; add only meta-compatible restrictions if they do not break the export.
   - Add one tiny `src/app/base-path.ts` helper backed by `NEXT_PUBLIC_BASE_PATH` for manually constructed app URLs. Reuse it for public images, share URLs, manifest values, and service-worker registration; local development uses an empty path.

3. **Make the existing PWA install-grade and safely offline.**
   - Update `src/app/manifest.ts` with stable `id`, `/questmark/` scope/start URL, `display: standalone`, exact icon dimensions, and separate `any`/`maskable` purposes.
   - Derive `192×192`, `512×512`, maskable `512×512`, and Apple `180×180` PNG icons from the existing QuestMark mark with safe padding; do not redesign the logo.
   - Register the worker only in production and at the base-path scope; local development never installs it.
   - Delete the source `public/sw.js`. Replace it with `scripts/build-service-worker.mjs`, run after static export. The script hashes each file’s contents plus its deployed URL into the cache name, excludes generated `sw.js` from its own input, and emits `out/sw.js` with the complete app-shell/hashed JS/CSS/font/image list.
   - Prefix every generated URL with `/questmark`, map `out/index.html` explicitly to `/questmark/`, and fail the build if a generated URL leaks to the origin root.
   - Let installation fail atomically if precaching fails. Do not call `skipWaiting()`; the new worker activates only after old controlled tabs close, then removes obsolete QuestMark caches.
   - Use cached responses for exported assets and apply the app-shell fallback only to navigation requests so missing scripts/images never receive HTML.
   - Verify that the first online load installs the worker and a later controlled offline reload restores the app shell, bundled quests, saved progress, Proof Cards, achievements, and skill map.

4. **Make device-local persistence honest and durable enough for photos.**
   - Keep versioned, validated metadata in `localStorage`; guard parse/write operations and reset invalid legacy/corrupt state instead of crashing hydration.
   - Move user-selected evidence image blobs to a small native IndexedDB store keyed by `crypto.randomUUID()`; keep only the storage key in serialized metadata and derive any short human-readable Proof Card label separately.
   - Write the blob first, then commit metadata; delete the blob if metadata persistence fails. On invalid-state reset and startup maintenance, remove unreferenced blobs and clear metadata references whose blobs are missing.
   - Handle quota/security/write failures with a visible message and preserve the completed text reflection even when an image cannot be stored.
   - Revoke temporary object URLs and delete associated blobs when the demo is reset. Add no sync, account, server upload, or dependency.
   - When native share and clipboard both fail, show selectable proof text and a clear manual-copy message rather than silently doing nothing.

5. **Add the smallest GitHub Pages workflow and exported-build verification.**
   - Add `.github/workflows/pages.yml` using locked install, `npm test`, `npm run lint`, `npm run build:pages`, and a required post-build `npm run test:pages`; `build:pages` exports with `NEXT_PUBLIC_BASE_PATH=/questmark` and generates the worker, while `test:pages` serves that existing `out/` artifact without rebuilding it.
   - Use minimal `contents: read`, `pages: write`, and `id-token: write` permissions, a Pages environment URL, and one deployment concurrency group with `cancel-in-progress: true`.
   - Before merging, confirm repository Pages source is GitHub Actions. Upload `out/` with the official Pages artifact/deploy actions.
   - Extend the existing focused browser test path only as needed to serve `out/` under an emulated `/questmark/` mount and verify core interaction plus one controlled offline reload; create a proof with a small image, then assert its exact text and image restore offline without console or MIME errors. Add no test framework or dependency.
   - After deploy, require HTTP success for `/questmark/`, canonical metadata, manifest, all icons, and worker; verify worker content type/scope, no root-path asset leaks, one installability check, one offline reload, and browser console cleanliness.
   - Roll back by reverting the QuestMark merge and redeploying the prior known-good commit if public acceptance fails.

6. **Update QuestMark’s repository presentation after artwork approval.**
   - Add the approved banner and poster under `docs/`; use the `1200×630` social crop for `public/og.png`, the banner for the README header, and the poster in the README body.
   - Make GitHub Pages the primary live/installable link. Keep source/local-development instructions accurate and remove the ChatGPT-hosted demo from primary calls to action.

7. **Repair `ted0103/ted0103.github.io` from baseline `785f3a8` only after QuestMark is live.**
   - Before branching, compare baseline `785f3a8` with current `origin/main`; if it drifted, branch from the current remote head and re-inspect every touched file. Work in an isolated worktree and touch only `src/config/site.ts`, `src/content/projects/questmark.md`, `src/content/sources.md`, `src/data/github-snapshot.json`, QuestMark files under `public/projects/`, and `src/styles/global.css` only if existing prose-image rules cannot display the poster correctly.
   - Reuse `ProjectCard.astro`, `ProjectVisual.astro`, and `pages/projects/[slug].astro`; add no QuestMark-only layout component.
   - Replace the `1066×1475` portrait currently forced into the shared landscape frame with the approved `1600×900` banner. Add the poster to the existing Markdown case-study body.
   - Point `liveUrl` and snapshot homepage to the verified Pages URL, set status to `Installable PWA`, keep QuestMark order `1` and Celestial Archive immediately after it, and retain source-backed claims only.
   - Run `npm run check` and inspect the QuestMark card/detail at desktop and mobile widths for crop, hierarchy, focus, overflow, and readable long copy.

8. **Unify `ted0103/ted0103` from baseline `b0d23a3` only after QuestMark is live.**
   - Before branching, compare baseline `b0d23a3` with current `origin/main`; if it drifted, branch from the current remote head and re-inspect `README.md` and profile assets. Work in an isolated worktree and touch only `README.md` plus the approved QuestMark banner under `assets/profile/`.
   - Rename `FEATURED SYSTEM` to `FEATURED SYSTEMS`, place QuestMark first with its banner/live/source links, then retain Celestial Archive with matching full-width treatment and equal hierarchy.
   - Link the primary QuestMark action directly to GitHub Pages. Validate `git diff --check`, GitHub Markdown rendering, image responses, and all public links.

9. **Apply current Web Interface Guidelines only to touched surfaces.**
   - Preserve semantic links, heading order, explicit image dimensions where HTML controls them, descriptive alt text, visible focus, reduced motion, long-copy wrapping, mobile reflow, and explicit hover/focus states.
   - Avoid new navigation state, `transition: all`, disabled zoom, unlabeled controls, unsupported security claims, and layout-specific duplication.

10. **Release in dependency order through reviewable PRs.**
   - Open and merge the QuestMark PR first; wait for Pages deployment and all public acceptance checks.
   - Only then open portfolio and profile PRs pointing to the confirmed URL. Merge after their smallest checks pass and verify the live card, case study, profile banners, and links.
   - Preserve unrelated dirty worktrees and files throughout.

## Key decisions & tradeoffs
- GitHub Pages PWA is the canonical install surface; no APK, desktop installer, app store package, or custom install button.
- The prototype is account-free and device-local. IndexedDB adds a small native persistence layer for image blobs but avoids quota-heavy base64 photos and any paid backend.
- Offline support covers the complete exported app shell and saved local progress. Network-dependent location/share behavior degrades with explicit feedback.
- GitHub Pages cannot reproduce the old response security headers; the release documents that residual hosting limitation instead of claiming an application-level equivalent.
- QuestMark and Celestial Archive share one featured-system hierarchy. QuestMark leads because it is newest, not because Celestial Archive is demoted.
- The shared portfolio layout stays unchanged unless its existing prose media rule cannot render the approved poster. Correctly proportioned media fixes the observed layout defect with less code.
- The artwork integration has one explicit approval gate; downstream code does not guess at crops.

## Risks / open questions
- iOS installation remains the browser’s native Add to Home Screen flow; there is intentionally no in-app prompt.
- Existing state cannot migrate automatically between the ChatGPT origin and GitHub Pages. Corrupt/legacy Pages state resets with a visible notice.
- The first offline launch is not promised before a successful online load and completed service-worker installation.
- GitHub Pages remains frameable because it cannot emit `X-Frame-Options` or CSP `frame-ancestors`; no sensitive authenticated state exists in this prototype.

## Out of scope
- Accounts, Supabase activation, cloud sync, backend AI assessment, paid services, APK/desktop binaries, app-store distribution, a custom install tutorial, changes to Celestial Archive itself, a portfolio redesign beyond QuestMark’s media/content defect, new dependencies, generated assets beyond the approved QuestMark banner/poster/icons, and unrelated workspace files.
