# ScrimmApp Phase 1 Delivery Plan

**Version 1.2 · 12 August 2026**
Prepared by Balakrishna K for Javier Reyes (Founder, ScrimmApp).

| | |
|---|---|
| Budget | **150 hours**: 133 h estimated + 17 h contingency (§5) |
| Schedule | 8 increments, Aug 12 to Oct 4 2026 |
| Go-live | Sun 4 Oct 2026, scrimmapp.com |
| Build cost | $3,000 to $3,750 at $20-25/h |
| Running cost | **$0/month through S0-S6.** First dollar spent at S7 (§12) |
| Blocked on | 5 open decisions (§8), only D3 is urgent |

---

## 1. Scope of record

**The 3 August 2026 scoping email is the binding scope.** Anything before it is superseded where the two conflict; everything after it is in force.

| Area | May 29 brief | Aug 3 onward, binding | Status |
|---|---|---|---|
| Hosting | Vercel / Firebase Hosting | Google Cloud (credits) | Superseded |
| Database | Firebase Firestore | Neon or Supabase (PostgreSQL) | Superseded |
| Auth | Firebase Auth | not restated | **Open: D2** |
| Email | SendGrid | SendGrid | Confirmed |
| Repo | GitHub | GitHub under `tech@scrimmapp.com` | Confirmed |
| Payment | Payoneer | Wise (agreed Aug 5) | Superseded |
| Effort | not stated | ~150 h, $20-25/h, weekly invoices | Confirmed |
| Frontend | "fully built in React + Tailwind" | not restated | **Incorrect, see §2** |

Three May 29 feature commitments carry forward and are budgeted: the **Connect → automated email** flow, the **reputation/reliability system**, and **cancellation reason logging**. So does the required **45-minute handoff walkthrough** before final milestone sign-off.

---

## 2. The frontend gap

> **The React frontend does not exist.**
> The May 29 brief priced this as "build the backend engine for a finished React frontend." The artifact supplied on Aug 6 is a **single ~900-line HTML file**: one IIFE, screens rendered via `innerHTML` strings, Tailwind from a CDN, all state in `localStorage` under five keys (`scrimmapp_posts`, `scrimmapp_inbox`, `scrimmapp_comments`, `scrimmapp_calendar_events`, `scrimmapp_saved_venues`). No component tree, no router, no build step, no `package.json`, no tests.
>
> It is a competent AI-generated design mock, the right artifact for agreeing look and flow, and a genuinely useful spec. It is not a codebase to attach a backend to. **~40 of the 150 hours go to building the frontend the brief assumed was done.**

### What the mock does specify (and we keep)

- Six screens: Board (post form + filtered grid), Listing detail + public chat, Season Calendar with conflict flagging, Inbox, About, FAQ.
- Two modals: OfferUp-style quick-phrase Connect flow, venue directory.
- Full listing field set, including the level → sub-tier cascade (Club → ECNL/RL, High School → CIF divisions, Rec → AYSO tiers).
- Visual identity: `#060e1e` ground, `#0f1c36` cards, `#39ff14` accent, Inter, heavy weights, 1.25rem radii.

### What looks built but isn't

The "4.9 / 5.0 Reliability Score", the saved venue directory, the inbox message, and the seeded listings are all hard-coded strings. Every one is greenfield. Reliability scoring alone is a 12-hour epic.

### Resolved: design to the requirements, not to the mock

**Decided 12 Aug 2026.** The mock is a **base reference, not a specification**. It was a first pass and its feature set is not authoritative. The functional requirements are the ones set out in the email thread: the Connect → email flow, tiered league/gender/age filtering, the season calendar with conflict detection, the reliability system, and cancellation logging. We design the screens to serve those requirements, using the mock for visual direction and field-level hints where it is useful.

This sits between the two options originally offered, and costs less than a full redesign would:

| Approach | Effort | Total |
|---|---|---|
| Port the mock 1:1 | Frontend ≈ 40 h | 150 h |
| **Design from requirements** *(chosen)* | Frontend ≈ 50 h unassisted, designing once rather than porting then reworking | **fits in 150 h**, see §5 |
| Port, then redesign after feedback | +25-40 h on top of the port | 175-190 h |

