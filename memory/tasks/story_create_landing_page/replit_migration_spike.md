# Spike: Migrate Landing Page Off Replit → GCP (Cloud Run) + Supabase

**Status:** In Progress (Investigation)
**Created:** 2026-05-16
**Story parent:** `story_create_landing_page`
**Type:** Spike (time-boxed investigation; deliverable = knowledge + decisions)
**Driver:** Cost — currently ~$20/month on Replit (DB-heavy), expected $0 on GCP/Supabase free tier given low traffic.

> Per `epic_user_experience/project_management_guide.md`: once this spike resolves, either fold execution into a new `replit_migration_plan.md` under this story, or promote to a new epic if scope explodes.

---

## 1. Goal & Constraints

### Goal
Move landing page (frontend + waitlist/survey API + Postgres) off Replit ($20/mo) onto:
- **Hosting:** Google Cloud Run (user already deploys other apps on GCP, free tier covers low traffic)
- **Database:** Supabase Postgres (user already has Supabase data, free tier likely sufficient)
- **Optional split:** GitHub Pages for static frontend, Cloud Run for API only

### Constraints
- Zero (or near-zero) monthly cost target
- Domain can change (no requirement to preserve `langgraph-dev-navigator.replit.app`)
- ~~Must preserve waitlist + survey data — no data loss~~ → **Resolved:** No production data to preserve (see §1.5)
- GA4 measurement (just added in `bc38380`) must continue working
- Search Console verification + sitemap need to be re-established for new domain (existing GSC property is replit.app)

### Out of scope for spike
- Actually migrating (this is investigation only)
- Re-doing SEO/AEO from scratch (preserve as much as possible)
- Replacing the Express stack with a different framework

---

## 1.5 Decisions Locked (2026-05-16)

Captured from conversation after initial spike draft:

- **No data migration:** Replit Postgres has no production-ready data. Recreate schema on Supabase from scratch — no `pg_dump` / restore.
- **No traffic-preservation requirement:** Zero customers for ~6 months; existing replit.app traffic ≈ 0; acceptable to skip 301 redirect setup entirely (see §6 revised).
- **Supabase auto-pause acceptable:** Manual reactivation on 7-day idle is fine for current usage profile.
- **Hosting decision: Cloud Run direct (Option A)** — Firebase Hosting + Cloud Run (Option C1) evaluated but rejected for this case. See §4 for full reasoning.
- **GA4 not migration-critical:** Same measurement ID can be carried forward; not a blocker.
- **Open: domain (Q3), GCP deploy mode (Q4), admin page placement (Q5)** — spike not yet closeable.

---

## 2. Open Questions for User (block migration plan)

- [x] **Q1 — Replit Postgres access window:** N/A. No production data to migrate. Schema recreated fresh on Supabase.
- [x] **Q2 — Data volume estimate:** N/A. No production data.
- [ ] **Q3 — Domain choice:** (a) free `*.run.app`, (b) custom domain (~$12/yr), or (c) `username.github.io`?
- [x] **Q4 — GCP deploy mode:** `gcloud run deploy --source` as primary; Cloud Console for first-time service setup. Region: `us-central1`. See §12 for full reasoning.
- [x] **Q5 — Admin page (`admin.html`) placement:** Keep as-is on same Cloud Run host (Option A). Migration day = just set `ADMIN_PASSWORD` env var. See §11 for full reasoning and follow-up hardening backlog.
- [x] **Q6 — GA4 measurement ID:** Not migration-critical. Carry forward existing ID.

---

## 3. Current Replit Coupling Inventory (verified 2026-05-16)

### Hosting / Build Config
- `.replit` — defines `cloudrun` deploymentTarget, ports, workflow, Nix packages
- `replit.md` — Replit-rendered project doc

