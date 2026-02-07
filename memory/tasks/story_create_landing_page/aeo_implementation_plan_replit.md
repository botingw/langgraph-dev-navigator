# AEO Implementation Plan (Replit Landing Page)

## Status
- Phase: Story 6 implementation completed in `web/replit` (2026-02-07).
- Last updated: 2026-02-07.
- Follow-up phase planned: `memory/tasks/story_create_landing_page/seo_technical_hardening_plan_replit.md` (Story 7, planning only).

## Objective
Improve landing-page AEO signals with minimal design and UX disruption, preserving the approved content structure from:
- `memory/tasks/story_create_landing_page/landing_page_plan_replit.md`
- `memory/tasks/story_create_landing_page/copy_deck_codex.md`

## Inputs
- `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/summary.md`
- `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Schema_and_AEO_Agent.md`
- `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Authority_and_Trust_Agent.md`
- `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Freshness_and_Update_Agent.md`

## Current Gap Snapshot (from `web/replit`)
- Missing JSON-LD schema in `web/replit/index.html`.
- Existing `<title>` and `<meta description>` are valid but not optimized for AEO query matching.
- Team identity in footer is anonymous, which weakens E-E-A-T.
- Workflow diagram already has useful accessible description (`aria-describedby`) and should be preserved.
- `web/replit/privacy.html` is a placeholder page and should be replaced by real policy content.

## Locked Decisions (provided by owner)
- Canonical URL: `https://langgraph-dev-navigator.replit.app/`
- Team identity for footer/org schema:
  - Name: `Boting Wang`
  - Background: `former software engineer in Microsoft; physics PhD in Southern Methodist University`
  - LinkedIn: `https://www.linkedin.com/in/bo-ting-wang/`
  - GitHub: `https://github.com/botingw`
- VideoObject source:
  - Demo URL: `https://youtu.be/oZZCUZ78QAc`
  - Upload date: `2025-07-23`

## Open Item
- None. `VideoObject.thumbnailUrl` confirmed and set to `https://img.youtube.com/vi/oZZCUZ78QAc/hqdefault.jpg`.

## Implementation Backlog (Execution Record)

### P0: Technical AEO (highest impact, low UI impact)
- [x] Update `web/replit/index.html` metadata:
  - Optimize `<title>`.
  - Optimize `<meta name="description">`.
  - Add `<link rel="canonical" href="https://langgraph-dev-navigator.replit.app/">`.
- [x] Add JSON-LD in `<head>` using `@graph` with separate nodes:
  - `Organization`
  - `SoftwareApplication`
  - `FAQPage`
  - `VideoObject`
  - `WebPage`
- [x] Ensure schema copy exactly matches visible page copy for FAQ answers.

### P1: E-E-A-T and trust improvements (minimal copy changes)
- [x] Update footer credit in:
  - `web/replit/index.html`
  - `web/replit/thank-you.html`
- [x] Add public identity links (LinkedIn/GitHub) near team credit.
- [x] Keep existing layout and section order unchanged.

### P1: Freshness and policy consistency
- [x] Replace `web/replit/privacy.html` placeholder with content derived from:
  - `memory/tasks/story_create_landing_page/sources/privacy_policy.md`
- [x] Resolve placeholder tokens in policy before publish (analytics provider and hosting provider names/links).

### P2: Long-term authority (outside immediate landing-page changes)
- Add `updates`/`resources` content hub for monthly experiment summaries.
- Convert proof assets into indexed case-study style pages over time.

## Acceptance Criteria for Execution Phase
- Rich Results Test parses JSON-LD without critical errors.
- Metadata and canonical URL are present in deployed HTML source.
- Footer identity is human-verifiable and links are reachable.
- Privacy page is no longer placeholder content.
- Visual layout hierarchy remains consistent with current approved design.

## Validation Notes (2026-02-07)
- Local JSON parse of JSON-LD in `web/replit/index.html` passed.
- Internal link existence checks for `index.html`, `thank-you.html`, and `privacy.html` passed.
- External link HTTP checks could not be completed in this environment due network restrictions; run in deployment environment as final QA.