The premium over a straight port is roughly 10 hours unassisted, not the 25-40 h a mid-build redesign would cost, because we skip the fidelity constraint entirely and design each screen once. **AI-assisted component and layout generation absorbs that premium** (see the re-budget in §5), so this approach fits inside the agreed 150 with contingency to spare. Javi's Aug 8 message ("absolutely… excited to see what changes look like") authorises it in principle, and there is now no budget impact to negotiate.

What we keep from the mock: the visual identity (dark navy ground, high-contrast accent, heavy type), the level → sub-tier cascade, and the field-level data requirements. What we treat as open: screen composition, navigation, the Connect interaction, and the calendar layout.

---

## 3. Stack decisions

All choices satisfy the Aug 3 constraints (Google Cloud, PostgreSQL, SendGrid, GitHub) and minimise moving parts for a solo build + handover.

| Layer | Choice | Why | Rejected |
|---|---|---|---|
| Frontend + API | Next.js 15 (App Router), TypeScript, Tailwind v4 | One codebase for UI + API. SSR makes public listings indexable, which is real acquisition value. Mock's Tailwind classes port directly. | Vite SPA + separate API: two deploys, no SEO, more glue |
| Database | Supabase (managed Postgres) | Meets the Postgres requirement and bundles auth + RLS + realtime. Realtime board updates were an explicit requirement. | Neon: great Postgres, but auth + realtime hand-assembled ≈ +20 h |
| Auth | Supabase Auth (email/password + Google) | User IDs are FKs in the same DB, so access rules are enforced at the data layer. | Firebase Auth: can't drive Postgres RLS without a token bridge (**D2**) |
| Schema | Drizzle ORM + drizzle-kit | Type-safe queries; migrations committed as reviewable SQL, which matters for handover. | Prisma: heavier runtime, awkward Cloud Run cold starts |
| Email | SendGrid, server-side only | Agreed in both briefs. API key in Secret Manager, never exposed to the browser. | Resend: cheaper, but not what was agreed |
| Hosting | Cloud Run + Global HTTPS LB | Google Cloud per Aug 3, credits apply, container runs Next.js SSR with no platform lock-in. | Firebase App Hosting: also GCP, simpler, acceptable fallback |
| CI/CD | GitHub Actions → Artifact Registry → Cloud Run | Push to `main` deploys staging, tag deploys production. Every deploy traceable to a commit. | Manual deploys: unacceptable for a client handover |
| Secrets | GCP Secret Manager | One audited home for SendGrid key, DB URL, OAuth secrets. | Console-pasted env vars: no audit trail, no rotation |
| Monitoring | Cloud Logging + Sentry (free) + uptime check | Javi sees errors without reading logs. | Nothing: first bug report comes from a coach |

**Running cost after credits:** Supabase Pro $25/mo · Cloud Run ~$5-15/mo · SendGrid free to 100/day then $20/mo · DNS ~$1/mo → roughly **$30-60/month** at pilot scale, largely covered by GCP credits year one.

---

## 4. Data model

Ten tables: what the mock's five `localStorage` keys become once data must survive, be shared, and be trusted.

```
profiles          -- extends auth.users; one per coach
  id · coach_name · team_name · club_name · org_type(rec|club|high_school)
  division · default_age_group · default_gender · contact_email · phone
  home_venue_id -> venues · reliability_score · ratings_count · created_at

venues            -- the saved pitch directory
  id · name · address · city · state · lat · lng · field_count · surface
  has_lights · parking_notes · created_by -> profiles · is_public

listings          -- a scrimmage request on the board
  id · owner_id -> profiles · team_name · gender · age_group
  level(rec|club|high_school) · sub_level · match_date · time_window
  kickoff_time · venue_id -> venues · location_text · travel_radius_miles
  is_hosting · has_ref · ref_fee_split · field_fee_share · match_format
  notes · status(open|matched|cancelled|completed) · matched_profile_id

connections       -- Coach A inquires on Coach B's listing
  id · listing_id -> listings · from_profile_id · to_profile_id · message
  status(sent|accepted|declined|withdrawn) · created_at · responded_at

messages          -- the thread under a connection
  id · connection_id -> connections · sender_id · body · read_at · created_at

comments          -- public Pitch-Side Chat, per listing
  id · listing_id -> listings · author_id · body · is_hidden
  moderation_reason · created_at

calendar_events   -- league games, blackouts, practices
  id · profile_id -> profiles · title · event_date · time_window
  kind(league|scrimmage|tournament|blackout|practice)
  venue_id · location_text · linked_listing_id · notes

ratings           -- one per connection, per direction
  id · connection_id -> connections · rater_id · ratee_id · stars(1-5)
  on_time · good_communication · accurate_field_info · paid_ref_fee
  comment · created_at        UNIQUE (connection_id, rater_id)

cancellations     -- why a listing was pulled
  id · listing_id -> listings · cancelled_by -> profiles
  reason_code(field_revoked|player_availability|weather|
              opponent_backed_out|schedule_conflict|other)
  reason_text · created_at

email_log         -- every transactional send, for debugging
  id · to_email · template · related_type · related_id
  sendgrid_message_id · status · error · created_at
```