### Code-level Replit references
- `api/server.js:54` static dir hardcoded `../web/replit`
- `api/server.js:467` SPA fallback → `web/replit/index.html`
- `api/server.js:517-518` startup log strings
- `web/replit/assets/js/main.js:535` log string
- `web/replit/assets/js/survey.js:793` page detection via `data-page === 'replit-thank-you'`
- HTML `data-page="replit-*"` attrs across `index.html`, `thank-you.html`, `privacy.html`, `admin.html`
- "Replit Edition" badge in `index.html:161`, `thank-you.html:31`, `privacy.html:30`
- `privacy.html:71-75` mentions "deployed on Replit infrastructure" + link to Replit Privacy Policy

### Canonical URL bound to `langgraph-dev-navigator.replit.app`
- `index.html` (`<link rel=canonical>`, `og:url`, JSON-LD `@id` × 5 nodes)
- `thank-you.html`, `privacy.html`, `admin.html` (`<link rel=canonical>`)
- `sitemap.xml`, `robots.txt`

### Environment variables (Replit Secrets today)
| Var | Use | Source after migration |
|-----|-----|------------------------|
| `DATABASE_URL` | Postgres connection | Supabase connection string |
| `ADMIN_PASSWORD` | admin auth header | Cloud Run env var or Secret Manager |
| `FRONTEND_URL` | CORS origin | New domain |
| `NODE_ENV` | toggles SSL | `production` |
| `PORT` | server port | Cloud Run injects `8080` by default |

### Data (Replit-managed Postgres)
- Tables auto-created at boot (`api/database.js:84-133`): `users`, `survey_submissions`, `survey_responses`, `analytics`
- No migration tool — schema is `CREATE TABLE IF NOT EXISTS`

### `.env` working tree
- Not git-tracked (`.gitignore`), but contains 5 live API keys (OpenAI, Google, Tavily, Perplexity) — recommend rotation regardless of migration

---

## 4. Hosting Options Comparison

### Option A — Cloud Run monolith (Express serves both API + static) ✅ **SELECTED**
**What changes:** Build a Docker image (or `gcloud run deploy --source`), set env vars, point DNS.
**Pros:**
- Smallest code delta — just `web/replit` rename + canonical URL swap + Dockerfile/`.gcloudignore`
- Single origin → no CORS complexity
- Cloud Run free tier (2M req/mo, 360k vCPU-sec/mo) easily covers landing-page traffic
- Scale-to-zero → cold start ~1-3s acceptable for landing page
- Same hosting as user's other GCP apps → operational consistency
**Cons:**
- Cold start on every idle period (mitigation: min-instances=0 stays free; min-instances=1 costs ~$5-10/mo)
- Static files served by Node (slightly slower than CDN)
**Cost estimate:** $0/mo at current traffic; domain TLD ~$12/yr if custom.

### Option B — Split: GitHub Pages (frontend) + Cloud Run (API only)
**What changes:** Strip static serving from Express, deploy `web/` to Pages, point landing JS to Cloud Run API URL via `<meta name="api-base">` (frontend already supports this).
**Pros:**
- Static frontend served via GitHub CDN → fast, free, no cold start
- Cloud Run only handles 5 API endpoints → smaller image, lower resource usage
- Clearer separation of concerns
**Cons:**
- Two deploys to coordinate (Pages + Cloud Run)
- CORS configuration required (`FRONTEND_URL` must list GitHub Pages origin)
- GitHub Pages doesn't support custom server logic → admin protection moves to API only (page itself is public static)
- `*.github.io/repo` URL is ugly; custom domain needs DNS for both apex (Pages) and subdomain (Run)
**Cost estimate:** $0/mo; domain extra.

### Option C1 — Firebase Hosting (static) + Cloud Run (API, via rewrites)
**What changes:** Strip static serving from Express → Firebase Hosting serves static via CDN; `firebase.json` `rewrites` route `/api/**` to Cloud Run service (same origin, no CORS).
**Pros:**
- Static via Firebase CDN → fastest TTFB / LCP for static assets
- Same origin via rewrites → no CORS work
- Still scale-to-zero on the API
- Free tier: 10 GB storage, 360 MB/day egress
**Cons:**
- Two deploy targets to coordinate (`firebase deploy` for hosting + Cloud Run deploy for API)
- Extra `firebase.json` config to maintain
- Slight learning curve if user hasn't used Firebase Hosting before
**Cost estimate:** $0/mo.

