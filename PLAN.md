# Plan: QuestMark
_Locked via grill - by Codex + user_

## Goal

Build QuestMark as an English-language progressive web app for two youth cohorts: upper-secondary students aged 16-17 and university, college, gap-year, or early-career users aged 18-24. The app gives users personalized daily real-world quests and turns private completion evidence into useful Proof Cards, a six-skill growth map, achievements, and exportable application portfolios. The product should move users away from passive screen time and reward demonstrated experience rather than unsupported skill claims.

## Approach

1. **Create one product with two age-aware quest tracks.**
   - Launch the MVP and first validation pilot in Malaysia only.
   - Ages 16-17 receive quests suited to school, home, cafés, libraries, shops, and other public places.
   - Ages 18-24 receive more independent quests suited to university, work, leadership, and career preparation.
   - Exclude private or isolated places from location-based recommendations.
   - Keep English as the only MVP language.

2. **Deliver three personalized quests each day.**
   - Offer easy, medium, and bold choices.
   - Personalize from interests, growth goals, comfort level, age group, transport access, accessibility needs, preferred duration, available time, budget, and the choice to stay home or go out.
   - Ask for location when generating daily quests and recommend exact nearby public venues.
   - Ask for travel mode and maximum travel time each day. Default to 15 minutes walking for ages 16-17 and 30 minutes by walking or public transport for ages 18-24.
   - In the funded product, use routing data to enforce the selected travel-time limit. In the zero-budget prototype, label seeded travel times as approximate and require the user to confirm suitability before accepting the quest.
   - If no suitable, plausibly open venue is available, replace the location quest with a safe home-based mission. Never invent a venue or stretch the user's limit.
   - Use precise coordinates only for that request, then discard them. Retain only the selected venue and coarse city with the quest record.
   - Let users replace any unsuitable quest immediately.

3. **Constrain quest generation for quality and safety.**
   - Start from 120 human-reviewed quest templates: 40 shared, 40 for ages 16-17, and 40 for ages 18-24.
   - Give each template easy, medium, and bold adaptations rather than storing 360 separate quests.
   - Require every template to define its cohort, allowed venue types, safety restrictions, estimated time, budget, travel needs, accessibility notes, target skills, accepted evidence types, consent warning, and reflection prompts.
   - Provide an accessibility-equivalent alternative for every quest. It must exercise the same target skill, award the same XP, and never be labeled as a lesser version.
   - Let AI adapt wording, difficulty, venue, and reflection prompts instead of inventing unrestricted missions.
   - For ages 16-17, exclude private property, isolated settings, unsafe stranger contact, personal-information sharing, and recording without consent.
   - Show a brief safety note on every quest.
   - Require confirmation of consent before evidence includes another person.
   - Offer manual blur tools plus audio-only and written alternatives. Do not run automatic face detection.

4. **Make completion evidence-based but lightweight.**
   - Require one photo, audio clip, note, or short video.
   - Require two reflections: what the user did, and what they learned or found difficult.
   - Keep all evidence private by default with no public social feed.
    - The zero-budget prototype does not store or manage original evidence. The user retains originals in their device photo library; QuestMark stores only the approved derivative.
    - Offline drafts may temporarily hold text and one compressed photo derivative in per-account IndexedDB. Warn that browser storage can be evicted, cap local drafts at 25 MB per account, and clear them after upload, logout, or account deletion.
    - For the funded MVP, retain uploaded raw evidence for 30 days after card creation, then delete it unless the user chooses to keep it.
    - Let the user manually blur any part of visual evidence and preview the result. Use only the blurred derivative for assessment, sharing, and peer verification.
    - Allow users to delete retained evidence, thumbnails, cards, and account data.
    - Let users download an archive of their Proof Cards, reflections, achievements, and retained evidence.
    - Provide a clearly labeled account-deletion flow with a seven-day recovery window. Keep the account inaccessible except for cancelling deletion, then permanently delete it from active systems.
    - Make deleted data inaccessible immediately in active systems. Disclose the providers' actual residual-retention terms rather than promising backup deletion controls unavailable on free plans.
    - Defer automated screening, quarantine, appeals, and human review to the funded MVP. The invited adult prototype accepts only notes and user-approved photo derivatives and never exposes evidence on public pages.
    - In the funded MVP, screen uploaded evidence before AI skill analysis, quarantine flagged material, permit one appeal, and restrict time-bound logged access to authorized reviewers after explicit appeal submission.
    - Detect exact duplicate uploads, rate-limit completion attempts, and flag suspicious evidence reuse for review.
    - Allow fraudulent or policy-violating Proof Cards to be revoked without introducing facial recognition, invasive identity checks, or continuous surveillance.