### Four decisions worth flagging

1. **Travel radius becomes a number.** The mock stores `"Up to 25 miles"` as free text, which can't be filtered or sorted. `travel_radius_miles` as an integer alongside venue lat/lng makes "everything within my radius" a real query, and geographic search later a small change rather than a migration.
2. **Ratings hang off connections, not profiles.** You can only rate a coach you actually arranged a match with. This one FK prevents drive-by revenge ratings, the failure mode that kills reputation systems on small marketplaces.
3. **Cancellations are their own rows.** Deleting a listing would destroy exactly the history Javi asked to capture. A cancelled listing keeps its row, changes status, and gains a cancellation record, so repeat last-minute pull-outs become visible.
4. **Calendar conflicts are derived, never stored.** A DB view unions a coach's calendar events with accepted listings and flags collisions on date + overlapping time window. Nothing to keep in sync; the rule lives in one place.

> **No player data in Phase 1.** ScrimmApp serves youth soccer. The moment player names, ages, or photos enter the database it becomes a children's-data platform with COPPA and state privacy obligations attached. Phase 1 stores **coaches only**: no rosters, no player records, no team photos. Confirm in writing (**D7**).

---

## 5. Effort budget

Development is AI-assisted throughout. That is a real velocity multiplier, but an uneven one: it compresses code volume, not wall-clock time or other people's availability. The two columns below separate what it actually changes from what it doesn't.

| Epic | Scope | Unassisted | **Assisted** | Compression |
|---|---|---:|---:|---|
| E0 · Foundation | Repo scaffold, TS, Tailwind, Drizzle, Supabase + GCP projects, secrets, CI skeleton | 10 | **8** | Config boilerplate generates well |
| E1 · Design & system | Design screens from requirements (§2), tokens + component library, static shells | 24 | **18** | Components generate fast; design *decisions* still take thought |
| E2 · Auth & profiles | Email + Google sign-in, onboarding, profile page, RLS policies | 16 | **12** | Standard flows are well-trodden |
| E3 · Listings & board | Schema, create/edit/cancel, server-side filters, detail page, realtime | 26 | **22** | CRUD and filters compress; RLS + realtime debugging does not |
| E4 · Connect & email | Inquiry flow, inbox + threads, domain auth, templates, delivery log | 18 | **15** | Templates compress; DNS and deliverability are wall-clock |
| E5 · Calendar & venues | Month grid, conflict detection, blackouts, venue directory + map links | 20 | **16** | Date logic generates well, then needs careful testing |
| E6 · Reliability | Post-match rating, 4-point checklist, aggregate score, board badges | 12 | **10** | Mostly schema and aggregation |
| E7 · Trust & safety | Profanity filter, report/hide, cancellation reason capture | 8 | **6** | Small, well-defined surface |
| E8 · Infrastructure | Production deploy, domain cutover, TLS, backups, monitoring, alerts | 14 | **14** | **No compression**: IAM, DNS propagation, TLS issuance are third-party wall-clock |
| E9 · Launch | A11y + mobile pass, UAT burn-down, runbook, handover walkthrough | 12 | **12** | **No compression**: gated on Javi's UAT cycles and the recorded walkthrough |
| | **Estimated** | 160 | **133** | |
| | **Contingency** | | **17** | 13%, drawn only against written justification |
| | **Total** | | **150** | |

