# Google Search Console Runbook (Replit Domain)

## Status
- Phase: Manual operations runbook.
- Owner: Boting Wang.
- Last updated: 2026-02-07.

## Scope
This runbook covers:
- Search Console property setup for `https://langgraph-dev-navigator.replit.app/`
- Ownership verification flow for Replit subdomain deployment
- Sitemap submission and monitoring checklist

## Preconditions
- Landing page deployed with latest SEO files:
  - `web/replit/robots.txt`
  - `web/replit/sitemap.xml`
  - `web/replit/index.html` (head is editable)
- Google account you want to use for Search Console.

## Step 1: Create Property
1. Open Search Console: `https://search.google.com/search-console/`
2. Click `Add property`.
3. Choose `URL prefix` (not `Domain`) for Replit subdomain usage.
4. Enter: `https://langgraph-dev-navigator.replit.app/`

## Step 2: Verify Ownership (HTML tag method)
1. In verification options, choose `HTML tag`.
2. Copy the provided tag:
   - Example format: `<meta name="google-site-verification" content="TOKEN_VALUE">`
3. Add this meta tag to `<head>` in `web/replit/index.html`.
4. Redeploy on Replit.
5. Return to Search Console and click `Verify`.

Notes:
- For `replit.app` subdomain deployment, DNS verification is usually not available to app owners.
- If you later move to a custom domain you control, switch to `Domain property` + DNS TXT verification.

## Step 3: Submit Sitemap
1. In Search Console property menu, open `Sitemaps`.
2. Submit `sitemap.xml`.
3. Full sitemap URL should resolve to:
   - `https://langgraph-dev-navigator.replit.app/sitemap.xml`
4. Confirm status becomes `Success`.

## Step 4: Verify Crawl and Index Signals
1. Open `Indexing -> Pages`.
2. Check that:
   - `/` and `/privacy.html` are indexable.
   - `/thank-you.html` excluded by `noindex`.
   - `/admin.html` excluded by `noindex`.
3. Open `URL Inspection` for:
   - `https://langgraph-dev-navigator.replit.app/`
   - `https://langgraph-dev-navigator.replit.app/privacy.html`

## Step 5: Weekly Monitoring Checklist
1. `Performance` report:
   - Filter last 7/28 days.
   - Track impressions, clicks, CTR, average position.
2. Query monitoring focus list:
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
3. `Pages` report:
   - Watch for sudden spike in `Crawled - currently not indexed`.
4. `Core Web Vitals`:
   - Watch for regressions in `INP`, `LCP`, `CLS`.

## Troubleshooting
- `Verification failed`:
  - Confirm meta tag is in deployed `index.html` head.
  - Confirm no cache/stale deployment.
- `Sitemap couldn't fetch`:
  - Confirm `https://langgraph-dev-navigator.replit.app/sitemap.xml` is publicly accessible.
  - Confirm XML is valid and includes canonical URLs only.
- Unexpected page indexed:
  - Confirm meta robots exists in page source.
  - Use URL Inspection -> `Request indexing` after fixing directives.
