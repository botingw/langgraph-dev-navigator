# Landing Page Plan (Codex): Grounded Assistants That Ship Working LangGraph Code

## 0. Why V4 Fails the Guide Bar
- **Persona drift:** V4 never names the primary user. The README and product requirements make it explicit that we serve LangGraph developers (individuals and teams) who must ship reliable, version-specific AI agents.
- **Missing conversion equation levers:** There are no value pillars, no staged proof assets, and no risk-reversal tactics. As a result the page cannot maximize \(\text{Relevance} \times \text{Perceived Value} \times \text{Trust}\) or reduce \(\text{Friction} + \text{Anxiety}\).
- **No measurement plan:** The guide demands explicit instrumentation (CTA clicks, survey completion, scroll depth). V4 omits analytics entirely.
- **Stage 2 under-specified:** The Insight Engine lacks copy hierarchy, benefit framing, and survey logic that maps to the feature taxonomy agreed with Gemini.

## 1. Strategic Overview
- **Conversion Goal:** Single CTA — `Join the Waitlist`. Everything on the page must either earn the click or remove a blocker.
- **Funnel Shape:** Two-stage experience (Hook → Insight Engine). Stage 1 sells the current, grounded solution. Stage 2 captures roadmap signal.
- **Narrative Spine:** Before/After transformation from README + "Grounded Assistant" philosophy + Metric-Driven Experimentation ethos from `product_requirement_docs.md`.
- **Proof Obligation:** Demonstrate that we already have a working workflow (RAG → Generate → Validate) and that users join a serious experiment, not vaporware.

## 2. Audience & Pain Calibration
| Persona | Situation | Primary Pain | Desired Outcome |
|---------|-----------|--------------|-----------------|
| **LangGraph practitioner** (individual dev integrating LangGraph) | Maintaining bespoke agents tied to a specific LangGraph release | Hallucinated, stale, or incompatible code from generic AI assistants | "Give me runnable code and validations aligned with my repo right now."
| **Team lead / Staff engineer** (owns AI infrastructure for a team) | Needs governance & repeatability across agents | Cannot audit or validate AI-generated changes; worried about drift | "Instrumented workflow with metrics, observability, and compliance readiness."

**Implications for copy**
- Name LangGraph explicitly in hero and pillars.
- Emphasize validation, observability, and experiment cadence to attract team leads without diluting dev-first clarity.

## 3. Stage 1 — Decision Block (Above the Fold)
- **Headline:** `Ship LangGraph agents that pass validation on the first try.`
    - Directly answers "What is it?" + "Why now?" within 5 seconds.
- **Sub-head:** `A grounded assistant that retrieves your repo, generates code, and self-validates against LangGraph.`
- **Primary CTA:** `Join the Waitlist` (email field + button). Button copy remains outcome-focused.
- **Micro-trust:** Inline badge row combining the existing security assessment badge + "Open-source • Metric-Driven Experiment" (pull from README + product requirements). No invented metrics.
- **Visual Cue:** Screenshot or animated terminal showing validation script succeeding. Use real artifact from current repo to avoid speculation.

**Content notes:**
- Keep form minimal (email only). Clarify "No spam. Updates when new validated workflows ship."
- Immediately under CTA, state the next step: "You'll answer a 30-second build-priorities survey after joining."

## 4. Stage 1 — Outcome-first Value Pillars (3 max)
1. **Ground truth retrieval on your repo**
   - Copy: "Embed Supabase RAG over LangGraph docs + your source so responses quote runnable references." (Source: README + META_DOC.)
   - Asset: Inline code snippet showing `perform_rag_query` returning relevant file path. Pull the example from the Case 5 reflection agent run stored at `langgraph_dev/dev_test/test_case_results/case5/agent_gemini_with_reflection.py`. Case 5 is the "Agentic Loop" prompt defined in `langgraph_dev/dev_test/langgraph_test_cases.md`, so even a new contributor can trace how the snippet was generated.