> **The 150 now holds, with real slack inside it.** AI assistance buys back the ~27 hours that the requirements-led design approach and the original zero-buffer estimate had between them. That converts the plan's worst structural weakness (no contingency) into a 17-hour band, without asking Javi for more money. **This resolves D8.**
>
> **What does not compress, and is therefore where overrun will come from:** E8 and E9. Cloud IAM, DNS propagation, TLS issuance, email domain warm-up, Javi's UAT turnaround, and recording the walkthrough all run on wall-clock and other people's calendars. If the project slips, it slips there. Treat the 17-hour contingency as pre-allocated to those two epics rather than spendable early.
>
> Tracking stays honest: log actual hours per epic weekly. If the assisted estimate is running hot by S3, we know by mid-September rather than at handover.

---

## 6. Sprint plan

Eight increments. Sprint hours below are the **assisted** estimates from §5 and total 133; the 17-hour contingency sits outside them, pre-allocated to S7. Every sprint ends with something Javi can click, not a status report. Written progress note each **Wednesday**; demo + invoice each **Friday** (the cadence committed Aug 11).

| # | Dates | Hours | Focus | Demo |
|---|---|---|---|---|
| **S0** | Aug 12-16 | 8 · E0 | **Foundation and access.** Rotate credentials (§7). Commit the HTML mock as reference spec. Scaffold Next.js/TS/Tailwind/Drizzle. Create Supabase + GCP projects on free tiers, apply credits, wire Secret Manager, stand up Actions pipeline and branch protection. **Set every cost guardrail in §12 before the first deploy**: billing alerts, Cloud Run instance caps, registry cleanup, bounded CI triggers. | Green CI on every push; staging URL live on Cloud Run; billing alerts firing correctly on a test threshold |
| **S1** | Aug 17-23 | 20 · E1 | **Design system and screen shells.** Lift the mock's palette, type scale, radii into Tailwind tokens. Build shared components (card, badge, filter select, modal, nav, footer). All six screens static, navigable, responsive. | Clickable app matching the mock, and finally working on a phone |
| **S2** | Aug 24-30 | 20 · E2 | **Accounts and coach profiles.** Email/password + Google sign-in, reset, sessions. Onboarding capturing team, club, org type, division, contact, home venue. Profile view/edit. First RLS pass, with policy tests written before anything depends on them. | Javi creates a real account on his phone and lands on his profile |
| **S3** | Aug 31 to Sep 6 | 20 · E3 | **The board goes live.** Full listings schema + migrations. Post/edit/cancel with the level → sub-tier cascade intact. Server-side filtering by gender, level, age, radius, date range, text. Detail page with persisted public chat. Realtime updates. Seeded with real venues and teams. | Javi posts a listing; it appears on a second device with no refresh |
| **S4** | Sep 7-13 | 20 · E4 | **Connect and automated notifications.** Quick-phrase inquiry + custom messages. SendGrid domain auth on scrimmapp.com (DKIM/SPF/DMARC). Templates carrying Coach A's profile metadata + Google Maps link, per the original brief. In-app inbox with threads, read state, delivery log. | Javi taps Connect; the opposing coach receives the email; we read the SendGrid log together |
| **S5** | Sep 14-20 | 20 · E5 | **Season calendar and venues.** Entries for league games, tournaments, practices, blackout dates. Month grid merging personal entries with accepted scrimmages. Conflict detection on date + overlapping window. Venue directory with lights, parking, field count, directions; venues attach to listings. | Accept a scrimmage that collides with a league fixture and watch it flag before the double-booking |
| **S6** | Sep 21-27 | 20 · E6+E7 | **Reliability, moderation, cancellations.** Post-match rating available only to coaches who actually connected: 5 stars + the four-point checklist (on time, good communication, accurate field/parking info, paid ref fee). Aggregate score on profiles and board badges. Cancellation flow with preset reasons + free text. Server-side profanity filter on comments and notes, report-and-hide, simple admin view. | Full lifecycle (post, connect, accept, play, rate) with the reliability score moving |
| **S7** | Sep 28 to Oct 4 | 26 · E8+E9 | **Launch and handover.** *(The heaviest sprint, and the one that does not compress. See §5. Contingency is pre-allocated here.)* Production env, load balancer, TLS, scrimmapp.com DNS cutover from Squarespace. Backups with PITR. Sentry, uptime checks, alert routing. A11y + mobile pass. Burn down UAT bugs. README + operations runbook. Deliver the contractual **45-minute recorded walkthrough**: managing the DB console, watching data writes, reading the user table, checking email logs, deploying a change. | ScrimmApp live on scrimmapp.com, and Javi able to operate it unaided |

