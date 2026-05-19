# Handover: Replit → GCP+Supabase Migration (Landing Page)

**Created:** 2026-05-17
**Hand-off reason:** Context window getting large; new session starts fresh.
**For:** The next agent picking this up.

---

## 0. Read these first (in order)

1. `/Users/wangbo-ting/git/langgraph-dev-navigator/AGENTS.md` — **collaboration norms (mandatory)**
2. This file
3. `memory/tasks/story_create_landing_page/replit_migration_spike.md` — single source of truth for all decisions
4. `memory/tasks/story_create_landing_page/META_DOC.md` — broader story context
5. `memory/tasks/epic_user_experience/project_management_guide.md` — Epic → Story → Task model + spike adaptation rule

Do not read everything in `memory/tasks/story_create_landing_page/` immediately — many files are historical (multiple superseded plan iterations). Pull on demand.

---

## 1. Mission (TL;DR)

User pays ~$20/mo to Replit hosting a landing page (Express + Postgres + static frontend). Migrating to **Google Cloud Run (host) + Supabase (Postgres)** to drop monthly cost to ~$0-$1. Domain may change. Zero customers currently; SEO/data-preservation requirements are minimal.

Scope: hosting + DB migration only. Not redesigning the app, not redoing AEO/SEO content.

---

## 2. Decision status snapshot

### ✅ LOCKED (do not re-litigate without strong new evidence)

| Decision | Resolution | Where it's recorded |
|----------|-----------|---------------------|
| Hosting platform | **Cloud Run monolith** (Express serves API + static together) | spike §4 Option A SELECTED |
| Database | **Supabase Postgres**, session pooler on port 5432 | spike §5 |
| Data migration | **None.** No prod data to migrate. Recreate schema on first Cloud Run boot via existing `CREATE TABLE IF NOT EXISTS`. | spike §1.5, §5 |
| Replit shutdown buffer | **Skip.** Immediate cutover, accept stray 404s (zero customers in 6 months) | spike §6 Path 2 PREFERRED |
| GA4 | Carry forward existing measurement ID | spike §1.5 |
| Admin page (Q5) | **Keep as-is.** Just set `ADMIN_PASSWORD` env var on Cloud Run. Migration-day = zero special handling. Hardening backlog deferred. | spike §11 |
| Firebase Hosting/Functions/App Hosting | Evaluated, all rejected for this case | spike §4 Options C1/C2/C3 |
| Vercel | Evaluated, rejected — Hobby ToS forbids commercial use (waitlist = commercial); Pro = $20/mo eliminates savings; also 3-5× refactor cost | spike §4 Option D |
| GitHub Pages split | Evaluated, rejected vs Cloud Run monolith for this traffic level | spike §4 Option B |

### ❓ STILL OPEN (block Story 8 plan generation)

- **Q3 — Domain choice:**
  - (a) free `*.run.app` subdomain
  - (b) custom domain (~$12/yr) **← my recommendation in spike**
  - (c) `username.github.io` (only if revisiting Option B — but Option B is rejected, so this is moot)
- **Q4 — GCP deploy mode the user already uses:** `gcloud run deploy --source` / Docker image + Artifact Registry push / Cloud Build trigger from GitHub? User mentioned they "deploy other apps on google cloud" — match their existing pattern.

These are the only two blockers. Ask first thing.

---

## 3. Immediate next actions (in order)

1. **Greet briefly, confirm you've read this handover + the spike** so user knows context didn't get lost.
2. **Ask Q3 and Q4** (above). Don't propose work until answered.
3. **Once answered:**
   - Update spike §2 (mark Q3/Q4 `[x]`), §10 exit criteria
   - Write `replit_migration_plan.md` (Story 8 spec) in same folder — see structure below
   - Update `implementation_plan_replit.md` to add Story 8 entry; mark Story 5's `[ ] Choose hosting stack` as "moved to Story 8"
   - Update `META_DOC.md` §6/§7 pattern by adding a new section pointing at the migration artifacts
4. **Do NOT start writing code or modifying `api/`, `web/replit/` yet** — Story 8 spec needs user approval first (per `project_management_guide.md` workflow).

### Story 8 spec structure (draft this when ready)
Follow existing patterns in `implementation_plan_replit.md` (e.g., Story 6/7):
- Objective
- Dependencies (spike completion)
- Acceptance Criteria (Cloud Run deployed, Supabase connected, admin works, GA4 firing, old replit.app shut down)
- Locked Context (domain choice, deploy mode, etc.)
- Tasks (checklist — see §5 in this handover for the concrete change inventory)

