# Plan: QuestMark Skill Map Redesign
_Locked via grill — by Codex + Ted_

## Goal
Replace the current static skill boxes with an Apple-inspired, evidence-backed network for the existing local QuestMark prototype. Six skills remain visible around a central “You” node; completed local Proof Cards create explainable links between skills. Taps reveal the evidence behind the map, and restrained direct manipulation makes it feel alive without introducing a graph or animation dependency.

## Approach
1. Add one pure skill-map model beside the view and derive it from the existing local `Proof[]`.
   - The canonical vocabulary is exactly: Communication, Observation, Creativity, Leadership, Problem-solving, and Courage.
   - For each Proof Card, normalize `proof.quest.skills` case-insensitively to that vocabulary, remove duplicates, and ignore unknown names.
   - Divide that card’s quest XP equally across its normalized skills. Example: an 80 XP card with Communication and Courage contributes 40 skill XP to each.
   - Skill score is `min(100, round(skillXP / 5))`, so 500 allocated XP reaches 100. A skill with zero eligible proof is “uncharted.”
   - For every card with two or three normalized skills, generate every unique unordered pair. Count the card once for each pair; the count is the link weight.
   - Verification is display metadata only and never changes skill XP, score, or link weight.
   - A locally completed `Proof` is eligible when its two required reflections (`did` and `learned`) are non-empty; its optional image is supporting media, not an eligibility requirement.
   - This release is explicitly local-prototype-only: no Supabase loading, persisted `proof_cards`, assessment status, or verification-record integration.
   - Remove the current static `SKILLS` scores. Never show fallback earned scores when local proof is empty.
2. Replace `GrowthView`’s fixed boxes with one deterministic semantic network.
   - Put “You” at the centre, showing level and current-level XP progress.
   - Give each skill a fixed angular slot. Score only changes prominence and a tightly clamped radius; it never changes angular order.
   - Use fixed, validated coordinates for each angular slot. One `ResizeObserver` checks available clearance; if the orbit cannot preserve the defined gaps, switch to the grid topology.
   - Draw links in one SVG layer behind the HTML button nodes. Stroke width and brightness use discrete weight bands so a single outlier cannot dominate.
   - Keep the existing level/achievement panel as a sibling in `growth-layout`; moving level progress into the centre is additive, not a page restructure.
3. Add constrained direct manipulation using platform features only.
   - Skill nodes are real buttons. Pointer movement below 6 px remains a tap; movement beyond 6 px starts a drag and cancels activation.
   - Capture the pointer only after the threshold. Use `touch-action: pan-y` so vertical page scrolling wins before a deliberate drag begins.
   - While dragging, update CSS custom properties directly on the node instead of setting React state per frame.
   - Apply progressive resistance beyond a 28 px drag radius.
   - On release, retarget the node to its origin from its current rendered position with a short CSS `linear()` sampled spring curve; a new pointer-down immediately cancels that return transition.
   - Dragging is decorative. Every selection and evidence action remains available by tap, click, and keyboard.
   - No free pan, zoom, arbitrary rearrangement, persisted positions, or force simulation.
4. Make selection and relationships fully operable.
   - Activating a skill uses `aria-expanded` and `aria-controls`, dims unrelated nodes, and emphasizes its direct links.
   - Desktop uses the existing `progress-panel` shell: selected detail temporarily replaces its level/achievement contents, and closing restores them. This preserves the two-column layout and keeps achievements one action away. The nonmodal detail receives programmatic focus on open, closes with Escape or its close button, does not trap focus, and returns focus to its trigger.
   - Mobile uses a modal bottom sheet with an inert/backdrop treatment, initial focus on its close button, Escape dismissal, focus containment, and trigger restoration.
   - The panel shows score, allocated skill XP, contributing Proof Cards, connected skills and shared-proof counts.
   - “Recent growth” is omitted because the prototype stores presentation-formatted dates, not reliable timestamps.
   - Quest suggestion is deterministic: first incomplete `QUESTS` item containing that skill; if none exists, omit the section.
   - SVG links are non-interactive decoration. The canonical accessible and pointer control is an always-present, ordered relationship list beneath the graph; each relationship button opens its shared Proof Cards.
   - Relationship ordering is weight descending, then alphabetical; the list remains present when no relationship is selected and explicitly states when none exist.