---

## 7. Week-zero security

> **Rotate the project account credentials before any other work.**
> The `tech@scrimmapp.com` password, all four backup codes, and a live Google verification code were sent as plain text through an email chain since forwarded at least twice. Those credentials now sit unencrypted in several mailboxes and in Gmail's index. Treat them as compromised regardless of who has actually seen them.
>
> **Before S0 work begins:** change the password, regenerate all backup codes, move 2FA to an authenticator app, review recent account activity. Going forward credentials move through a password-manager share, and a live verification code is never forwarded by email. It is read aloud or typed by the account owner at the moment of login.

Rest of the week-zero checklist, all inside S0:

- **Ownership stays with the client.** Javi holds Owner on the `scrimmapp` GitHub org and on the GCP project + billing account; Bala works as administrator, not owner. Nothing critical registered to a personal account.
- **Branch protection on `main`**: PRs only, CI must pass. Javi keeps visibility on every change without reviewing code.
- **Secret scanning + push protection** enabled, so a leaked key is blocked at push rather than found later.
- **Secrets in Secret Manager only.** Committed `.env.example` documents what's needed; every real `.env` gitignored.
- **Separate staging and production** Supabase projects and Cloud Run services from day one. Test data never touches real coaches.
- **Access rules enforced in the database.** RLS means an application bug cannot expose another coach's inbox.

---

## 8. Decisions needed from Javi

Three are resolved (D1, D2, D8). **Five remain**, each blocking a sprint; the dates are the last moment each can land without moving Oct 4. **D3 is the only one that must land this week.**

| ID | Decision | By | Blocks |
|---|---|---|---|
| **D1** | ✅ **Resolved 12 Aug.** Mock is a base reference only; screens are designed from the email requirements (§2). **No budget impact**, absorbed by AI-assisted velocity (§5). Worth a one-line note to Javi for the record, but not a blocker. | n/a | n/a |
| **D2** | ~~Supabase over Neon.~~ **Resolved 12 Aug:** Next.js + TypeScript + Tailwind confirmed by Bala. Supabase confirmed as Postgres + Auth + realtime (§12); Firebase Auth dropped because it cannot enforce DB-level access rules. Javi to countersign. | Aug 16 | S0 |
| **D3** | **Google Cloud billing.** Billing account under Javi's ownership, startup credits applied, Bala added as project administrator. | Aug 16 | S0 |
| **D4** | **DNS control for scrimmapp.com.** **Recommend moving nameservers to Cloudflare** (free). This is a one-time change at Squarespace and removes the need for repeat Squarespace access in S4 and S7, while adding WAF and DDoS protection at zero cost (§12). | Sep 5 | S4 |
| **D5** | **Email provider.** SendGrid's permanent free plan no longer exists for new signups: 60-day trial, then ~$20/mo. **Recommend Resend** (3,000/mo free, ample for pilot) behind a provider-agnostic adapter so this stays reversible. Deviates from the Aug 3 agreement, so needs Javi's approval. Sending address: `notifications@scrimmapp.com`, replies to Javi. | Sep 5 | S4 |
| **D6** | **Real seed data.** 10-15 genuine SoCal venues with parking/lighting notes, plus confirmation that the age/level/division taxonomy in the mock matches how coaches actually describe their teams. | Aug 28 | S3 |
| **D7** | **Coaches only, no player data** in Phase 1, confirmed in writing (§4). | Aug 23 | S2 |
| **D8** | ✅ **Resolved 12 Aug.** Contingency comes from AI-assisted velocity, not from Javi's budget: 133 h estimated + 17 h buffer inside the agreed 150 (§5). Nothing to approve. | n/a | n/a |

---

## 9. Risks

