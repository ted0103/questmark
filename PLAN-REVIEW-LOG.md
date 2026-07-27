# Plan Review Log: QuestMark

Act 1 paused at the user's requested checkpoint. The current plan records agreed product decisions, while visual direction and the open questions in `PLAN.md` remain unresolved. Act 2 has not started. MAX_ROUNDS=5.

Act 1 resumed and completed. The plan is now locked with the user, including the approved visual system and strict zero-budget prototype boundary. Act 2 begins with MAX_ROUNDS=5.

## Round 1 - Codex

1. **Prototype scope contradicts its moderation requirements:** uploads must be screened, quarantined, appealed, reviewed, and revoked, but the prototype explicitly has no moderation system or human operation.
   Fix: For the prototype, reject media uploads entirely or define a concrete free scanner and named reviewer workflow; defer unsupported quarantine and appeals.

2. **Server-side media validation is infeasible on the chosen architecture:** 25 MB videos, HEIC/MOV decoding, metadata stripping, signature inspection, frame sampling, and scanning cannot safely be assumed to work inside Vercel Hobby functions without a media worker.
   Fix: Prototype with notes/photos and a small browser-produced JPEG/WebP derivative; defer audio/video uploads until the funded worker exists.

3. **Keep original evidence on the device has no storage design:** browser storage can be evicted, exposed on shared devices, exhausted by video, or left behind after logout/account deletion.
   Fix: Specify IndexedDB storage limits, eviction warnings, per-account isolation, logout/deletion cleanup, and explicit export, or do not promise durable local originals.

4. **Travel-time compliance cannot be guaranteed without routing data:** coordinates plus a venue seed list cannot prove walking or transit time.
   Fix: Store manually verified travel zones or describe distance as approximate and ask users to confirm it.

5. **Daily assignment and XP operations lack atomicity and idempotency:** retries, multiple tabs, offline replay, and simultaneous stronger-evidence submissions can create duplicate quests, XP, achievements, or streak credit.
   Fix: Define database uniqueness constraints and one transactional completion operation keyed by user, assignment, and idempotency key.

6. **The evidence rubric is undefined for written-note evidence:** one user-authored statement can count as multiple supposedly independent signals.
   Fix: Give each evidence type a separate deterministic rubric and prevent the same text from satisfying multiple signals.

7. **User-editable skills undermine evidence-based progress.**
   Fix: Limit corrections to template-approved skills, retain assessed skills separately, and calculate progress only from the assessed set.

8. **Public verification identity is internally inconsistent.**
   Fix: Separate an immutable internal card ID from a rotatable hashed bearer token.

9. **Portfolio privacy contradicts verification-page disclosure rules.**
   Fix: Require an active share token for every public status page and make expiry or revocation disable access.

10. **Account deletion does not define dependent-data behavior.**
    Fix: Specify a deletion cascade plus tombstone checks that invalidate tokens and reject later offline replay.

11. **The backup promise exceeds the stated platform guarantees.**
    Fix: Replace it with verified provider retention guarantees or controllable infrastructure.

12. **Consent confirmation is not meaningful protection.**
    Fix: Block sharing of media containing other people unless they are removed or blurred, or explicit consent is tied to that derivative.

13. **Age-track authorization is only a mutable profile field.**
    Fix: Audit cohort changes, invalidate pending assignments, and keep the 16-17 track inaccessible to real prototype participants.

14. **Exactly RM0 conflicts with several operational promises.**
    Fix: State hard per-feature quotas and fail closed when exhausted.

15. **No schema or authorization model is planned despite security-critical sharing.**
    Fix: Add a table and storage inventory with ownership, token hashing, RLS intent, privileged operations, expiry, and deletion rules.

VERDICT: REVISE

### Codex's response

Accepted all 15 findings. The revision removes audio, video, live moderation, human appeals, and public evidence from the zero-budget prototype; limits offline storage to temporary compressed photo derivatives and text; makes travel estimates user-confirmed; defines transactional idempotency, evidence-type rubrics, assessed-skill rules, share-token semantics, deletion cascades, fixed adult-only cohort access, hard free-tier quotas, and the minimum schema and RLS model. The funded product requirements remain specified but are no longer falsely promised by the prototype.

## Round 2 - Codex

All 15 prior findings are substantially addressed. New material problems remain:

1. **RLS permits users to forge progression data:** blanket owner-scoped client writes would let users directly alter completions, Proof Cards, XP, achievements, and tokens.  
   Fix: Make derived and security-sensitive tables client read-only; allow mutations only through narrowly scoped transactional server functions.

2. **Prototype evidence-sharing rules contradict each other:** the prototype never exposes evidence on public pages, but peer-verification pages show user-selected evidence and remain part of its core loop.  
   Fix: Make prototype peer verification mission-summary-only, or explicitly classify token-gated verifier pages as permitted evidence disclosure.

3. **Single-use verifier responses are not atomic:** two concurrent requests using the same valid token can both pass validation before either marks it consumed.  
   Fix: Consume the token and insert its response in one transaction with a unique constraint on the token ID.

4. **Testimonial withdrawal cannot be both configuration-driven and immediately effective:** a testimonial selected in deployed project configuration remains rendered until redeployment.  
   Fix: Gate every testimonial render against a live withdrawal-status record, or promise removal only on deployment.

VERDICT: REVISE

### Codex's response

Accepted all four findings. The plan now limits direct writes to genuinely user-authored fields, reserves progression and token mutations for transactional server functions, makes prototype peer verification mission-summary-only, consumes verification tokens atomically with a unique response constraint, and gates configured testimonials against live consent and withdrawal state.

## Round 3 - Codex

Every prior finding is addressed. Two new material issues remain:

1. **Photo validation still trusts the browser:** clients can bypass derivative generation and upload disguised or metadata-bearing files directly to private storage.  
   Fix: Upload to a temporary private path, validate signature, decoding, and size, then re-encode server-side before promotion—or make the prototype note-only.

2. **The invited-accounts-only boundary lacks enforcement:** public magic-link and Google OAuth flows can create accounts beyond the ten invited testers.  
   Fix: Disable open registration and enforce a server-side email allowlist before provisioning application data or storage access.

VERDICT: REVISE

### Codex's response

Accepted both findings. The prototype now stages photo derivatives in private temporary storage and promotes only a server-decoded, size-checked, metadata-free re-encode. A server-only `pilot_invites` allowlist capped at 10 normalized adult email addresses gates magic links, post-OAuth provisioning, every application policy, and storage access.

## Round 4 - Codex

Every prior finding is addressed. The staged server-validated image flow and server-only invite allowlist close the remaining trust-boundary and access-control gaps. No new material problems found.

VERDICT: APPROVED
