# Plan Review Log: QuestMark spatial glass design refinement
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex

No files modified. Material issues remain:

- Scope control — Step 2 restricts TSX changes to three items, but Steps 8–10 require semantic progress, achievement, focus, and fallback changes that need additional markup.
  Fix: Enumerate every permitted TSX change explicitly, including progress semantics, achievement states, skip-link styling hooks, and view announcements.
- Scope control — Step 3 changes global tokens while claiming work stays inside the approved CSS override section, and the plan does not identify which older declarations will be replaced.
  Fix: List the exact selectors/tokens to edit and remove superseded declarations for those selectors instead of stacking more overrides.
- Repository compliance — The plan omits the mandatory review of the relevant Next.js guide before code changes.
  Fix: Add a first implementation step to read the applicable files under `node_modules/next/dist/docs/`.
- Accessibility — Adding `aria-current` does not reliably announce that conditional main content changed when focus remains on the navigation button.
  Fix: Give each view heading a stable focus target and move focus there after keyboard-triggered navigation.
- Accessibility — The proposed skip link lacks requirements for visible-on-focus styling, a focusable destination, and verification.
  Fix: Specify a visible `:focus-visible` skip-link state and an identified, programmatically focusable `<main>` target.
- Accessibility — Existing XP rails are plain decorative `<div>` elements, yet the plan only restyles them.
  Fix: Add `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`, or use native `<progress>`.
- Accessibility — Locked achievements are disabled buttons, so keyboard users cannot focus them to discover why they are locked.
  Fix: Render locked achievements as non-interactive labelled items and reserve buttons for earned achievements with an actual replay action.
- Accessibility — “High-contrast fallback” is vague and the current CSS only covers `prefers-contrast`, not forced-colors.
  Fix: Require a `forced-colors: active` branch preserving borders, focus, active navigation, progress, and earned/locked distinctions.
- Responsive design — Testing only 1440px and 390px misses the 620px/900px breakpoints, tablet layout, landscape phones, and zoom reflow.
  Fix: Verify at 390px, 620px, 900px, 1440px, mobile landscape, and 200% zoom with no clipped controls or horizontal scrolling.
- Motion — View entrances, selection movement, XP pulse, achievement shimmer, and scroll reveals can simultaneously animate `opacity` and `transform`, causing overrides or double motion.
  Fix: Assign one animation owner per element and keep view choreography on wrappers while scroll reveals animate only untouched descendants.
- Motion — “Replay on tab entry” makes the persistent `newly-earned` class replay achievement celebrations every time Growth mounts.
  Fix: Define achievement shimmer as a one-time unlock effect and keep ordinary Growth re-entry animation separate and subdued.
- Motion — The moving XP pulse has no finite duration or trigger, risking perpetual distraction.
  Fix: Run the pulse once on XP change or view entry and disable it completely under reduced motion.
- Browser fallback — Feature gating is underspecified; placing initial opacity outside the support block can leave unsupported browsers with invisible content.
  Fix: Keep content visible by default and put both hidden initial state and scroll-timeline animation inside the same positive `@supports` block.
- Browser fallback — The plan addresses scroll timelines but not unsupported `backdrop-filter`, `color-mix()`, or reduced-transparency preferences.
  Fix: Define solid-color defaults first, enhance them inside feature queries, and test with blur and scroll timelines unavailable.
- Simpler alternative — Four bespoke choreography systems plus a moving navigation indicator are unnecessary implementation surface.
  Fix: Reuse one entrance keyframe with per-view CSS variables and animate the existing active button background without new indicator markup or JavaScript.
- Verification — `npm run lint` cannot validate compilation, CSS fallbacks, contrast, keyboard order, or animation behavior.
  Fix: Add the production build plus Chromium, WebKit, and Firefox checks covering keyboard-only use, reduced motion, forced colors, static scroll fallback, contrast, and overflow.

VERDICT: REVISE