5. **Generate credible Proof Cards.**
   - Include the mission title, completion date, selected evidence thumbnail, AI-suggested skills, user reflection, achievement badge, and verification ID.
   - Exclude exact location, other people's identities, and raw evidence by default.
   - Have AI check whether evidence plausibly matches the mission and present suggested skills with confidence labels.
   - Let users edit their reflection and choose corrections only from the quest template's approved skills. Preserve the assessed skill set separately and calculate skill-map progress only from that assessed set.
   - When evidence plausibly supports the quest, award full base XP and create the normal Proof Card.
   - Give each accepted evidence type its own deterministic rubric. A reflection and a written-note artifact must be separate fields, and the same text cannot satisfy more than one signal.
   - Treat evidence as plausibly supportive when at least two independent signals align: the submitted artifact matches the template, the separate reflection contains concrete consistent details, and any additional template requirement is present.
   - When confidence is below the minimum threshold, still complete the quest, award 50% of base XP, and create an `Evidence limited` Proof Card that explains what could not be confirmed.
   - Let the user add stronger evidence later to earn the remaining XP and remove the limited status. Peer verification adds credibility but does not restore XP by itself.
   - Never describe a Proof Card as a certified qualification.

6. **Add optional peer verification without requiring verifier accounts.**
   - Let a user send a private, expiring link to someone who participated in or witnessed the quest.
   - In the zero-budget prototype, show the verifier only a sanitized mission summary; never disclose evidence. A funded MVP may let the owner select a blurred derivative for the verifier.
   - Let the verifier confirm participation and optionally leave one short note.
   - Expire links after seven days.
   - Accept only one response per link, let the user revoke it, and rate-limit by token and network source.
   - Show an anti-abuse challenge only after suspicious activity rather than adding friction for every verifier.
   - Mark verification clearly as optional.

7. **Build one focused skill map.**
   - Track only communication, observation, creativity, leadership, problem-solving, and courage.
   - Assign each Proof Card to no more than two primary skills and one secondary skill.
   - Base progress on completed evidence rather than self-selected claims.

8. **Add motivating progression without public competition.**
   - Award XP, levels, achievements, and streaks.
   - Include achievements for first attempts, variety across skills, reflection, courageous quests, and peer-verified cards.
    - Provide one streak grace day per week.
    - Maintain the streak when the user completes one valid quest during their local calendar day, applying the weekly grace day automatically.
    - Limit account-timezone changes to once every 30 days to reduce accidental resets and manipulation.
    - Award XP to at most three completed quests per day. Additional completions may still create reflections and Proof Cards but do not add XP or streak credit.
    - Award 50 XP for easy quests, 80 XP for medium quests, and 120 XP for bold quests.
    - Use fixed one-time achievement bonuses. Peer verification increases credibility but awards no XP.
    - Increase the XP required for each level using `400 + (current level × 100)`, starting with 500 XP from level 1 to level 2.
    - Cap displayed levels at 50 for the MVP while continuing to track lifetime XP.
    - Launch with 12 achievements: `The First Mark` for the first quest, `Proof in Hand` for the first Proof Card, `Signal Clear` for communication, `The Second Look` for observation, `New Angle` for creativity, `Step Forward` for leadership, `Wayfinder` for problem-solving, `Brave Move` for courage, `Three in Motion` for a three-day streak, `A Week Outside` for a seven-day streak, `Full Compass` for all six skills, and `Witnessed` for the first peer verification.
    - Do not build global, friend, or school leaderboards for the MVP.