2. **Validation before delivery**
   - Copy: "`check_ai_script_hallucinations` blocks non-existent classes before they ship." (Source: README + `product_requirement_docs.md` focus on correctness.)
   - Asset: GIF or log snippet with pass/fail result referencing the validation clip from https://youtu.be/oZZCUZ78QAc?si=YKwOiq_OdgZAJ7Nd. The video demonstrates the assistant failing Case 5 until it searches docs for the reflection agent pattern, then re-running the validation successfully.
3. **Measured improvement loop**
   - Copy: "Track hallucination rate, first-pass success, and iteration count per task." (Source: README + `product_requirement_docs.md`.)
   - Asset: Simple chart placeholder (plan for actual metric once data captured) annotated with placeholder ranges we expect to collect via Stage 2 analytics.

**Layout guidance:** Each pillar should complete "With this, you can…" and call out the tangible change.

## 5. Stage 1 — Methodical Workflow (How it Works)
- **Diagram:** Reuse `images/query_workflow_v2.md` Mermaid graph. Ensure alt text explains each step for accessibility.
- **Three-step copy:**
    1. Retrieve version-correct docs + examples.
    2. Generate code scoped to your graph.
    3. Validate structure against the knowledge graph before shipping.
- **Support text:** Highlight that both Supabase (RAG) and Neo4j (KG) are already configured modules (README + META_DOC).

