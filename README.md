# ScrimmApp

The scrimmage marketplace and season planner for Rec, Club, and High School soccer programs in
Southern California. Coaches post open match windows, filter by level/age/radius, connect
directly, and track a reliability score after each match.

This document is written for whoever operates ScrimmApp day to day, not just for a developer
picking up the code. See `docs/PHASE-1-PLAN.md` for the original scope and architecture
decisions.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4), one codebase for UI + API
- **Supabase**: Postgres, Auth (email/password + Google), Realtime, Row-Level Security
- **Drizzle ORM**, migrations committed as reviewable SQL under `src/db/migrations/`
- **Resend** for transactional email (inquiry notifications, replies, password reset)
- **Google Cloud Run** for hosting, deployed via GitHub Actions + Cloud Build
- **PostHog** for error tracking (optional until configured, see "Monitoring" below)

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase and Resend values (every
   variable in that file has a comment explaining where to get it).
3. `npm run db:migrate` to apply migrations to your Supabase project.
4. `npm run dev`, then open `http://localhost:3000`.

Useful scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm run start` | Production build and run, same as what Cloud Run runs |
| `npm run lint` | ESLint |
| `npm run check:dashes` | House style: no em/en dashes anywhere in the repo (see `CLAUDE.md`) |
| `npm run db:generate` | Generate a Drizzle migration from a schema change (see caveat below) |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` / `npm run db:seed-demo` | Seed reference data / demo data |
| `npm run db:studio` | Drizzle Studio, a GUI over the database |
| `npm run db:verify` | Sanity-check the DB connection without touching data |

**Migration caveat:** `drizzle-kit generate`'s snapshot history only goes back to migration
0004; several migrations after that were hand-authored directly. If `db:generate` prompts about
a rename or produces something that looks wrong, write the SQL file by hand (following the
pattern of the existing files in `src/db/migrations/`) instead, and **remember to add a matching
entry to `src/db/migrations/meta/_journal.json`** — the migrator only runs migrations listed
there, so a file without a journal entry silently never applies.

## Deployment

Every push to a branch runs CI (lint, dash check, build) via `.github/workflows/ci.yml`.
Merging to `main` triggers `.github/workflows/deploy.yml`, which builds the container via
`cloudbuild.yaml` and deploys to Cloud Run with secrets injected from GCP Secret Manager
(`DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `PLACES_API_KEY`, and the PostHog keys once
configured). Branch protection on `main` requires CI to pass before merge.

To deploy a change: open a PR, wait for green CI, merge, then watch the `deploy` workflow run
in the Actions tab. There is no manual deploy step.

## Operating the platform

**Database console:** Supabase Dashboard → your project → Table Editor (browse/edit rows) or
SQL Editor (run queries). The `Logs` tab shows Postgres and Auth activity.

**Email delivery:** every transactional send is logged in the `email_log` table
(`status`: queued/sent/failed, plus the Resend `provider_message_id` and any `error`). To check
whether a specific coach's notification went out, query `email_log` by `to_email` or
`related_id`. Resend's own dashboard (resend.com) shows delivery/bounce/open events per message.

**Errors:** if `NEXT_PUBLIC_POSTHOG_KEY` / `POSTHOG_API_KEY` are set (see below), uncaught
errors from the client, server actions, and route handlers all land in PostHog's Error Tracking
tab automatically, no need to read Cloud Run logs to notice something broke. Cloud Logging
(GCP Console → Logging) is the fallback for anything that doesn't reach PostHog.

**Moderation:** Pitch-Side Chat comments run through a server-side profanity filter at
submission time (`src/lib/moderation/profanity-filter.ts`) and can be reported by any signed-in
coach, which immediately hides them (`comments.is_hidden`). To review or restore a hidden
comment, edit the row directly in the Supabase Table Editor.

**Cancellations:** every cancelled listing keeps its row and gains a `cancellations` record with
a reason code, so repeat last-minute pull-outs are visible in that table rather than disappearing
with the listing.

## Monitoring setup (PostHog)

Not required to run the app, but recommended before real coaches are using it in production:

1. Create a free project at posthog.com (100k events/month free, no card).
2. Project Settings → Project token → use the same value for both `NEXT_PUBLIC_POSTHOG_KEY`
   (client-side) and `POSTHOG_API_KEY` (server-side). PostHog's SDKs authenticate event capture
   with this one write-only project token; a personal API key is a different thing (PostHog's
   own management REST API) and isn't needed here.
3. Add that, plus `NEXT_PUBLIC_POSTHOG_HOST` / `POSTHOG_HOST` (default `https://us.i.posthog.com`
   unless you picked the EU region), to Secret Manager and the deploy workflow's
   `--set-secrets` list alongside the existing ones.

Until these are set, every capture call in the app no-ops safely, there is no error either way.

## Project structure

```
src/app/            Routes (App Router): board, listings, inbox, posts, calendar, venues, profile
src/components/      UI components, grouped by feature (board, inbox, profile, etc.)
src/db/schema/       Drizzle table definitions
src/db/migrations/   Hand-reviewable SQL migrations + journal
src/db/queries/       Read queries
src/lib/actions/      Server actions (the app's write path)
src/lib/email/        Resend client + email templates
src/lib/moderation/   Profanity filter
src/lib/monitoring/    PostHog server-side capture
```