9. **Support private sharing and application portfolios.**
   - Export individual Proof Cards through the device share sheet for users to post independently.
   - Let users select cards for a polished PDF portfolio or private read-only web portfolio.
    - Let the user control the portfolio title, introduction, included cards, and link expiry.
    - Do not create a public profile directory.
    - Separate each immutable internal Proof Card ID from its rotatable public bearer token. Store only the token hash.
    - Resolve a valid active bearer token to a sanitized status page showing only the mission, completion month, demonstrated skills, optional peer-verification state, and whether the card is active.
    - Keep raw evidence, reflection text, exact location, and account details off the verification page unless the owner explicitly included them in the shared portfolio.
    - Use random, non-sequential 128-bit bearer tokens and rate-limit lookups.
    - Require an active unexpired share token for every portfolio and card status page. Revoking or regenerating a token immediately disables the prior portfolio and verification URLs without changing the internal card.

10. **Keep onboarding and reminders small.**
    - For the zero-budget prototype, support email magic links and Google sign-in only for a server-side allowlist of at most 10 invited adult email addresses. Disable open application registration; an authenticated but uninvited identity receives no profile, assignments, application rows, or storage access.
    - Send magic links only through an allowlist-checking server endpoint. After either email or Google authentication, require the same normalized-email allowlist check before provisioning application access. Defer Apple sign-in because it requires paid Apple developer enrollment.
    - Collect only display name, age group, interests, and recommendation preferences.
    - Offer one optional daily notification at a user-selected time.
    - Stop reminders after several ignored days until the user re-enables them.

11. **Collect product reviews with explicit consent.**
    - Add an in-app rating and feedback form.
    - Keep reviews private unless the reviewer permits portfolio use.
    - Feature only approved review IDs selected through project configuration, avoiding an admin dashboard. At render time, include a selected review only when its live database record is still approved, consented, and not withdrawn.
    - Default attribution to first name, age group, and occupation.
    - Require separate consent for a real name, photo, Proof Card, or portfolio link.
    - Email reviewers a private consent-withdrawal link. Withdrawal updates the live record immediately so every dynamic render hides the testimonial; remove its configured ID and bundled assets from the next deployment.