### Option C2 — Firebase Hosting + Cloud Functions (Express via `onRequest`)
**What changes:** Wrap Express app in `functions.https.onRequest(app)`; deploy via Firebase Functions.
**Pros:** All-in-one Firebase workflow.
**Cons:**
- Postgres connection pooling in Functions is harder than Cloud Run (function instances can fork unexpectedly; pool-per-instance approaches differ)
- User already operates Cloud Run, not Functions → new platform learning curve
- No benefit vs Cloud Run for an Express app
**Verdict:** Not recommended.

### Option C3 — Firebase App Hosting (GA Oct 2024, SSR-focused)
**What changes:** GitHub-integrated CI for SSR frameworks (Next.js, Angular); backed by Cloud Run under the hood.
**Pros:** Polished DX for SSR apps.
**Cons:** Designed for SSR frameworks; using it for plain Express + static is overkill and adds an opaque abstraction layer.
**Verdict:** Not recommended for this stack.

### Option D — Vercel (Hobby or Pro) ❌ **REJECTED — ToS risk + refactor cost**

**Investigated 2026-05-17. Verified facts from Vercel's own docs:**

**Hobby plan commercial-use restriction (the showstopper):**
> "Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan." — `vercel.com/docs/limits/fair-use-guidelines`

Vercel defines commercial usage as *"any Deployment that is used for the purpose of financial gain of anyone involved in any part of the production of the project."* A community thread documented Vercel staff ruling that even a 5-page static site showcasing a self-employed business's services counts as commercial — no direct monetary benefit required. A **waitlist for a future paid product** falls squarely inside this definition. Risk: getting paused and forced to Pro plan (~$20/mo), eliminating the entire cost-saving goal of this migration.

**Hobby free-tier limits (verified Oct 2025):** 100 GB Fast Data Transfer; 100 GB-Hrs Function Execution; 4 active CPU hours; 1M invocations; 120s function timeout. Generous, but limits are irrelevant if ToS gets you paused.

**Technical refactor cost compared to Cloud Run:**

| Item | Cloud Run | Vercel |
|------|-----------|--------|
| Hosting model | Long-running container | Serverless function per request |
| Express change | ~zero (Dockerfile + PORT default) | Wrap as `api/index.js` or split to file-based routes |
| Postgres client | Existing `pg.Client` keeps working | **Must refactor**: each cold start = new connection; need Supavisor **transaction pooler (port 6543)** + change `pg.Client` → `pg.Pool` or per-request connect/end |
| Config | `Dockerfile` | `vercel.json` + possible folder reorganization |
| Vendor lock-in | Zero (standard Docker, portable) | Moderate (`vercel.json`, file-based routing, temptation to use `@vercel/postgres`) |
| Static CDN | None (Express serves) | Best-in-class |
| GitHub deploy DX | Manual setup of Cloud Build trigger | Out of the box |
| Estimated refactor effort | ~1 hour | ~half day to a day |
| **ToS risk for this project** | **None** | **High (commercial waitlist)** |

**Why rejected for THIS case (priority order):**
1. **ToS risk eliminates the cost saving.** Vercel's commercial-use definition catches commercial-intent waitlists. If flagged → forced to Pro $20/mo → identical cost to Replit.
2. **3-5× refactor cost vs Cloud Run** (Express → serverless + pg connection model rewrite vs just adding a Dockerfile).
3. **Vendor lock-in moderate; Cloud Run zero.** Cloud Run = portable Docker; future moves to Fly.io / Railway / DO Apps cost nothing.
4. **Operational inconsistency** — user already runs other apps on GCP; introducing Vercel adds a second platform.

