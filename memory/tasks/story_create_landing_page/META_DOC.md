  # Meta-Documentation: Landing Page Creation

This document summarizes the key artifacts and source materials that guided the planning, design, and implementation of the LangGraph Dev Navigator landing page.

## 1. Core Product & Value Proposition Documents

These files were crucial for understanding what the product is and why it is valuable.

*   `README.md`: Provided the primary "Before vs. After" narrative and the core philosophy of being a "Grounded Assistant."
*   `META_DOC.md` (main repo): Gave a high-level system architecture overview.
*   `memory/docs/product_requirement_docs.md`: Established the foundational principle of "Metric-Driven Experimentation," which informs the project's long-term goals.

## 2. Landing Page Strategy & Design Documents

These files guided the strategic approach for the landing page.

*   `memory/tasks/story_create_landing_page/Landing_Page_Guide.md`: The foundational guide that provided the first principles of landing page design.
*   `memory/tasks/story_create_landing_page/landing_page_plan_replit.md`: The final, authoritative strategic plan for the landing page, superseding earlier versions (landing_page_plan_codex.md and landing_page_plan_v4.md).
*   `images/query_workflow_v2.md`: The source code for the Mermaid diagram used to visually explain the "Methodical Workflow."
*   `memory/tasks/story_create_landing_page/implementation_plan_replit.md`: implementation plan for latest plan (landing_page_plan_replit.md)

## 3. Content & Asset Source Documents

These files represent the final, approved content and the raw materials used as proof on the page.

*   `memory/tasks/story_create_landing_page/copy_deck_codex.md`: The source of truth for all page copy, mapping directly to the final HTML.
*   `memory/tasks/story_create_landing_page/sources/`: This directory contains the raw assets, including the chat-text proofs and the privacy policy source.

## 4. Implementation & Process Documents

These files provided the blueprint for the execution of the plan.

*   `memory/tasks/epic_user_experience/project_management_guide.md`: Defined the Epic -> Story -> Task hierarchy that was used to structure the formal implementation plan.
*   `memory/tasks/story_create_landing_page/implementation_plan_codex.md`: The detailed, task-oriented execution plan for building the landing page and backend.
*   `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md`: Served as the complete technical specification for the backend API.
*   `memory/tasks/story_create_landing_page/aeo_implementation_plan_replit.md`: Planning-only AEO execution backlog for Replit landing page (metadata, schema, trust signals, freshness hygiene).

## 5. code implementation
`web/replit` folder contains all implementation
`api` folder contains backend implementation
context handled by replit is in `replit.md`, configuration is in `.replit` , and other environment variables, secrets, etc are in replit's environment. so if dev env is not replit, these configs are not accesible. 

## 6. AEO Optimization Context (Added 2026-02-07)

Primary AEO recommendation source:
*   `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/summary.md`
*   `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Schema_and_AEO_Agent.md`
*   `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Authority_and_Trust_Agent.md`
*   `memory/docs/seo/AEO_VC_for_langgraph_dev_navigator/Freshness_and_Update_Agent.md`

Implementation planning artifact:
*   `memory/tasks/story_create_landing_page/aeo_implementation_plan_replit.md`

Locked context for upcoming AEO execution:
*   Canonical URL: `https://langgraph-dev-navigator.replit.app/`
*   Team identity to expose in footer/org schema:
    *   Name: `Boting Wang`
    *   Background: `former software engineer in Microsoft; physics PhD in Southern Methodist University`
    *   LinkedIn: `https://www.linkedin.com/in/bo-ting-wang/`
    *   GitHub: `https://github.com/botingw`
*   VideoObject source:
    *   URL: `https://youtu.be/oZZCUZ78QAc`
    *   Upload date: `2025-07-23`

Resolved context item:
*   `VideoObject.thumbnailUrl` resolved as `https://img.youtube.com/vi/oZZCUZ78QAc/hqdefault.jpg` (confirmed 2026-02-07).

## 7. SEO Technical Hardening Context (Added 2026-02-07)

Primary SEO recommendation sources:
*   `memory/docs/seo/website_seo.md`
*   `memory/docs/seo/website_seo_high_leverage.md`

Planning artifact:
*   `memory/tasks/story_create_landing_page/seo_technical_hardening_plan_replit.md`
*   `memory/tasks/story_create_landing_page/google_search_console_runbook_replit.md`
*   `memory/tasks/story_create_landing_page/cwv_baseline_and_triage_replit.md`

Locked context for SEO execution:
*   `thank-you.html` should be non-indexable using `noindex,follow`.
*   `admin.html` is likely reachable on the same public domain today; API admin endpoints are password-gated, but page-level exposure remains a risk.
*   Search Console owner: `Boting Wang`.
*   Replit verification path: URL-prefix property + HTML tag.
*   Social preview fallback image: `https://img.youtube.com/vi/oZZCUZ78QAc/hqdefault.jpg`.
*   Priority query set for landing-page SEO:
    *   `langgraph debugging assistant`
    *   `langgraph hallucination detector`
    *   `langgraph agent validation framework`
    *   `langchain agent debugging tool`
    *   `ai agent for fixing langgraph workflows`
    *   `grounded ai coding assistant for langgraph`
    *   `version-aware langgraph coding assistant`
    *   `how to stop hallucinations in langgraph agents`
    *   `debug multi-agent workflows langgraph`
    *   `langgraph developer tools`