12. **Ship a strict zero-budget prototype before the funded MVP.**
    - Build a responsive progressive web app with camera, location, install-to-home-screen, notifications where supported, and native sharing. Defer microphone evidence capture with the funded audio workflow.
    - Cache assigned quests for offline viewing and allow offline reflection drafting plus one temporary compressed photo derivative.
    - Queue unfinished submissions locally and require an explicit user action to upload after connectivity returns. Every replay must carry its original idempotency key and pass a deletion-tombstone check.
    - In the zero-budget prototype, keep assignment refresh, derivative uploads, peer verification, and portfolio sharing online-only. Offline mode uses the last assigned seeded quests and local drafts; it does not generate new recommendations.
    - In the funded MVP, keep live place lookup and AI analysis online-only.
    - Keep the prototype free, ad-free, personal, non-commercial, and inaccessible as a public production service.
    - Store the reviewed quest library as seeded application data.
    - Do not build native apps or an admin dashboard until evidence shows they are needed.
    - Deliver a functional data-backed core loop rather than a clickable-only demo: sign-in, daily seeded quests, offline capture, evidence derivatives, reflections, rule-based prototype assessment, XP, levels, achievements, Proof Cards, private portfolio links, optional peer verification, and product reviews.
    - Spend exactly RM0. Do not enable a paid plan, usage-based overage, billing-backed API, custom domain, paid asset, paid email provider, or paid app-store account.
    - Use Next.js App Router for the installable PWA, service worker, push-notification flow, server-rendered public portfolio pages, and application routes.
    - Host only the personal, non-commercial prototype on Vercel Hobby with hard usage limits.
    - Use Supabase Free for Postgres, email magic links, Google authentication, private object storage, and row-level authorization.
    - Use Node.js 22 or later, pin Supabase package versions, and commit the lockfile.
    - Keep evidence in private storage buckets, enable RLS on every exposed table, scope policies by record ownership, and keep service-role credentials server-only.
    - Explicitly opt required tables into the Data API rather than assuming new tables are exposed automatically.
    - Treat the selected cohort as an audited account field rather than casual profile metadata. Prototype accounts are fixed to ages 18-24; synthetic test accounts alone may exercise the 16-17 track. A funded cohort change invalidates pending assignments and records the change.
    - Do not enable Google Places billing in the zero-budget prototype. Recommend exact venues only from a manually reviewed Kuala Lumpur and Petaling Jaya seed list, with a home quest fallback.
    - Seed 30 verified venues across cafés, libraries, parks, community spaces, universities, and shopping areas.
    - Record each venue's category, approximate accessibility, opening-hours source, allowed age cohort, and last verification date.
    - Recheck every seeded venue before each pilot week and disable entries not verified within seven days, falling back to a home quest.
    - Do not call the OpenAI API in the zero-budget prototype. Use deterministic template adaptations and the approved evidence rubric, and label every simulated AI result as prototype behavior.
    - Display `Prototype assessment` wherever the funded product would show AI analysis, explain once that fixed rules are being used, and never label prototype results as `AI verified`.
    - Defer live Google Places and OpenAI integration until a funded MVP.
    - Never opt API inputs or outputs into model training. Send only the blurred derivative, transcript, sampled frames, and minimum quest context required for analysis.
    - When funded AI integration begins, set Responses API requests to `store: false` and pursue approved Zero Data Retention controls before public launch.
    - Keep QuestMark's derived AI analysis only while the associated Proof Card requires it, then delete it with the card or account.
    - Defer the asynchronous managed media worker and server-side AI analysis until funding exists.
    - Run the zero-budget usability test with at most 10 invited adults aged 18-24. Evaluate the ages 16-17 track only through synthetic accounts and scripted scenarios until Malaysian youth-privacy and research-consent requirements are reviewed.
    - Defer the approved four-week pilot of 30-50 users across both cohorts until the funded MVP can support it safely.
    - Measure quest acceptance, completion, evidence submission, return rate, and portfolio creation separately for each cohort.
    - Preserve the funded-pilot targets: at least 40% complete two quests in week one, at least 30% remain active in week four, at least 50% of completers create three Proof Cards, at least 20% create or export a portfolio, and fewer than 5% of recommended quests receive a safety report.