| Risk | Why it bites | Mitigation | Severity |
|---|---|---|---|
| ~~Zero schedule slack~~ | *Downgraded 12 Aug.* AI-assisted velocity created a 17 h contingency inside the 150 (§5). | Contingency pre-allocated to E8/E9, the epics that don't compress. Track hours per epic weekly; flag the *first* week an epic runs over, not the last. | Medium |
| **Free-tier cost leak** | "No cost until production" fails silently: an unbounded Cloud Run instance, a CI loop, or accumulated Docker images turn $0 into a surprise invoice, and GCP cannot hard-cap spend. | The eight guardrails in §12, all set in S0 before the first deploy. Billing alerts at $1/$5/$20 to both parties are the backstop. | Medium |
| **An empty board is worthless** | A two-sided marketplace with no listings gives a visiting coach nothing and they never return. Phase 1 delivers software, not adoption. | Javi-owned workstream: recruit 10-20 pilot coaches before the S7 cutover so the board has real listings day one. Not a dev task, but it decides whether the build succeeds. | High |
| **Email lands in spam** | A brand-new domain sending transactional mail is untrusted by default. The Connect notification is the product's core loop, and in junk the platform silently fails. | DKIM/SPF/DMARC in S4, not at launch. Warm the domain gradually, watch SendGrid delivery stats through S5-S7. | Medium |
| **Scope creep from mock polish** | The mock shows a reliability score, venue directory, and inbox that look finished. All hard-coded strings, all greenfield. | This document is the scope. Anything not in it gets a written estimate and approval before work starts. | Medium |
| **RLS silently drops realtime events** | Realtime subscriptions respect row-level security. An over-strict policy makes the live board stop updating, with no error anywhere. | Write policy tests in S2, before S3's board depends on them. | Medium |
| **Cloud Run cold starts** | Scale-to-zero makes the first visitor of the morning wait several seconds, a bad first impression on a marketplace. | Decide in S7 whether to keep one warm instance. ~$10-15/month, removes the problem. | Low |
| **Single-developer bus factor** | One person holds all context on a system Javi cannot yet operate. | The S7 walkthrough is contractual, not a courtesy. Runbook and README are deliverables. Every credential under Javi's ownership from S0. | Low |

---

## 10. Commercial terms

| Item | Agreed |
|---|---|
| Rate | $20-25/hour. **Recommend pinning a single figure now.** A band leaves a $750 gap across 150 hours and invites a conversation nobody wants at invoice time. |
| Phase 1 total | $3,000 at $20/h · $3,750 at $25/h, for 150 hours, unchanged from the Aug 3 agreement |
| Infrastructure | **$0/month until production.** First charge is Supabase Pro at $25/mo, from S7 launch only (§12). Billed to Javi's accounts directly, not passed through invoices. |
| Invoicing | Weekly, each Friday, with a per-epic hour log attached alongside the sprint demo |
| Payment | Wise, confirmed Aug 5 (Payoneer withdrawn) |
| Reporting | Written progress note each Wednesday; demo, hour log, and invoice each Friday |
| Change control | Anything outside §11 gets a written estimate and approval before work begins. No silent absorption into the 150. |
| Ownership | All code, infrastructure, and accounts belong to ScrimmApp from the first commit. Javi holds Owner on every service. |
| Final milestone | Not complete until the 45-minute walkthrough is delivered and Javi can operate the platform unaided |

---

## 11. Out of scope

Named explicitly so there is no ambiguity later. Each is a reasonable Phase 2 candidate.

- **Native mobile apps.** Phase 1 is a responsive web app that works well on a phone.
- **Payments.** No referee fee settlement, no field rental splitting, no money movement. Coaches settle between themselves as they do today.
- **Player data.** No rosters, profiles, or photos. See §4.
- **Match results.** No scores, standings, or statistics.
- **SMS or push notifications.** Email only in Phase 1.
- **Automated matchmaking.** Coaches search and filter; the system does not propose opponents.
- **Multi-region or multi-language.** Southern California, English, US date and distance formats.
- **UI/UX redesign.** Deferred per D1.
- **Squarespace marketing site changes.** Only the DNS cutover for the application itself.

---

## 12. Platform selection: security first, then cost

Selection order: **security → total cost of ownership → developer velocity.** Prices verified August 2026; every one has a stated alternative so no choice is a lock-in.

The single most useful fact: **Javi's Google Cloud credits make the compute layer effectively free for year one**, and Cloud Run's standing free tier likely covers pilot traffic on its own. So the money question is really just the database and email.

### Recommended stack and what each alternative costs

