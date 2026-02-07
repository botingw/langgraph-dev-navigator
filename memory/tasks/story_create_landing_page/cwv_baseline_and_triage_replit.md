# CWV Baseline and Triage Checklist (Replit Landing Page)

## Status
- Phase: Execution checklist opened.
- Last updated: 2026-02-07.
- Scope: `web/replit/index.html` primary template.

## Objective
Record measurable baseline values for `LCP`, `INP`, and `CLS`, then run a repeatable triage loop for regressions.

## Metrics Target
- `LCP <= 2.5s`
- `INP <= 200ms`
- `CLS <= 0.1`

## Baseline Capture Plan
1. Test URLs:
   - `https://langgraph-dev-navigator.replit.app/`
2. Tools:
   - PageSpeed Insights (field + lab)
   - Search Console Core Web Vitals report (field)
3. Capture windows:
   - Mobile baseline
   - Desktop baseline
4. Record at least 3 runs for lab metrics to reduce variance.

## Baseline Log
| Date | Environment | Source | LCP | INP | CLS | Notes |
|------|-------------|--------|-----|-----|-----|-------|
| 2026-02-07 | pending | pending | pending | pending | pending | Checklist created; metrics not captured yet. |

## Triage Checklist
- [ ] Mermaid render path: validate whether diagram rendering blocks main-thread interaction.
- [ ] JS execution: audit `assets/js/main.js` and `assets/js/survey.js` for long tasks on initial load.
- [ ] Font loading: confirm font delivery does not delay first meaningful paint.
- [ ] Layout stability: verify no unexpected shifts during hero/proof/FAQ hydration.
- [ ] Third-party scripts: keep only essential scripts on landing route.

## Weekly Monitoring Cadence
1. Check Search Console CWV status bucket changes weekly.
2. If any metric regresses above threshold, open a task with:
   - regression date,
   - affected template,
   - suspected cause,
   - mitigation patch.
3. Re-run baseline table after each SEO/performance release.

## Notes
- Search Console `Pages` report may show initial "Processing data" for 24-72 hours after first setup.
- Do not treat empty early coverage data as indexing failure until report population completes.