## 6. Stage 1 — Proof Stack & Trust Builders
- **Lightweight proof:** GitHub stars, security badge, contribution velocity. (Action: pull live GitHub stats before launch.) Include README security badge inline.
- **Substantive proof:** 90-second terminal walk-through of completing Case 5 with reflection (`agent_gemini_with_reflection.py`) validating successfully. Embed thumbnail + link to validation video (https://youtu.be/oZZCUZ78QAc?si=YKwOiq_OdgZAJ7Nd). Make it explicit in the caption that Case 5 originates from `langgraph_dev/dev_test/langgraph_test_cases.md#test-case-5-agentic-loop`, so reviewers understand the scenario being validated.
- **Deep proof:** Link to docs (`README`, `META_DOC`, architecture diagrams) and the public `mcp-crawl4ai-rag` repo. Provide "See the validation scripts" link pointing to the knowledge-graph validation helper at `https://github.com/botingw/langgraph-dev-navigator/blob/main/mcp-crawl4ai-rag/knowledge_graphs/ai_hallucination_detector.py` and to the MCP server utility that exposes `check_ai_script_hallucinations` (documented throughout `docs/doc_crawl4ai/Crawl4AI_Function_Detail.md`). This gives newcomers a precise pointer to the code that enforces correctness.
- **Risk reversal:** Clarify "Open source MIT license. Bring your own API keys." Add note about local control (no forced SaaS).
- **FAQ (top 3 anxieties):**
    - "What happens after I join?" → Email cadence + survey.
    - "Do I need to self-host everything?" → Outline MCP server hosting options (API design doc + README instructions).
    - "How secure is my code?" → Emphasize local-first workflow, optional VPC deployment (refer to feature roadmap).

## 7. Stage 1 — Conversion Flow & Instrumentation
- **Critical Events:**
    - `cta_click_primary`, `waitlist_submit_success`, `survey_start`, `survey_submit`, `hero_scroll_50`, `faq_expand`.
- **Tools:** Use lightweight analytics (PostHog or self-hosted) with respect for privacy. Track via data attributes in HTML and align payload schemas with `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md`.
- **North Star Metrics:**
    - CTA click-through rate, waitlist conversion rate, survey completion rate, average features selected per user, bounce rate on hero.
- **Experiment backlog:** Variation tests on headline clarity, CTA copy, hero artifact (code snippet vs. gif).

## 8. Stage 2 — Insight Engine (Thank You Page)
- **Purpose reminder:** Immediately acknowledge conversion and set expectation: "Help us prioritize what we ship next."
- **Copy Structure:**
    - Headline: `Thanks for joining. Tell us where reliability matters most.`
    - Sub-head: `Select the workflows you need, then we email you as they launch.`
- **Survey Groups (from Gemini conversation):**
    1. **Core Development Experience** — Automated Debugging, AI-Powered Test Generation, (include note that selections influence roadmap).
    2. **Platform & Deployment** — Cloud-hosted knowledge server, One-click agent publishing.
    3. **Advanced Agent Capabilities** — Observable agents, Self-improving agents, Architectural guidance.
    4. **Enterprise & Team** — On-Prem/VPC, Advanced IAM & Security, CI/CD integration.
- **Interaction Design:** Checkbox list with helper text per option explaining outcome (no marketing fluff, make trade-offs explicit).
- **Secondary Inputs:** Optional free-text "Critical workflow you need" + toggle for beta testing access.
- **Final CTA:** `Submit my build priorities` → success state reiterates next touchpoint timeline.
- **Data Policy Callout:** Link to privacy note explaining storage (align with API design doc, note Postgres + metrics usage).

## 9. Content & Asset Production Backlog
| Asset | Owner | Source Material | Status |
|-------|-------|-----------------|--------|
| Hero terminal/gif demonstrating validated code | Engineering | Case 5 reflection agent logs in `langgraph_dev/dev_test/test_case_results/case5/` + validation video | To produce |
| Value pillar copy + snippets | PM/Writer + Eng | README, META_DOC, `langgraph_dev/dev_test/test_case_results/case5/agent_gemini_with_reflection.py`, `langgraph_dev/dev_test/test_case_results/case5/agent_o3.py` | Draft required |
| Proof video (90s) | Developer advocate | Validation video script + live run of Case 5 | To produce |
| Metrics chart template | Data | Stage 2 analytics (feature selections, hallucination rate targets) | Blocked until data |
| FAQ answers | PM + Eng | README setup steps, waitlist API design, MCP privacy constraints (see `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md`) | Draft required |
| Insight Engine copy | PM | Gemini taxonomy + survey intent from `memory/tasks/story_create_landing_page/landing_page_discuss_with_gemini.md` | Needs rewrite with benefit framing |
| Privacy blurb | Legal/PM | Waitlist API design + storage notes, local-first deployment plan (refs: `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md`) | To draft |
| Analytics spec | PM + Eng | `memory/tasks/story_create_landing_page/waitlist_and_survey_api_design.md`, Stage 7 event list | To draft |

## 10. Delivery Milestones
1. **Content Alignment (Week 1):** Finalize copy + assets for hero, pillars, workflow, FAQ. Approve measurement schema.
2. **Design Pass (Week 1-2):** Translate plan into wireframe (desktop + mobile). Confirm asset placements.
3. **Implementation (Week 2):** Build Stage 1 + Stage 2 pages using approved plan; hook analytics events (see Implementation Codex).
4. **Pre-Launch QA (Week 2 end):** Verify narrative continuity, responsive layout, instrumentation fire.
5. **Launch & Measure (Week 3):** Deploy, monitor baseline metrics, schedule experiment backlog.

## 11. Risks & Mitigations
- **Risk:** Lack of credible metrics before launch. → Mitigation: Publish methodology + target metrics even if baseline TBD; collect initial runs to populate chart ASAP.
- **Risk:** Survey fatigue post-conversion. → Mitigation: Keep Stage 2 under 45 seconds, add progress indicator, allow skip while promising follow-up email to complete later.
- **Risk:** Mixed personas diluting message. → Mitigation: Keep dev-first language in hero; reserve enterprise promises for survey stage and FAQ.

## 12. Next Actions
1. Approve this Codex as replacement for V4 plan.
2. Update implementation backlog using `implementation_plan_codex.md` (companion document).
3. Audit existing Stage 1 mock (web/gemini) against new plan; identify gaps for follow-up stories.