| Layer | Recommended | Cost | Why (security first) | Alternatives |
|---|---|---|---|---|
| **Database + Auth + realtime** | **Supabase** | $0 dev · **$25/mo** prod | **Row-level security is the single highest-value security control in this build.** Access rules live in the database, so an application bug cannot expose another coach's inbox. SOC 2 Type II, encryption at rest, PITR backups on Pro. | **Neon**: cheaper at idle (scale-to-zero, ~$19/mo + usage) but no auth or realtime; add Better Auth + polling ≈ **+20 h**. **Cloud SQL**: GCP-native so credits cover it, but ~$50+/mo after and you build auth yourself. **Self-hosted Postgres**: rejected, you inherit patching and backups, and it is the wrong thing to hand a non-technical owner. |
| **Auth** | **Supabase Auth** (included) | **$0** to 50k MAU, then $0.00325/MAU | Bundled, and the reason RLS works: user IDs are foreign keys in the same database. Never hand-roll auth. | **Better Auth**: free, self-hosted, owns users in your own Postgres; the right pick *if* we went Neon. **Clerk**: best UI, $0.02/MAU after 10k free ≈ 6× Supabase at scale. **Auth.js**: free but more maintenance. |
| **Hosting** | **Cloud Run** | **~$0/mo** | Mandated by the Aug 3 email. Free tier is 240k vCPU-seconds + 450k GiB-seconds/month, which realistically covers pilot traffic entirely, with credits absorbing any spike. Container-based, so no platform lock-in. | **Vercel**: best Next.js DX, $20/seat/mo, but leaves GCP. **Railway** ~$5/mo usage-based. **Render** $7/service. **Firebase App Hosting**: also GCP, simpler, less control; acceptable fallback if Cloud Run setup overruns. |
| **Edge security + DNS** | **Cloudflare Free** | **$0** | **Best security-per-dollar in the entire stack.** Unmetered L3/L4 DDoS mitigation, managed WAF rulesets covering SQL injection and XSS, free Universal SSL, global CDN. Also solves D4: move nameservers once, and we stop needing Squarespace access. | Google Cloud Armor: more capable, but ~$5/policy/mo + per-rule charges. No edge layer at all is not acceptable for a public marketplace. |
| **Transactional email** | **Resend** | **$0** to 3,000/mo · $20/mo for 50k | Pilot volume is one notification per inquiry, comfortably inside the free tier. **SendGrid's permanent free plan is gone for new signups** (60-day trial, then ~$19.95/mo), so the agreed vendor now costs $20/mo for something we can get free. | **SendGrid**: the Aug 3 agreement; keep it if Javi prefers not to deviate. **Postmark**: best-in-class deliverability, $15/mo for 10k, worth it if inbox placement proves shaky. **AWS SES**: $0.10 per 1,000, cheapest at volume, but leaves GCP and you manage sending reputation. **Build behind a 30-line adapter interface so switching is an hour, not a sprint.** |
| **Error monitoring** | **PostHog** | **$0** to 100k errors/mo | Errors, product analytics, and session replay in one free tier. For a pilot marketplace, knowing which listings actually get viewed is worth as much as the stack traces. | **Better Stack**: 100k exceptions/mo free, no card, adds uptime monitoring. **GlitchTip**: open source, Sentry-SDK compatible, free self-hosted, runs on 4 containers vs Sentry's 40+. **Sentry**: 5k errors/mo free, the most limited of the four. |
| **Secrets** | **GCP Secret Manager** | **~$1/mo** | Audited access, versioned, IAM-controlled, credits cover it. Nothing sensitive ever reaches the repo. | **Infisical**: open source, generous free tier. **Doppler**: free for small teams. Both are fine; Secret Manager wins on staying inside one audited vendor. |
| **CI/CD** | **GitHub Actions** | **$0** | 2,000 minutes/month free on private repos, ample for this project. Secret scanning and push protection are free and block leaked keys at push time. | **Cloud Build**: 2,500 build-minutes/mo free, credits cover overage; the fallback if Actions minutes run short. |
| **File storage** *(Phase 2)* | **Supabase Storage** | included | Same access rules as the database, so no second permissions model to reason about. | **Cloudflare R2**: 10 GB free and **zero egress fees**, the right move if venue and team images grow. **GCS**: credits cover it. |

### Zero-cost development posture, S0 through S6

