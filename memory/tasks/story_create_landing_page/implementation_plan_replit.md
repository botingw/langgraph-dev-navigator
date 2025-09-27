# Implementation Plan (Replit): Create Landing Page & Waitlist System

## 0. Why the V4 Implementation Plan Breaks Down
- **Missing content production stream:** Story 1 jumps straight into HTML/CSS without producing approved copy, proof assets, or analytics requirements — violating the guide’s single-source-of-truth principle.
- **No instrumentation or experimentation tasks:** The plan never mentions tracking `cta_click_primary`, survey completion, or funnel metrics demanded by the landing page guide.
- **Backend ambiguity:** Story 2 repeats the API design doc verbatim but lacks acceptance tests, error states, or deployment sequencing. It also ignores security and privacy notes needed for Stage 2 messaging.
- **Owner/Dependency blind spots:** No roles, dependencies, or milestones, making coordination impossible.

This Replit-specific plan mirrors the Codex structure but tracks the modernized implementation under `web/replit` + `api/`. It is organized by Epic → Story → Tasks and pairs directly with `landing_page_plan_replit.md` so we can reason about parity gaps.

## Epic Overview
- **Epic Name:** `story_create_landing_page`
- **Goal:** Ship a two-stage funnel (Hook → Insight Engine) that converts qualified LangGraph developers to the waitlist and collects roadmap signal.
- **Success Metrics:**
    - ≥35% hero CTA click-to-submit conversion within first 2 weeks.
    - ≥70% survey completion rate among waitlist signups.
    - Baseline metrics captured for hallucination rate, first-pass success, iteration count (for follow-up storytelling).
- **Primary Owners:**
    - PM/Lead: responsible for narrative cohesion + measurement.
    - Engineering: front-end + backend implementation.
    - Developer Advocate: proof assets (video, snippets) + content QA.

---

## Story 1 — Finalize Narrative, Assets, and Analytics Blueprint
- **Objective:** Approve every word, visual, and event schema before engineers touch production markup.
- **Dependencies:** `landing_page_plan_codex.md` approved.
- **Acceptance Criteria:**
    - Copy doc covering hero, pillars, workflow, proof, FAQ, and Stage 2 survey microcopy signed off by PM + Dev Advocate. File lives at `memory/tasks/story_create_landing_page/copy_deck_codex.md`.
    - Asset backlog (hero gif, workflow diagram alt text, proof video outline) assigned with due dates and includes explicit references to the validation video + Case 5 logs housed in `langgraph_dev/dev_test/test_case_results/case5/`.
    - Analytics specification enumerating events, properties, payload schema, and tooling documented in `memory/tasks/story_create_landing_page/analytics_spec_codex.md` (new asset).
- **Tasks:**
    - [ ] Extract copy blocks from Codex into a structured copy deck (owner: PM/Writer). Reference README security badge and Stage 6 proof assets.
    - [ ] Script and storyboard proof video + hero terminal run referencing https://youtu.be/oZZCUZ78QAc?si=YKwOiq_OdgZAJ7Nd and Case 5 reflection agent logs located at `langgraph_dev/dev_test/test_case_results/case5/` (owner: Dev Advocate, dependency: Eng for runnable scenario).
    - [ ] Draft privacy & data usage blurb consistent with waitlist API storage and MCP deployment expectations (owner: PM, dependency: backend design doc).
    - [ ] Define analytics tracking plan (events, dataLayer schema, tooling). (owner: PM + Eng)
    - [ ] Inventory all trust assets (README security badge, `ai_hallucination_detector.py` at `https://github.com/botingw/langgraph-dev-navigator/blob/main/mcp-crawl4ai-rag/knowledge_graphs/ai_hallucination_detector.py`, `check_ai_script_hallucinations` workflow documented in `docs/doc_crawl4ai/Crawl4AI_Function_Detail.md`) and ensure usage rights cleared.
    - [ ] Review all assets for persona alignment and tone; secure approvals.

## Story 2 — Implement Stage 1 Frontend (Hook)
- **Objective:** Build responsive landing page matching Codex content + instrumentation.
- **Dependencies:** Story 1 deliverables completed.
- **Acceptance Criteria:**
    - `web/replit/index.html` matches approved copy hierarchy and includes instrumentation data attributes.
    - CSS responsive for ≥320px width; LCP < 2.0s on local lighthouse.
    - Hero CTA posts to backend stub, tracks analytics event, and handles loading/error states gracefully.
    - Proof, FAQ, and value sections include real assets (or placeholders clearly marked with TODO plus owner).
- **Tasks:**
    - [x] Update layout to accommodate hero trust badges + CTA next-step note.
    - [x] Implement value pillar blocks with snippet placeholders and accessible captions.
    - [x] Integrate workflow diagram via inline SVG/`<img>` referencing `images/query_workflow_v2.md`; include descriptive alt text (currently missing on `web/replit/index.html`).
    - [x] Wire analytics events (data attributes + JS stub) for CTA, scroll, FAQ interactions so they emit approved event names.
    - [x] Implement form submission logic calling `/api/join-waitlist`; handle loading, success redirect, duplicate email messaging per API spec.
    - [x] Ensure privacy blurb and measurement disclosure visible near form.
    - [ ] QA responsive layout + accessibility (heading order, focus states, alt text, aria roles).
    - [x] Restore a working privacy disclosure link for Replit build (current references to `privacy.html` in `web/replit/index.html:339` and `web/replit/thank-you.html:243` 404). Either ship a Replit-specific `privacy.html` or repoint to `web/codex/privacy.html`, then document owner + rollout sequencing for Stage 5 privacy deliverable.
    - [x] Rename analytics events in `web/replit/assets/js/main.js` + `web/replit/assets/js/survey.js` to match the approved spec (`cta_click_primary`, `waitlist_submit_success`, `survey_start`, `feature_selected`, etc.) so dashboards using `landing_page_plan_codex.md:65-68` and `landing_page_plan_replit.md:10-20` stay trustworthy.
    - [x] Add accessible alternative text or `aria-describedby` content for the Mermaid workflow diagram (`web/replit/index.html:167`) referencing the narrative in `images/query_workflow_v2.md`, keeping WCAG 2.1 AA claims honest.