### Vercel IS the right choice when... (for future reference)

Critical filter applied to community advice — much online enthusiasm (*"90% of startups should start with Vercel"*) tacitly assumes Next.js stack + non-commercial-yet status, which is not universal. The honest fit profile:

**Strong fit:**
- Stack is Next.js / Nuxt / SvelteKit / Astro (Vercel-native meta-frameworks; ISR, image optimization, edge runtime all just work)
- Project is non-commercial (personal portfolio, OSS docs, blog, hobby experiment) — Hobby ToS aligns
- Frontend-heavy with a thin, stateless API surface (contact form, AI proxy, simple webhooks)
- Team is mostly frontend developers; Dockerfile/infra is friction
- Spiky / unpredictable traffic where pay-per-invocation beats min-instance container cost
- PR-preview-per-branch is a critical workflow (Vercel's auto-preview is industry-leading)
- Global edge latency matters more than persistent connections

**Weak fit (where Vercel is fighting against the architecture):**
- Long-running Express/Fastify/Koa server with persistent DB connection assumptions (this project)
- Requests > function timeout (60–120s depending on plan)
- WebSockets, server-sent events long-polling
- Background jobs / cron at any meaningful scale (Pro has cron, but limited)
- Heavy compute per request (cost balloons via invocation × duration billing)
- Team already invested in another cloud (GCP/AWS) — operational consistency outweighs DX gain
- Commercial product on Hobby tier — ToS pushes to Pro

**Community claims that need filtering:**
- *"90% of startups should start with Vercel"* — implicitly assumes Next.js + non-commercial-prototype phase. False as universal advice; depends on stack and commercial intent.
- *"Vercel costs explode at scale"* — half-truth. Costs explode when bandwidth × invocations × duration grow. Low-traffic projects on free tier stay free; the trap is **unpredictable** bandwidth/invocation overages on Pro, not gradual cost creep.
- *"Cloud Run is more complex than Vercel"* — half-truth. With Dockerfile + `gcloud run deploy`, Cloud Run is *simpler* than Vercel + Express because no serverless refactor. Cloud Run gets more complex *when* you add Cloud Armor, VPC, custom domains — i.e., complexity scales with requirements, not baseline.
- *"Vercel locks you in completely"* — overstated. Lock-in is moderate (`vercel.json`, file-based routing). Avoid `@vercel/*` SDKs and lock-in stays tractable.

**Bottom line — would I recommend Vercel for a future project?** Yes, if it's Next.js + non-commercial. For Express + commercial product, Cloud Run wins on cost-certainty, refactor cost, and portability.

### Decision: Option A — Cloud Run monolith

**Why C1 was rejected even though it has real upsides:**
- Current traffic ≈ 0 → CDN advantage on static is unobservable in practice
- LCP cold-start penalty only hits *first* visitor in any idle window; with ~0 visitors, this is a non-issue
- C1 doubles the deploy targets (hosting + run) for benefits that don't yet materialize at this traffic level
- Migration cost from A → C1 later is low: only a `firebase.json` + remove `express.static` line. **Easy to upgrade later if Lighthouse reveals a real LCP problem.**

**Why C2 / C3 were rejected:** added complexity without benefit for an Express + static workload, and inconsistent with user's existing Cloud Run operational pattern.

**Reconsider C1 if:** post-launch Lighthouse shows LCP > 2.5s caused by static asset delivery, or if traffic grows past Cloud Run free tier compute headroom.

---

## 5. Database Setup on Supabase (no migration)

**Decision (2026-05-16):** No production data to preserve. Recreate schema fresh on Supabase. `pg_dump` / restore not needed.

### Path
1. **Create Supabase project** (or reuse existing) → get connection string for **session pooler on port 5432** (Supavisor session mode, compatible with current `pg.Client`)
2. **Run schema creation** — easiest path is to let `api/database.js:84-133` (`initializeTables()`) run on first Cloud Run boot. It uses `CREATE TABLE IF NOT EXISTS` so it's idempotent and safe.
3. **Set Cloud Run env** `DATABASE_URL` = Supabase session-pooler string, `NODE_ENV=production` (enables `ssl: { rejectUnauthorized: false }` per `database.js:16`).
4. **Smoke test** the 5 endpoints: `/api/health`, `/api/join-waitlist`, `/api/verify-user/:id`, `/api/submit-survey`, `/api/analytics`.

### Connection string format reminder
Supabase exposes:
- **Direct connection** (`db.<ref>.supabase.co:5432`) — IPv6 by default on free tier (may need IPv4 add-on)
- **Connection pooler / Supavisor** (`aws-0-<region>.pooler.supabase.com:6543` transaction mode, `:5432` session mode) — recommended for serverless / Cloud Run because of connection limits

**For Cloud Run + node-pg**, use **session pooler on port 5432** (matches current `pg.Client` connection style; transaction pooler breaks prepared statements).

### Schema notes (no changes needed)
- `INET` and `UUID` types are built-in Postgres — no extension required
- `BIGSERIAL` works on Supabase
- No pgvector / RLS / auth complexity — purely data tables
- Optional follow-up (not blocking migration): replace boot-time `CREATE TABLE IF NOT EXISTS` with a committed SQL migration file under `api/migrations/`. Better long-term hygiene but not on the critical path.

### Open verification items
- [ ] Confirm Cloud Run egress to Supabase stays well under free-tier 5GB Supabase egress cap (expected: trivial at current traffic)
- [ ] Confirm IPv4/IPv6 connectivity from Cloud Run to Supabase pooler endpoint (pooler supports both; direct connection prefers IPv6)

---

## 6. Domain & SEO Migration Strategy

### Scenarios
**S1 — New custom domain** (e.g., `langgraph-dev-navigator.com` or similar)
- Set 301 redirect from `langgraph-dev-navigator.replit.app` → new domain (only works while Replit deployment is still up; **set up before stopping payment**)
- New GSC property + verification + sitemap submission
- Use GSC "Change of Address" tool to signal migration
- Rewrite canonical / `og:url` / JSON-LD `@id` to new domain (already inventoried in §3)
- Update `sitemap.xml`, `robots.txt` sitemap reference
- **Risk:** Search rankings dip 2-8 weeks during reindex; well-handled redirects minimize loss

**S2 — Free Cloud Run subdomain** (`langgraph-dev-navigator-<hash>-<region>.run.app`)
- Free, but ugly URL hurts brand
- All canonical / JSON-LD rewrites still required
- Hard to "Change of Address" in GSC to a Cloud Run domain (Google treats `.run.app` as low-trust subdomain pool)
- **Not recommended for a landing page that wants SEO.**

**S3 — Free GitHub Pages subdomain** (`<user>.github.io/<repo>`)
- Only relevant if going Option B (split)
- Same trust/SEO concerns as S2
- **Not recommended for SEO-driven landing page.**

### Recommendation
**S1 — buy a custom domain.** $12/yr is rounding error vs. $240/yr saved from Replit, and preserves the AEO/SEO work already done (Story 6 + Story 7).

### Replit shutdown buffer — revised after 2026-05-16 discussion

Original plan assumed a 1-2 month buffer where Replit serves 301 redirects to the new domain. Two paths considered:

**Path 1 — Keep Replit running 1-2 months for redirects**
- Cost: ~$20 × 1-2 = $20-$40 (mostly DB; could possibly be reduced by stripping DB usage from the Replit Express app and making it a pure redirect server)
- Benefit: catches any stray visitor, preserves any residual SEO authority on replit.app

**Path 2 — Shut down Replit immediately, accept stray 404s** ✅ **PREFERRED**
- Cost: $0 buffer, immediate $20/mo savings start
- Risk accepted: zero customers in past 6 months + replit.app rankings haven't been audited as load-bearing → expected lost-visitor count ≈ 0
- The ~$40 saved buys 3+ years of custom domain renewal

**Selected: Path 2.** Skip the buffer. Cut over and shut down Replit.

### Pre-migration SEO checklist (revised)
- Decide domain ahead of cutover (Q3 still open)
- Rewrite all canonical / JSON-LD `@id` / og:url to new domain in one commit
- Verify new domain in GSC, submit new sitemap (no "Change of Address" tool needed since old property has no rankings to migrate)
- Carry forward GA4 measurement ID; add new domain to GA4 property's domain list
- Update `sitemap.xml` and `robots.txt` sitemap reference to new domain

---

## 7. Code Changes Required (estimate)

### Mandatory
- [ ] Rename `web/replit/` → `web/landing/` (or similar) + update `server.js:54`, `:467`
- [ ] Strip "Replit Edition" badges and copy
- [ ] Update `privacy.html` hosting/legal language
- [ ] Update `data-page` attrs and `survey.js:793` page check
- [ ] Rewrite canonical URLs / JSON-LD `@id` / og:url to new domain (sweep all HTML + sitemap + robots)
- [ ] Add `Dockerfile` + `.dockerignore` (or `cloudbuild.yaml` / source-deploy config)
- [ ] Set `PORT` default to `8080` in `server.js` (Cloud Run convention)
- [ ] Update `FRONTEND_URL` CORS default
- [ ] Add Supabase SSL cert handling if needed (`pg` already handles `ssl: { rejectUnauthorized: false }`)

### Optional / hygiene
- [ ] Remove `.replit`, `replit.md` (or rename to `legacy_replit.md` for history)
- [ ] Replace ad-hoc `CREATE TABLE IF NOT EXISTS` with a migration file (committed SQL) — better long-term, but not blocking
- [ ] Add `npm test` placeholder, eslint config, CI workflow

### Estimated effort
- Hosting + deploy config: 0.5 day
- Code refactor (folder rename, log strings, canonical URL sweep): 0.5 day
- Data migration + verification: 0.5 day
- Domain + DNS + GSC re-verification: 0.5 day
- Testing + smoke checks: 0.5 day
- **Total: ~2.5 days** assuming no surprises

---

## 8. Cost Comparison

| Item | Replit (current) | GCP + Supabase target |
|------|------------------|------------------------|
| Hosting | bundled in $20 | $0 (Cloud Run free tier) |
| Database | bundled (likely main cost driver) | $0 (Supabase free tier, 500MB) |
| Domain | $0 (uses `.replit.app`) | $12/yr (~$1/mo) if custom, else $0 |
| Shutdown buffer | — | $0 (Path 2 — immediate cutover, see §6) |
| GA4 | $0 | $0 |
| GSC | $0 | $0 |
| **Total** | **~$20/mo** | **$0-$1/mo** |
| **Annual saving** | — | **~$228/yr (custom domain) or ~$240/yr (no custom)** |

### Where Cloud Run could start charging
- > 2M requests / month
- > 360k vCPU-seconds / month (typically requires sustained traffic)
- `min-instances ≥ 1` config (keeps warm but costs ~$5-10/mo)
- Outbound networking > 1 GB/month within North America (Cloud Run free tier is generous here)

### Where Supabase could start charging
- DB size > 500MB
- Egress > 5GB/month
- > 2 active projects (only need 1)
- Auto-pauses after 7 days inactivity on free tier; auto-resumes on first request (~30s cold). **Accepted by user — manual reactivation tolerable.**

---

## 9. Risks & Mitigations (revised 2026-05-16)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Stray visitor lands on dead replit.app domain after cutover | Low | Low | Accepted (Path 2). Zero customers in 6 months → expected lost visits ≈ 0. |
| Cloud Run cold start hurts CTA conversion | Low | Low | LCP affected by ~1-2s on first visit; mitigate with `min-instances=1` (~$5/mo) only if data shows conversion drop |
| Supabase free tier auto-pauses after 7d inactivity | Medium | Low | Accepted. Manual reactivation tolerable per user. |
| Postgres connection limits exhausted by Cloud Run scaling | Low | Medium | Use Supabase Supavisor session pooler (port 5432) |
| First-boot `CREATE TABLE` race when Cloud Run scales from 0 to multiple instances simultaneously | Low | Low | `CREATE TABLE IF NOT EXISTS` is idempotent. Worst case: one transient error logged. Optional: run schema manually in Supabase SQL editor before first deploy. |
| `.env` API keys leaked via local copies | Unknown | Medium | Rotate OpenAI / Google / Tavily / Perplexity keys regardless of migration |

### Risks removed since initial draft
- ~~Data loss during dump/restore~~ — no data to migrate
- ~~Replit account suspended before dump~~ — no data to dump
- ~~SEO ranking drop on domain switch~~ — no measurable rankings exist on replit.app (zero customers, six months)

---

## 10. Spike Exit Criteria

This spike is **done** when:
- [ ] All Q1–Q6 answered
- [ ] Hosting option chosen (A / B / C)
- [ ] Domain strategy chosen (S1 / S2 / S3)
- [ ] Supabase free-tier sufficiency confirmed against actual data volume
- [ ] `replit_migration_plan.md` (execution Story 8 spec) drafted with task checklist

Adaptation rule per `project_management_guide.md`: spike completion **must** update this story's `implementation_plan_replit.md` and `META_DOC.md` to point at the new migration plan, and add Story 8 entry.

---

## 11. Q5 Resolution Detail — Admin Page Placement (2026-05-17)

### Actual auth mechanism (verified from code, not memory)
- **Single shared password, no username.** Front-end `admin.html:248-256` only has a password field.
- HTML is served as a public static file via `express.static('../web/replit')` — view-source readable; data is what requires auth.
- Client puts password into `x-admin-password` HTTP header on every admin API call.
- Server middleware `api/server.js:38-51` does plaintext `!==` compare against `process.env.ADMIN_PASSWORD`.
- Password held only in JS memory (not localStorage); page refresh = re-login.
- Protected endpoints: `/api/admin/stats`, `/api/admin/waitlist`, `/api/admin/surveys`, `/api/admin/export`.
- `admin.html` already has `<meta name="robots" content="noindex,nofollow,noarchive">`.

### Options weighed
| Option | Verdict |
|--------|---------|
| A — keep as-is, set env var on Cloud Run | ✅ **Selected for migration day** |
| B — move admin behind server route + Basic Auth | Optional follow-up hardening (~1 hr) |
| C — kill admin, use Supabase Studio | ❌ Rejected. Would require SQL knowledge, loses curated dashboard's pre-computed insights (stat cards, feature popularity, auto-refresh). UX value of the dashboard outweighs the ~150 LOC savings. |

### Why Option A (not C, despite earlier draft favoring C)
- Dashboard provides cognitive shortcut (4 stat cards + ranked feature popularity + recent rows + 30s auto-refresh) that Supabase Studio doesn't replicate without saved SQL snippets — which the user would still have to write/maintain.
- Zero customers today ≠ zero customers forever; the dashboard's value is for *post-launch* observation when it'll be used frequently.
- ~150 LOC is not a maintenance burden in practice.
- Attack surface mitigations (rate limiting + strong password) are cheaper than rewriting the data-browsing workflow.

### Follow-up hardening backlog (NOT migration-day work)
| Priority | Action | Effort |
|----------|--------|--------|
| Medium | Confirm `ADMIN_PASSWORD` is a 20+ char random string (not weak default) | 5 min |
| Medium | Add rate limit to `/api/admin/*` endpoints — reuse existing `rateLimitCheck` (`server.js:114-137`); currently only `/api/join-waitlist` + `/api/submit-survey` are rate-limited (`server.js:178, 259`) | 10 min |
| Low | Move `ADMIN_PASSWORD` + `DATABASE_URL` from inline env var to GCP Secret Manager | 15 min |
| Low | Option B refactor: serve `admin.html` via authenticated server route instead of static dir | ~1 hr |
| Low | Replace plaintext `!==` with `crypto.timingSafeEqual` | 5 min |
| Cleanup | Remove unused `bcrypt` dep from `api/package.json` (never used) | 2 min |

### Migration-day actions for Q5
- Set Cloud Run env var `ADMIN_PASSWORD` (via inline `--set-env-vars` for now; Secret Manager in follow-up)
- Sweep `admin.html:7` canonical URL together with the broader domain canonical sweep
- No code changes required

---

## 12. Q4 Resolution Detail — GCP Deploy Mode (2026-05-17)

### Selected
**Hybrid: Cloud Console for first-time service creation + `gcloud run deploy --source .` for all subsequent deploys.**

### Region
**`us-central1`** (Iowa) — Tier 1 pricing (cheapest), default region, broadest feature availability, near-US per user constraint.

### User's existing GCP deploy pattern (context, verified with user 2026-05-17)
Previously deployed simple Express services (no DB) to Cloud Run via Console:
- Upload Docker image
- Configure env vars in Console UI
- Set memory/CPU via service config form
- Monitor via Cloud Run dashboard

Migration leverages this familiarity for the first deploy (service skeleton, env vars, compute config) then shifts to CLI for reproducibility on subsequent deploys.

### Options weighed

| Path | Verdict |
|------|---------|
| 1 — Cloud Console (web GUI) | ✅ Use for **first deploy only**. Leverages user's existing familiarity; visualizes one-time setup (region, memory, CPU, env vars, custom domain mapping). Not used for ongoing deploys (no audit trail / not reproducible). |
| 2 — `gcloud run deploy --source .` | ✅ **Primary path for ongoing deploys.** One command, scriptable into `scripts/deploy.sh` (commits to git → reproducible). Uses Dockerfile when present. No local Docker required (Cloud Build does the build). |
| 3 — Local docker build + push to Artifact Registry + `gcloud run deploy --image` | ❌ Not primary. Local layer-cache ROI doesn't justify a Docker-on-laptop dependency at this deploy frequency. May appear briefly during Phase 1 local verification (see plan below). |
| 4 — Cloud Build GitHub trigger | ❌ Overkill for solo-dev / low-frequency deploys. Setup cost (GitHub OAuth + `cloudbuild.yaml` + IAM granting Cloud Build SA `run.admin` + `iam.serviceAccountUser`) > value at current scope. Easy upgrade later if frequency / team grows. |

### Migration-day actions for Q4
- Verify `gcloud` CLI is installed + authed + active project set (`gcloud config get-value project`)
- Create Cloud Run service via Console (first deploy) — set region `us-central1`, memory/CPU defaults, env vars
- Commit `scripts/deploy.sh` wrapping:
  ```
  gcloud run deploy landing --source . --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars=NODE_ENV=production,FRONTEND_URL=... \
    --set-secrets=DATABASE_URL=DATABASE_URL:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest
  ```
- Store sensitive env (`ADMIN_PASSWORD`, `DATABASE_URL`) in GCP Secret Manager; reference via `--set-secrets`
- Non-sensitive env via `--set-env-vars` (visible in deploy script, OK for review)

### Out of scope (deferred follow-up)
- CI/CD via Cloud Build GitHub trigger or GitHub Actions — add later if deploy frequency grows or team expands beyond solo dev

---

## 13. References

- Current setup inventory: see §3 above; cross-reference `implementation_plan_replit.md` Story 5 (deployment) which has unticked `[ ] Choose hosting stack, configure CI/CD pipelines`
- Replit deployment config: `.replit`, `replit.md`
- AEO/SEO context: `aeo_implementation_plan_replit.md`, `seo_technical_hardening_plan_replit.md`, `google_search_console_runbook_replit.md`
- Project management hierarchy guide: `epic_user_experience/project_management_guide.md`