**Requirement: no running cost before production.** That is achievable, but not automatically, because free tiers leak money quietly if nobody bounds them. The ledger and the guardrails below are what make $0 actually hold.

| Service | Free allowance | Enough for S0-S6? |
|---|---|---|
| Supabase | 500 MB database, 5 GB egress, 50k monthly users, **2 active projects** | Yes, the 2 projects are exactly dev + staging |
| Cloud Run | 240k vCPU-seconds, 450k GiB-seconds/month | Yes, by a wide margin at dev traffic |
| Cloudflare | Unmetered DDoS, managed WAF, TLS, CDN, DNS | Yes, free forever, no upgrade path needed |
| Resend | 3,000 emails/month, 100/day | Yes, testing won't approach this |
| PostHog | 100k errors/month | Yes |
| GitHub Actions | 2,000 minutes/month (private repos) | Yes, **if** builds are bounded. See guardrails |
| Artifact Registry | 0.5 GB storage | Only with a cleanup policy, Docker images accumulate fast |
| Secret Manager | Small free allowance of versions + access ops | Yes at our scale (~$1/mo worst case) |
| Cloud Logging | 50 GB/month ingest | Yes, with 30-day retention on dev |

*Confirm each allowance at signup in S0. Provider free tiers change, and two of these already changed under us since the May brief.*

### Guardrails, because without these "$0" is a hope, not a plan

1. **GCP billing budget alerts at $1, $5 and $20**, emailing both Bala and Javi. Google Cloud cannot hard-cap spend, so alerting is the only real control. This is the single most important item in S0.
2. **Cloud Run capped**: `--max-instances=3`, `--min-instances=0`, concurrency 80. Bounds the blast radius of a runaway loop or a bot crawl.
3. **Artifact Registry cleanup policy**: keep the last 5 images, delete untagged after 7 days. Otherwise every deploy adds a layer and the 0.5 GB goes silently.
4. **CI builds only on pull requests and `main`**, never on every feature-branch push, with Docker layer caching on. Container builds burn Actions minutes faster than anything else here.
5. **Supabase free tier = dev + staging only.** Production is a paid project, created in S7 and not before.
6. **Test email never reaches a real coach.** Resend test mode or a single seeded inbox throughout S0-S6. A stray loop over real addresses is both a cost event and a reputation event.
7. **Cloudflare in front from S0, not S7.** It is free, and it absorbs bot traffic before that traffic becomes billable Cloud Run seconds.
8. **Free Supabase projects pause after 7 days idle.** Expected on dev; just wake it rather than treating it as an outage.

### What it costs across the project

| Stage | Monthly | Detail |
|---|---|---|
| **S0-S6 · Aug 12 to Sep 27** | **$0** | Every layer inside a free tier, bounded by the guardrails above |
| **S7 · production launch** | **$25** | Supabase Pro. **The first dollar spent on this project**, and only at the point of going live |
| Pilot operation, from Oct | $25-30 | Supabase Pro plus incidental GCP, mostly absorbed by credits |
| Year 2, credits expired | ~$45-70 | Supabase, Cloud Run at real usage, email above 3,000/month |

Supabase's free tier *can* technically run production for a tiny user base, but free projects pause after a week of inactivity, which is exactly wrong for a marketplace a coach checks monthly. **The $25 starts at S7 and not a sprint earlier.**

### Security is architectural here, not purchased

The five controls that decide whether this application is actually secure, ranked by impact. Four are free; the fifth costs about a dollar.

1. **Row-level security in the database.** An application bug stops being a data breach. $0 (comes with Supabase).
2. **Cloudflare in front of everything.** DDoS, WAF, TLS, before traffic ever reaches our code. $0.
3. **No player data in Phase 1** (§4). The most effective privacy control is not holding the data. $0, a scope decision.
4. **Managed auth, never hand-rolled.** Sessions, password reset, and OAuth are where custom code goes wrong. $0.
5. **Secrets in Secret Manager, secret scanning on the repo.** ~$1/mo.

Paid security tooling would add far less than any one of these.

---

*Version 1.2 · 12 August 2026. Scope of record is the August 3, 2026 email and everything after it. This document supersedes the May 29 technical brief where the two conflict. Estimates are engineering estimates, not fixed quotations; §5 and §9 set out where they are most likely to move. Platform pricing verified August 2026. Confirm each free-tier allowance at signup in S0.*