13. **Apply the approved visual direction and quality gates.**
    - Treat QuestMark as the working brand name until trademark, domain, and app-store availability are checked.
    - Use the supplied alpine lake image only as a palette and mood reference: deep navy `#184E6C`, lake blue `#387EA2`, clear blue `#5BA3C6`, sky blue `#9BCBE5`, and mist `#DDECF6`.
    - Support coordinated light and dark themes, follow the device preference by default, and provide a manual toggle.
    - Use real-world documentary evidence photography with subtle topographic details instead of literal mountain backgrounds or a heavy 3D map.
    - Use the approved evidence-first Proof Card layout: an immersive edge-to-edge image, an overlapping asymmetric field-record surface, left-aligned hierarchy, compact verification metadata, restrained embossed skill marks, a short reflection, a gold XP seal, one prominent share action, and minimal navigation.
    - Keep Proof Cards premium and credible rather than resembling fantasy trading cards or official certificates. Use green only for verified state and gold only for rare achievements.
    - Use a coherent 16px surface radius, reserving pill shapes for primary actions rather than tags throughout the interface.
    - Use Manrope Variable for headlines and interface text, with the native system monospace stack only for verification IDs.
    - Self-host the production font, subset it to the required English glyphs, use `font-display: swap`, and test truncation and hierarchy on real devices.
    - Make motion clearly noticeable at meaningful moments without delaying routine work.
    - Keep navigation and repeated controls immediate or below 180ms; give pressable controls a 140ms `scale(0.97)` response.
    - Choreograph quest completion as the signature motion: the proof sheet rises from the evidence image, verification settles with a subtle spring, skill stamps appear in a short 40-60ms stagger, and XP resolves once.
    - Pair successful completion with a short QuestMark sound and subtle haptic feedback when supported. Play sound only after a user-initiated action, provide an obvious mute setting, remember the preference, and never add sound to routine navigation.
    - Use strong custom ease-out curves for entry, ease-in-out for on-screen movement, faster exits, and no `ease-in` UI transitions.
    - Animate only transform and opacity where practical, keep routine UI motion below 300ms, and remove positional movement under `prefers-reduced-motion` while retaining a short explanatory fade.
    - Do not use perpetual floating, glowing, bouncing, or decorative motion.
    - If an animated product preview is produced in Remotion, make major visual layers selectable in Studio, give them descriptive names, keep editable styles and `interpolate()` calls inline, and expose only useful timing and transform controls.
    - In the funded MVP, use Mediabunny in the browser to inspect uploaded audio and video metadata such as duration, dimensions, rotation, tracks, and readable format before upload. Revalidate media at the server trust boundary.
    - In the funded MVP, analyze video evidence from a transcript plus representative frames rather than every frame. Let Mediabunny prepare candidate frames in the browser, then independently validate the file and sample frames on the server before AI analysis.
    - For the zero-budget prototype, accept written notes and browser-produced JPEG or WebP photo derivatives up to 5 MB. Defer audio, video, HEIC, MOV, transcription, frame sampling, server malware scanning, and all larger funded-MVP limits.
    - Strip location and device metadata while producing the browser derivative, then upload it to a per-user temporary private path rather than the permanent evidence bucket.
    - At the server trust boundary, enforce the invited account and quota, inspect the actual signature, decode the image, reject unreadable, mismatched, or oversized input, and re-encode it as JPEG or WebP without metadata before atomically promoting it to permanent private storage. Delete rejected and abandoned temporary uploads.
    - If a photo contains another person, block portfolio export and peer sharing until the user manually blurs every other person. The zero-budget prototype never displays evidence on public verification pages.
    - Before launch, audit performance, accessibility, SEO, security, and best practices.
    - Target LCP below 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1.
    - Test keyboard navigation, focus visibility, media alternatives, form errors, contrast, mobile layouts, browser console output, and permission flows.

14. **Define the minimum data, authorization, and quota model before implementation.**
    - Use these core tables: `pilot_invites`, `profiles`, `quest_templates`, `venues`, `daily_assignments`, `completions`, `proof_cards`, `xp_ledger`, `user_achievements`, `portfolios`, `portfolio_cards`, `peer_verifications`, `reviews`, `share_tokens`, and `deletion_tombstones`.
    - Keep `pilot_invites` server-only, capped at 10 normalized adult email addresses, and unavailable through the client Data API. Every application policy and storage policy requires an active invited profile, not merely an authenticated identity.
    - Keep evidence derivatives in a private storage bucket addressed by owner and completion ID. Never grant anonymous bucket reads.
    - Give owner-scoped tables RLS policies that require `auth.uid() = user_id`. Allow direct client writes only to user-authored profile, preference, draft-portfolio, reflection, and review fields. Keep assignments, completions, Proof Cards, XP, achievements, streak state, share tokens, peer verifications, and other derived or security-sensitive records client read-only; mutate them only through narrowly scoped transactional server functions.
    - Route anonymous portfolio reads, verifier writes, testimonial withdrawal, and reviewer operations through server endpoints that validate a hashed, scoped, expiring token.
    - Keep service-role access in server-only code. Never authorize from user-editable JWT metadata. Revoke sessions before account deletion and verify the user still exists for sensitive operations.
    - Create at most three daily assignments with a unique constraint on `(user_id, local_date, slot)`.
    - Process completion through one database transaction keyed by `(user_id, assignment_id, idempotency_key)`. Lock the assignment, create or update one completion and Proof Card, append XP once, award each achievement once, and update streak credit once.
    - Preserve an XP ledger with a unique source key so retries, multiple tabs, offline replay, and stronger-evidence resubmission cannot duplicate XP.
    - Consume a peer-verification token and insert its single response in one transaction. Lock the token row and enforce a unique constraint on `peer_verifications.token_id` so concurrent requests cannot both succeed.
    - On account deletion, revoke sessions and tokens, delete owned rows and storage objects, hide testimonials, invalidate portfolios and peer links, and clear offline drafts. Retain only a non-reversible deletion tombstone for 30 days to reject delayed replay, then delete it.
    - Limit the prototype to 10 invited accounts, 50 MB of stored derivatives per account, 10 photo derivatives per account, and 700 MB total project storage. Disable new uploads before a quota is exceeded while preserving sign-in, viewing, deletion, and export.
    - Allow at most three active portfolio links, ten peer-verification links per account per month, and one daily push subscription per device. Fail closed when a free-tier or email quota is exhausted and show a clear retry or export path.
    - Configure every available spend control to prevent paid overage. If a provider requires billing or cannot guarantee an RM0 hard stop, do not enable that feature.

