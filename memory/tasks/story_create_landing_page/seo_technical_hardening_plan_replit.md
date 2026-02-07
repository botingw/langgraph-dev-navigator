# SEO Technical Hardening Plan (Replit Landing Page)

## Status
- Phase: Execution started; repository changes partially completed.
- Last updated: 2026-02-07.

## Objective
Improve search discoverability for the existing landing page with minimal UI disruption, preserving:
- Existing section order and visual hierarchy in `web/replit/index.html`.
- Approved content strategy under `memory/tasks/story_create_landing_page/`.

## Inputs
- `memory/docs/seo/website_seo.md`
- `memory/docs/seo/website_seo_high_leverage.md`
- `memory/tasks/story_create_landing_page/implementation_plan_replit.md`
- `memory/tasks/story_create_landing_page/aeo_implementation_plan_replit.md`

## Constraints
- Keep design and interaction patterns intact unless technically required.
- Prefer head-level metadata, crawl controls, and measurement workflow changes over layout edits.

## Locked Context (Owner Confirmed)
- `thank-you.html` indexing policy target: `noindex,follow`.
- `admin.html` is likely reachable on public domain today; API data endpoints are password-gated.
- Search Console owner: `Boting Wang`.
- For Replit subdomain verification, use URL-prefix + HTML meta verification workflow.
- Social preview image fallback: YouTube `hqdefault` thumbnail.
- Priority queries (deduplicated):
  - `langgraph debugging assistant`
  - `langgraph hallucination detector`
  - `langgraph agent validation framework`
  - `langchain agent debugging tool`
  - `ai agent for fixing langgraph workflows`
  - `grounded ai coding assistant for langgraph`
  - `version-aware langgraph coding assistant`
  - `how to stop hallucinations in langgraph agents`
  - `debug multi-agent workflows langgraph`
  - `langgraph developer tools`

## Current Gap Snapshot
- Search Console ownership verification is not executed yet (manual owner action).
- Sitemap submission in Search Console is not executed yet (manual owner action).
- No documented CWV baseline or optimization loop for `LCP`, `INP`, `CLS`.
- Admin page remains publicly reachable as static asset; only API routes are password-gated.

## Planned Backlog

### P0: Crawl and indexability hygiene
- [x] Add `web/replit/robots.txt` with sitemap reference and explicit disallow for admin path.
- [x] Add `web/replit/sitemap.xml` containing only canonical 200 URLs.
- [x] Apply meta robots policy:
  - `web/replit/index.html`: indexable.
  - `web/replit/privacy.html`: indexable.
  - `web/replit/thank-you.html`: `noindex,follow`.
  - `web/replit/admin.html`: `noindex,nofollow`.
- [x] Verify canonical consistency for indexable pages and remove canonical ambiguity.

### P1: Query-intent alignment with minimal copy changes
- [x] Map priority queries to existing sections without reordering UI:
  - Hero and metadata: primary queries.
  - Proof section: hallucination and validation queries.
  - FAQ: long-tail "how to" and multi-agent debugging queries.
- [x] Tune `title`, `meta description`, and `SoftwareApplication`/`WebPage` schema descriptions to match primary queries while preserving approved messaging.
- [x] Keep visible FAQ copy and JSON-LD answers synchronized.

### P1: Social metadata and snippet control
- [x] Add baseline `og:*` and `twitter:*` metadata to `web/replit/index.html`.
- [x] Decide whether `thank-you.html` needs social cards (default: skip due to `noindex` target).
- [x] Define preferred preview asset source (YouTube `hqdefault` fallback acceptable if no custom OG image exists).

### P1: Performance measurement loop (CWV focused)
- [ ] Record baseline for `LCP`, `INP`, `CLS` on landing template.
- [ ] Add a triage checklist for potential bottlenecks (Mermaid loading, JS execution, font loading, layout stability).
- [ ] Define pass thresholds and weekly re-check cadence.

### P2: Operations and governance
- [x] Add Search Console setup runbook for Replit domain:
  - ownership verification options,
  - sitemap submission steps,
  - coverage and query monitoring checklist.
- [ ] Execute Search Console ownership verification (manual owner action).
- [ ] Submit sitemap in Search Console (manual owner action).
- [ ] Add monthly SEO/AEO maintenance checklist (broken links, stale copy, schema validity, privacy date review).
- [ ] Add backlog item to move admin UI behind authenticated route (not only API password headers).

## Query Strategy (Execution Target)
- Primary queries for metadata and hero:
  - `langgraph debugging assistant`
  - `grounded ai coding assistant for langgraph`
  - `version-aware langgraph coding assistant`
- Secondary queries for proof and differentiators:
  - `langgraph hallucination detector`
  - `langgraph agent validation framework`
  - `langchain agent debugging tool`
  - `ai agent for fixing langgraph workflows`
- Long-tail queries for FAQ:
  - `how to stop hallucinations in langgraph agents`
  - `debug multi-agent workflows langgraph`
  - `langgraph developer tools`

## Acceptance Criteria for Implementation Phase
- `robots.txt` and `sitemap.xml` exist and reflect canonical/indexable URLs only.
- `thank-you.html` and `admin.html` are explicitly non-indexable.
- Priority queries are mapped to existing copy surfaces without redesign.
- CWV baseline and follow-up workflow are documented in task management files.
- Search Console submission and monitoring steps are documented, even if account access is pending.

## Open Questions
- None for current phase.
- Remaining blockers are execution-only:
  - Owner must complete Search Console verification and sitemap submission manually.