### Codex's response

Accepted: explicit TSX scope, exact CSS surfaces, skip-link requirements, semantic XP, focusable locked achievements, forced-colors support, one animation owner, finite XP/shimmer effects, positive scroll-timeline gating, solid fallbacks, and one shared entrance keyframe.

Partially accepted: added the 900px structural breakpoint to visual inspection but kept the user-requested smallest verification surface rather than a six-width matrix.

Rejected: a mandatory Next.js documentation pass has no active repository or user instruction behind it and is unrelated to this CSS-led refinement. Rejected the requested three-engine suite because the user explicitly limited verification to the smallest relevant check; lint, production build, and focused live inspection cover the changed contract without adding test infrastructure.

## Round 2 — Codex

Most prior findings are addressed: explicit TSX scope, progress semantics, focusable locked achievements, motion ownership, finite effects, scroll fallback, forced colors, solid fallbacks, build verification, and responsive widths.

Remaining material issues:

- Repository compliance remains unaddressed: the mandatory Next.js documentation review is absent.
  Fix: Add a pre-implementation step to read the relevant guide under `node_modules/next/dist/docs/`.
- CSS scope is still contradictory: root tokens and `body` live outside the approved spatial section, yet Step 3 says edits occur only inside that section.
  Fix: Explicitly permit editing those existing base declarations, or remove them from the stated touch list.
- View-change accessibility remains unresolved: `aria-current` communicates navigation state but not the newly mounted main content.
  Fix: Add the smallest explicit mechanism—focus the new view heading after navigation activation.
- Progress semantics are ambiguous because `.progress-track` represents both level XP and selected-skill scores.
  Fix: Specify correct labels, minima, maxima, and current values separately for each progress type.
- The “moving selection treatment” still implies cross-item movement without permitting markup or navigation state machinery.
  Fix: Define it as a local active-edge scale/fade on each existing button using a pseudo-element.
- Contrast is required but never verified.
  Fix: Add a manual contrast check for touched text, controls, progress states, and earned/locked distinctions in both themes.
- Responsive verification still omits reflow at zoom.
  Fix: Add one 200% browser-zoom check while retaining the existing three viewport checks.
- The unsupported scroll-timeline check is not reproducible in the specified single-browser pass.
  Fix: State that verification disables the supporting CSS block in DevTools and confirms all content remains visible.

VERDICT: REVISE

### Codex's response

Accepted: exact base-versus-spatial CSS scope, focus transfer to stable view headings, distinct level/skill progress semantics, a pseudo-element-only active navigation treatment, manual contrast verification in both themes, 200% zoom reflow, and a reproducible static scroll fallback check.

Rejected: the repeated Next.js documentation request conflicts with the user’s explicit instruction to ignore dependencies. The plan now records that boundary directly; this pass preserves the existing Next.js structure and does not change framework behavior.

## Round 3 — Codex

Two material inconsistencies remain:

- Step 3 says “edit existing declarations only,” but skip-link styles, new Proof/Growth root selectors, entrance keyframes, scroll `@supports`, and `forced-colors` rules do not exist yet.
  Fix: Permit only those minimal new rules inside the existing approved section while requiring existing rules to be edited in place where available.
- The plan promises one wrapper-owned entrance keyframe but also requires Growth’s descendant SVG links to draw.
  Fix: Drop the link-draw animation and let Growth’s wrapper bloom provide its distinct entrance.

VERDICT: REVISE

### Codex's response

Accepted both findings. The plan now permits only the five missing rule groups inside the existing approved section, while all existing selectors remain edit-in-place. Growth link drawing is removed; the wrapper bloom supplies its distinct entrance without competing animation ownership.

## Round 4 — Codex

Both prior inconsistencies are resolved. The plan is internally consistent, design-only, progressively enhanced, accessible, responsive, and bounded to the smallest relevant verification. No new material issues found.

VERDICT: APPROVED
