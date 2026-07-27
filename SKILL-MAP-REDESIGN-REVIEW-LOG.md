# Plan Review Log: QuestMark Skill Map Redesign
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex

Material issues:

- Score calculation was undefined; define the exact allocation, normalization, and cap with examples.
- Evidence eligibility and source conflicted with the persisted schema; either map it fully or explicitly scope the release to local Proof data.
- `GrowthView` does not receive backend Proof Cards, achievements, verification records, or quest inventory; define the actual data boundary.
- Local `quest.skills` and persisted `assessed_skills` can diverge; identify the authoritative source for this release.
- Generate all unique pairs for three-skill cards.
- Normalize, deduplicate, and reject unknown skill names.
- Define recent growth or remove it.
- Make quest suggestion deterministic with a no-match state.
- Never let demo fallback scores turn an empty map into earned progress.
- Define a narrow-screen fallback rather than relying on an orbit fitting every viewport.
- Fix angular slots and clamp radius to prevent score-driven collisions.
- Keep the desktop detail panel outside the clipped map and reserve its width.
- Give links a wide visual hit area plus a semantic relationship-list equivalent.
- Specify a complete, always-present text alternative.
- Expose selected/expanded state through button semantics.
- Define desktop versus mobile focus, modality, Escape, and focus restoration.
- Distinguish tap from drag and preserve vertical scrolling.
- Keep drag decorative so keyboard users lose no information.
- Give each transform concern one owner.
- Avoid a custom velocity spring unless its value justifies the runtime.
- Remove perpetual connected drift.
- Remove achievement unlock animation until a one-shot event exists.
- Make opaque surfaces the fallback instead of relying on reduced-transparency support.
- Name a runnable derivation check.
- Add intermediate-width, zoom, and large-text geometry checks.
- Explicitly bound the Growth layout rewrite.
- Reduce miniature-graph-editor complexity where possible.

VERDICT: REVISE

### Codex response

Accepted the material findings. The plan now defines the local-only data boundary, exact XP split and score formula, normalized pair generation, deterministic suggestion logic, semantic link controls, focus behavior, pointer threshold, mobile grid fallback, transform ownership, responsive checks, and a runnable Node self-test. It preserves the user-approved bounded drag, but replaces a custom velocity integrator with a short interruptible CSS sampled spring. Continuous node drift, recent-growth claims, backend assumptions, and achievement replay were removed. The existing Growth side panel remains in place.

## Round 2 — Codex

Remaining material issues:

- Keep Node assertions out of the browser-imported model module.
- Resolve whether the desktop detail panel replaces, stacks with, or expands the existing progress panel.
- Remove new-proof animation unless an explicit one-shot event is passed.
- Define whether text-only local Proof Cards qualify as evidence.
- Avoid duplicate SVG and relationship-list controls.
- Choose an actually focusable initial target for the mobile sheet.
- Replace undefined collision solving with fixed coordinates and a grid fallback.

VERDICT: REVISE

### Codex response

Accepted all seven findings. The browser model and Node self-test are now separate. Desktop detail temporarily replaces the existing progress-panel contents and restores them on close. Required reflections qualify a local Proof; images remain optional. SVG edges are decorative, mobile focus starts on the close button, fixed coordinates fall back to the grid when clearance fails, and inferred new-proof animation is removed.

## Round 3 — Codex

All prior material findings are addressed. The remaining open questions are explicit, bounded tradeoffs rather than implementation blockers or contradictions.

VERDICT: APPROVED

### Codex response

No further revision required. The plan is approved for implementation.