## Story 3 — Implement Stage 2 Insight Engine Frontend
- **Objective:** Deliver thank-you survey that reflects taxonomy + analytics and supports roadmap learning.
- **Dependencies:** Story 1 copy + analytics plan; Story 2 API client utilities.
- **Acceptance Criteria:**
    - `web/replit/thank-you.html` uses approved headings, group copy, and includes optional free-text + beta opt-in toggle.
    - Survey read/write flows call `/api/submit-survey` with error retry + success confirmation.
    - Analytics events for survey interactions fire with feature keys.
    - Loading skeleton shown while verifying `userId` query param; invalid/missing ID path handled (redirect or error message).
- **Tasks:**
    - [x] Build grouped checkbox UI with helper text and progress indicator (< 4 groups visible at once).
    - [x] Add optional text area and toggle, wiring to payload schema.
    - [x] Implement success state summarizing selections and next-step timeline.
    - [x] Instrument events: `survey_start`, `feature_select`, `survey_submit`, `survey_error` (current implementation uses mismatched names in `web/replit/assets/js/survey.js`).
    - [x] Add privacy notice link consistent with Story 1 output (current href points to missing `privacy.html`).
    - [ ] Accessibility audit (keyboard navigation, form labels, ARIA for groups) documented with findings.

## Story 4 — Backend API & Data Storage
- **Objective:** Ship production-ready waitlist + survey API per design doc with observability and tests.
- **Dependencies:** API design doc approved (existing). Stories 2 & 3 consume endpoints.
- **Acceptance Criteria:**
    - FastAPI (or chosen framework) service deployed locally with Postgres schema (`waitlist_users`, `survey_responses`).
    - Unit/integration tests covering happy path, duplicate email, invalid userId, empty survey.
    - API returns consistent JSON with error codes; rate limiting or throttling guard in place.
    - Logging + metrics (request latency, error counts) instrumented.
- **Tasks:**
    - [ ] Scaffold project structure under `/api` with environment configuration.
    - [ ] Implement models/migrations for database schema.
    - [ ] Build `/api/join-waitlist` endpoint with email validation, idempotency.
    - [ ] Build `/api/submit-survey` endpoint ensuring deduplication + optional free-text/beta toggle fields.
    - [ ] Write automated tests (Pytest) + coverage report.
    - [ ] Add observability hooks (structured logs, optional OpenTelemetry exporter).
    - [ ] Document API usage + env variables in README section.
    - [ ] Refactor the Replit backend schema so `survey_responses` becomes row-per-feature per `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md:20-108`; right now `api/database.js:95-118` + `api/server.js:286-317` store arrays, breaking dedupe + analytics. Include migration notes and update tests consuming the new join table.

## Story 5 — Deployment, Instrumentation, and Growth Loop
- **Objective:** Make the funnel publicly accessible, instrumented, and ready for experimentation.
- **Dependencies:** Stories 2–4 complete.
- **Acceptance Criteria:**
    - Frontend deployed (e.g., Vercel/GitHub Pages) with environment config for API base URL.
    - Backend deployed (e.g., Fly.io/Render) with SSL and environment secrets stored securely.
    - Analytics events verified in production tooling; privacy policy live.
    - Post-launch checklist executed (lighthouse, form submissions, survey completions, logs clean).
    - Growth loop initiated: baseline metrics captured, first experiment hypothesis logged.
- **Tasks:**
    - [ ] Choose hosting stack, configure CI/CD pipelines.
    - [ ] Replace local fetch stubs with production endpoints + error telemetry.
    - [ ] Validate instrumentation end-to-end (event inspector screenshots, sample payloads).
    - [ ] Publish privacy/data usage doc referenced on both pages.
    - [ ] Run lighthouse + performance profiling; fix regressions >10% vs. local.
    - [ ] Draft launch comms + doc update summarizing funnel metrics plan.

---

## Timeline & Dependencies Summary
| Week | Milestones | Blocking Dependencies |
|------|------------|-----------------------|
| Week 1 | Story 1 complete; Story 2 kickoff | Approval of Codex plans |
| Week 2 | Story 2 + Story 3 implementation | Story 1 assets; backend stubs for integration |
| Week 3 | Story 4 complete; begin Story 5 | Infra access, secrets provisioned |
| Week 4 | Story 5 deploy + experiment backlog ready | All prior stories done |

## Risk Register
- **Incomplete assets delay engineering** → Mitigate by treating Story 1 as gate; no coding before sign-off.
- **Backend latency impacts UX** → Add loading states + optimistic copy; monitor p95 and autoscale.
- **Analytics or privacy non-compliance** → Pair PM + Legal early, double-check disclosures before launch.

## Reporting & Update Cadence
- Weekly status note summarizing story progress, blockers, and key metrics.
- After launch, analytics review every Monday; experiment backlog reprioritized based on data.

## Next Steps
1. Circulate Codex plans for sign-off.
2. Spin up Story 1 copy deck immediately; assign asset owners.
3. Schedule engineering pairing session to review Stories 2 & 3 requirements before implementation begins.