## Key decisions & tradeoffs

- **Both cohorts in the product, adults only in the prototype:** one app preserves both tracks, but real zero-budget testing is restricted to invited users aged 18-24 until youth requirements are reviewed.
- **Seeded recommendations before live Places:** the prototype uses 30 manually verified Kuala Lumpur and Petaling Jaya venues with user-confirmed approximate travel time; funded exact search still uses ephemeral coordinates.
- **Curated templates plus AI adaptation:** this reduces novelty compared with unrestricted generation but makes quest safety and quality reviewable.
- **Private evidence by default:** there is no in-app public feed. Users export cards or private portfolios themselves.
- **Optional peer verification:** verification adds credibility without blocking users whose quests are completed alone.
- **Rules before live AI:** the zero-budget prototype visibly uses deterministic assessment; funded AI may suggest but never certify skills.
- **Progress without leaderboards:** XP, levels, achievements, and forgiving streaks motivate users without public comparison.
- **PWA before native apps:** one codebase validates the concept with lower cost, with some platform limits around notifications and background behavior.
- **Notes and photos before audio/video:** the zero-budget prototype keeps media processing feasible and defers richer evidence until a funded worker exists.
- **No admin dashboard:** seed files and project configuration cover initial content and featured-review selection.
- **English-only MVP:** this reduces scope but limits accessibility for users who prefer other languages.
- **Strict RM0 validation:** hard quotas and feature shutdowns take priority over preserving every funded-MVP capability.
- **Evidence-first visual system:** photography leads, while proof metadata uses an asymmetric field-record layout with restrained blue materiality.
- **Dual theme:** light and dark modes share one visual identity and follow the device preference by default.

## Risks / open questions

- The layout, palette, image style, Proof Card art direction, Manrope-based type system, noticeable completion motion, sound, haptic feedback, and zero-budget evidence limits are approved.
- QuestMark name availability requires trademark, domain, social handle, and app-store checks before brand lock.
- Youth privacy, location, biometric/media processing, consent, and data-retention requirements must be verified for Malaysia before launch and repeated before entering any additional jurisdiction.
- The evidence rubric requires calibration against pilot examples before it can be treated as reliable.
- Zero-budget hosting and storage have no uptime SLA, automatic backups, or guaranteed long-term availability. Users must be able to retain local evidence and export their data.
- The prototype has no paid malware scanner, live AI moderation, full server-side video analysis, or human moderation operation, so it must remain an invited usability test rather than a public youth service.
- The exact managed-worker provider and funded operating budget remain open for the real MVP.
- PWA support for push notifications, capture, sharing, and installation varies by device and browser and needs prototype validation.

## Out of scope

- Public social feeds, direct messages, follower systems, and public user discovery.
- Global, friend, school, or cohort leaderboards.
- Native iOS or Android applications.
- A quest-management or review-management admin dashboard.
- Payments, subscriptions, advertising, sponsored quests, and school licensing.
- Teacher, school, parent, or guardian dashboards.
- Mandatory parent or guardian consent as a product feature, subject to legal review.
- Certified qualifications or claims that AI has objectively proven a skill.
- Languages other than English.
- Unrestricted AI-generated missions.
- Implementation before the remaining grill decisions, adversarial plan review, and final user sign-off.