---

## 4. Code-change inventory (from spike §7, for Story 8 task list)

When the time comes to execute, the code work breaks down as:

### Hosting / build config
- [ ] Add `Dockerfile` for `api/` (Node 20, copy `api/` + `web/<landing>/`, expose 8080, `npm start`)
- [ ] Add `.dockerignore`
- [ ] Decide on deploy method per Q4 answer

### Code refactor (small)
- [ ] Rename `web/replit/` → `web/landing/` (or similar non-Replit name)
- [ ] Update `api/server.js:54` static path
- [ ] Update `api/server.js:467` SPA fallback path
- [ ] Change `PORT` default to `8080` in `server.js` (Cloud Run convention)
- [ ] Update `web/<landing>/assets/js/main.js:535` log string (kills "Replit" mention)
- [ ] Update `web/<landing>/assets/js/survey.js:793` `data-page` check (`replit-thank-you` → `landing-thank-you` or whatever)
- [ ] Update `data-page="replit-*"` attrs in `index.html`, `thank-you.html`, `privacy.html`, `admin.html`

### Brand/copy cleanup
- [ ] Remove "Replit Edition" badge from `index.html:161`, `thank-you.html:31`, `privacy.html:30`
- [ ] Update `privacy.html:71-75` hosting language ("deployed on Replit infrastructure" + link to Replit Privacy Policy)

### Canonical URL / SEO sweep (depends on Q3 domain)
- [ ] All `<link rel="canonical">` tags (index, thank-you, privacy, admin)
- [ ] All `og:url` meta tags
- [ ] All JSON-LD `@id` URLs in `index.html` (5 nodes: Organization, SoftwareApplication, FAQPage, VideoObject, WebPage)
- [ ] `sitemap.xml` URLs
- [ ] `robots.txt` `Sitemap:` line

### Database / env
- [ ] Set Cloud Run env vars: `DATABASE_URL` (Supabase session pooler), `ADMIN_PASSWORD`, `FRONTEND_URL`, `NODE_ENV=production`
- [ ] Verify smoke test of 5 endpoints: `/api/health`, `/api/join-waitlist`, `/api/verify-user/:id`, `/api/submit-survey`, `/api/analytics`

### Cleanup
- [ ] Delete `.replit` (or rename to `legacy_replit.md.txt` for history)
- [ ] Delete `replit.md` (or rename)
- [ ] Consider rotating `.env` API keys (OpenAI / Google / Tavily / Perplexity) — they sit in working tree even though gitignored

### Post-deploy
- [ ] GSC: verify new domain, submit new sitemap (no Change-of-Address needed; no rankings on replit.app to preserve)
- [ ] Add new domain to GA4 property's domain list
- [ ] Shut down Replit deployment

---

## 5. Already evaluated — DO NOT REDO

These were investigated with web research (exa MCP) and analyzed at length. The spike has the full reasoning. Don't waste cycles re-investigating:

- **Vercel** — rejected for ToS reasons (Hobby = non-commercial only; waitlist = commercial per Vercel's published definition). Spike §4 Option D has the "When Vercel IS the right choice" reference table for future use.
- **Firebase Hosting + Cloud Run rewrites** — small CDN gain but doubles deploy targets; at current traffic the gain is invisible. Easy to upgrade later from Cloud Run monolith if Lighthouse shows real LCP problem.
- **Firebase Functions, Firebase App Hosting** — wrong fit for plain Express + static.
- **GitHub Pages** — rejected vs Cloud Run monolith.
- **`pg_dump` data migration** — unnecessary; no prod data.
- **Replit 301 redirect buffer** — rejected; zero customers means no value worth the $20-40 buffer cost.
- **Killing admin.html (Option C for Q5)** — rejected; dashboard's curated UX (stat cards + feature popularity + auto-refresh) outweighs the LOC savings.

---

## 6. User profile + collaboration norms

From `AGENTS.md` (must follow):
- **Reply in Chinese; terms stay in English.** Tool / file operations stay in English.
- **Brutally honest.** No softening. No hedge for harmony. If you disagree with the user's intuition, say so with reasons. If you change your mind under their pushback, say "I was wrong about X because Y" rather than silently flipping.
- **First-principles thinking; avoid analogies unless they clarify.**
- **Score each claim internally: +1 verified, -9 false/speculative.** Admit "I'm not sure" explicitly when uncertain. Never assert as fact what you only suspect.

Observed working style:
- User asks questions, expects concrete answers backed by code reading or web verification — not vibes.
- Tends to push back on over-engineering. Expect them to challenge sweeping recommendations.
- Comfortable making the final call themselves once given clear options + tradeoffs.
- Reads docs carefully — so write docs that earn their attention (concrete, no fluff).

Tools that the user expects you to use:
- **exa MCP** for web research (skill file at `/Users/wangbo-ting/.claude/skills/learned/exa-mcp-large-result-parsing.md` — note the recommended params + the result-overflow parsing pattern; results >50KB will overflow and need Python parsing)
- Direct file reads / greps for code questions (don't speculate when code is right there)

---

## 7. Context the next agent will probably want

### Replit setup (current state, to be replaced)
- `.replit` file: `deploymentTarget = "cloudrun"`, runs `cd api && npm install && npm start`, ports 3001/5000→80
- `replit.md`: user-facing project doc maintained by Replit's agent
- Replit Postgres tables: `users`, `survey_submissions`, `survey_responses`, `analytics` (created idempotently at boot by `api/database.js:84-133`)
- Replit Secrets currently providing: `DATABASE_URL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `NODE_ENV`, `PORT`

### App architecture (won't change in migration)
- Single Node/Express process (`api/server.js`) does both API + static serving
- Frontend in `web/replit/` (folder will rename in migration)
- 5 public API endpoints + 4 admin endpoints (all `/api/admin/*` protected by `x-admin-password` header)
- Frontend already supports configurable API base via `<meta name="api-base">` (no current page sets it, so falls back to `window.location.origin` — same-origin works on Cloud Run monolith)

### Pre-existing tech debt (out of scope for migration but mentioned in case)
- `bcrypt` listed in `api/package.json` but never used (orphan dep)
- `/api/admin/*` endpoints lack rate limiting (only waitlist/survey have it)
- Plaintext password compare (`!==`) instead of `crypto.timingSafeEqual`
- Story 7 in `implementation_plan_replit.md` has an unticked `[ ] Document admin exposure mitigation path` — this becomes part of the migration-follow-up backlog in spike §11

### SEO/AEO state
- Stories 6 and 7 in `implementation_plan_replit.md` already shipped (JSON-LD schema, GSC verification, sitemap submission for replit.app)
- All canonical URLs / `@id` / `og:url` currently hardcoded to `langgraph-dev-navigator.replit.app` — will be rewritten in Q3 sweep
- GA4 just added (commit `bc38380`)

### `.env` file warning
- `.env` is `.gitignore`d but sits in working tree with real API keys (OpenAI, Google, Tavily, Perplexity). Suggest rotation independent of migration.

---

## 8. Files cheat-sheet

```
memory/tasks/story_create_landing_page/
├── replit_migration_spike.md              ← single source of truth (DECISIONS)
├── replit_migration_handover.md           ← this file
├── replit_migration_plan.md               ← TO BE WRITTEN after Q3+Q4 (Story 8 spec)
├── implementation_plan_replit.md          ← parent story; add Story 8 entry after spike closes
├── META_DOC.md                            ← story index; add migration section after spike closes
└── (many other historical / sibling files — read only on demand)

api/
├── server.js          ← Express app (470 LOC)
├── database.js        ← Postgres client + schema init
└── package.json       ← Node deps

web/replit/            ← will rename to web/landing/ or similar
├── index.html
├── thank-you.html
├── privacy.html
├── admin.html
├── robots.txt
├── sitemap.xml
└── assets/js/{main,survey}.js

.replit                ← Replit-specific, to be removed
replit.md              ← Replit-specific, to be removed
AGENTS.md              ← collaboration norms (mandatory read)
```

---

## 9. First message to send the user

Suggested first message (adapt to your style, keep brief):

> 接手了。已讀 spike + handover。確認還卡在兩個決定：
>
> **Q3 — 域名**：用 free `*.run.app`？還是買 custom domain（~$12/yr，spike 推薦）？
>
> **Q4 — 你既有 GCP app 怎麼 deploy 的**？`gcloud run deploy --source` / Docker image + Artifact Registry push / Cloud Build GitHub trigger？想跟你既有 pattern 一致。
>
> 這兩個回完就能 close spike + 產出 Story 8 執行 plan。

---

## 10. If something doesn't match this handover

The spike file is authoritative. If this handover and the spike disagree, trust the spike — this handover may be slightly stale. Update this file or flag the conflict to the user.