5. Use a deliberate responsive topology.
   - At 480 px and wider, render the orbit network at fixed validated coordinates with a minimum 104 px node target. If measured clearance is insufficient at any intermediate width or text size, switch to the same grid used on narrow screens.
   - Below 480 px, do not squeeze or overlap the orbit. Render “You” followed by the six skill buttons in a two-column semantic grid, omit decorative SVG edges, and retain all relationships in the structured list.
   - At all widths, the detail surface is outside the map’s clipping context and does not resize or cover the graph.
   - Verify 320 px, 375 px, 768 px, desktop, 200% zoom, and large-text behavior without horizontal scrolling.
6. Apply QuestMark’s restrained visual language.
   - Keep the existing blue palette and assign each skill one restrained spectral accent.
   - Use colour on halos, selected nodes, active links, and evidence pulses instead of filling every surface.
   - Show all six empty skills as faint “uncharted” nodes.
   - Default critical surfaces to opaque. Blur is progressive enhancement and is disabled under `prefers-contrast: more`; unsupported reduced-transparency media queries are not relied upon.
   - Keep achievement cards in their existing panel. Do not add achievement-orbit animation because the current data has no one-shot unlock event.
7. Add purposeful, bounded motion.
   - The centre may use one low-amplitude breathing effect; nodes do not continuously drift.
   - Selection, relationship reveal, drag release, and level change are the noticeable moments. Do not infer or replay a “new Proof Card” event when Growth mounts.
   - One wrapper owns layout position and one inner wrapper owns drag/press feedback so transforms never compete.
   - Pause the centre breathing animation when the document is hidden.
   - Under `prefers-reduced-motion: reduce`, remove breathing, evidence pulses, and spatial sheet movement; use immediate state changes plus opacity/contrast only.
8. Verify with the repository’s existing toolchain.
   - Keep graph derivation in a browser-pure `skill-map-model.ts`. Put Node assertions in a separate `skill-map-model.self-test.ts` and run it with `node --experimental-strip-types <self-test-module>`.
   - The self-test covers XP splitting, all three pairs from a three-skill card, duplicate/unknown filtering, link weights, verification neutrality, and six uncharted nodes for empty proof.
   - Run `npm run lint` and `npm run build`.
   - Browser-check pointer threshold, vertical touch scrolling, immediate interruption of spring return, keyboard activation, Escape/focus restoration, modal focus containment, populated/empty states, reduced motion, and the viewport/zoom matrix above.

## Key decisions & tradeoffs
- This is a local prototype map. Database Proof Cards and assessed skills are deliberately deferred instead of pretending they are already available to `GrowthView`.
- XP is split across demonstrated skills, preventing multi-skill cards from multiplying credit.
- Links are proof-derived and explainable, never decorative or AI-inferred.
- The map is interactive but constrained; platform Pointer Events, CSS and SVG are sufficient for six nodes.
- User-approved dragging remains, but it is decorative and bounded. The semantic buttons and relationship list carry all functionality.
- Deterministic angular slots and a mobile grid take priority over force-directed novelty.
- Peer verification adds a trust marker only.
- Motion is strongest at meaningful events; continuous node drift and unsupported achievement replay are removed.
- The existing Growth side panel remains, limiting the redesign to the map and its detail state.

## Risks / open questions
- The score scale is a prototype rule and will need product validation before connecting assessed backend Proof Cards.
- CSS sampled spring easing does not inherit release velocity. It is the smallest interruptible-enough implementation for a decorative 28 px drag; a velocity-aware runtime is warranted only if usability testing shows the release feels materially wrong.
- `prefers-contrast` support varies, so opaque defaults—not the query—must preserve readability.

## Out of scope
- Supabase data loading, persisted Proof Card status handling, or assessment reconciliation.
- Recent-growth trends until machine-readable completion timestamps exist.
- Free pan and zoom, force simulation, or persisted node positions.
- A third-party graph, gesture, or animation dependency.
- AI-inferred skill links.
- Public skill-map profiles or automatic social sharing.
- Peer verification changing XP, scores, or graph weights.
- Replaying achievement unlocks without an explicit one-shot event.
- Inferring or replaying new-proof arrival animation after Growth mounts.
- Redesigning QuestMark navigation or the non-map Growth content.
