# Landing Page Copy Deck (Codex)

This document is the source of truth for the Stage 1 landing page (waitlist funnel) and Stage 2 insight engine. Every line item below maps to a section in `web/codex/index.html` and `web/codex/thank-you.html`. Use this deck to audit the current implementation and to guide future edits. Items flagged as **TBD** need follow-up assets or confirmation before launch.

---

## Stage 1 — Hook / Waitlist Page

### 1. Hero (Above the Fold)
- **Headline:** `Ship LangGraph assistants that validate before they ship.`
- **Sub-head:** `LangGraph Dev Navigator retrieves the right files from your repo, generates scoped code, and blocks hallucinations with a LangGraph-specific knowledge graph.`
- **Lead-in proof bullets:**
  - `Before: chasing deprecated APIs and hallucinated classes from generic AI helpers.`
  - `After: runnable answers traced to the exact LangGraph release you use.`
- **Primary CTA:** Button copy `Join the waitlist` (scroll target `#waitlist`). Keep the CTA outcome-focused.
- **Next-step note:** `After you submit, we’ll send a 30-second build-priorities survey so we ship the workflows you need first.`
- **Secondary CTA:** Text link `Review the instrumentation plan` opening a modal that summarizes analytics + measurement commitments.
- **Trust bar (3 items):**
  1. `Grounded in Metric-Driven Experimentation`
  2. `Backed by Supabase RAG + Neo4j validation`
  3. `Open source (MIT) — bring your own API keys`
- **Hero visual:** Side-by-side terminal/log panel.
  - **Left (Before):** Hallucinated error referencing a nonexistent LangGraph method (reuse real trace from dev tests if available).
  - **Right (After):** Validation script output from `check_ai_script_hallucinations` + successful LangGraph run. **TBD:** Capture a current run log; replace placeholder copy from existing HTML.

### 2. Value Pillars (Three-column block)
1. **Pillar title:** `Repo-grounded retrieval`
   - **Body copy:** `Semantic search (Supabase RAG) scopes every answer to your LangGraph docs and local source so responses cite runnable references.`
   - **Bullets:**
     - `Powered by the `perform_rag_query` tool exposed in the repo.`
     - `Examples trace back to `langgraph_dev/dev_test/test_case_results/case5`.`
   - **Asset:** Code snippet or screenshot of `perform_rag_query` returning a relevant file path. **Status:** Requires capture from Case 5 artifacts.

2. **Pillar title:** `Validation before delivery`
   - **Body copy:** `Every generation runs through the knowledge-graph checker so nonexistent nodes or parameters are rejected before you see them.`
   - **Bullets:**
     - `Leverages `check_ai_script_hallucinations` from the MCP server.`
     - `References the Neo4j graph built from your LangGraph clone.`
   - **Asset:** Animated terminal or GIF showing the validator blocking a bad call and passing the corrected run. Source: validation video at <https://youtu.be/oZZCUZ78QAc?si=YKwOiq_OdgZAJ7Nd>. **Status:** Asset needs to be edited down to 10–15 second clip.

3. **Pillar title:** `Metric-driven improvement`
   - **Body copy:** `We publish hallucination rate, first-pass success, and iteration count targets so you can hold the workflow accountable.`
   - **Bullets:**
     - `Targets pulled from Metric-Driven Experimentation PRD.`
     - `Instrumentation hooks align with the waitlist & survey API spec.`
   - **Asset:** Static chart template illustrating target metrics (label as prototype). **Status:** Placeholder acceptable until real data captured; annotate as **TBD** in UI.

### 3. Methodical Workflow Section
- **Section title:** `How the workflow keeps answers grounded`
- **Intro sentence:** `The assistant follows a transparent Retrieve → Generate → Validate loop so every step can be audited.`
- **Diagram:** Inline Mermaid from `images/query_workflow_v2.md` (already approved). Ensure alt text describes the flow for screen readers.
- **Callout list (`What you get`):**
  - `Step-by-step reasoning transcripts paired with validation status.`
  - `Exportable runbook for replicating the workflow inside CI.`
  - `Hooks for tracing tools like LangSmith (planned integration).`

### 4. Proof Stack
- **Section title:** `Proof that it already runs`
- **Intro copy:** `We document each claim with runnable evidence. Start with these.`
- **Cards:**
  1. **Validation Playback** — `Watch the reflection agent locate the right docs, regenerate the fix, and pass validation.` Link to the 90-second YouTube demo (`oZZCUZ78QAc`). Note: keep duration honest; trim video if final cut differs.
  2. **Case 5 Run Logs** — `Compare Gemini and OpenAI runs instrumented against the same LangGraph scenario.` Link to both log files in `langgraph_dev/dev_test/test_case_results/case5/`.
  3. **Hallucination Watchdog** — `Open-source detector that blocks mismatched symbols before responses ship.` Link to `mcp-crawl4ai-rag/knowledge_graphs/ai_hallucination_detector.py`.
  4. **Security & Transparency** — `MSeeP security assessment and README policy keep expectations clear.` Link to repo README badge.
- **Note:** Remove marketing phrases like “Codex-grade”; anchor all copy in observable artifacts.

### 5. FAQ
- **Section title:** `Questions LangGraph developers ask`
- **Intro:** `Answers stay short and direct; link deeper docs where needed.`
- **Entries:**
  1. **Who is it for?** — `Individual LangGraph developers and teams who need grounded, version-correct assistants.`
  2. **How is it different from the docs?** — `The assistant maps your repo into the knowledge graph, so responses reference the exact nodes and edges you run.`
  3. **What do early partners receive?** — `Guided onboarding, direct access to experiment summaries, and priority on feature requests collected via the insight survey.`
  4. **Is it open source?** — `Yes. The framework is MIT licensed; you host your own API keys and data.`
  5. **How is my data handled?** — `Waitlist emails and survey responses follow the storage plan in the API design doc. Detailed privacy note publishes with Stage 5.` (**TBD** until policy published.)

### 6. Waitlist CTA Block
- **Heading:** `Join the LangGraph Dev Navigator waitlist`
- **Body copy:** `Tell us where to send the onboarding runbook and we’ll share new validation results as they land.`
- **Form fields:**
  - Email (required)
  - Role / focus area (optional text field)
- **Button copy:** `Join the waitlist`
- **Success handling:** Redirect to `thank-you.html` with `userId` query param from API response.
- **Legal / trust notes:**
  - `We respect inboxes. Expect a monthly update with experiment summaries—nothing more.`
  - `By joining, you consent to secure storage of your email for waitlist updates and aggregated experiment reporting. See the privacy & measurement disclosure.` (**TBD:** insert real link once document exists per Story 5.)

### 7. Footer
- **Body copy:** `Built by the LangGraph Dev Navigator team.`
- **Link:** GitHub repo URL.
- **Metric targets:** `Hallucination rate target <2% • First-pass success target ≥50% (baseline TBD) • Response time SLA <5s`
  - Mark these explicitly as **targets** sourced from the PRD; do not imply live data until instrumentation confirms.

### 8. Modal — Instrumentation & Evidence Plan
- **Title:** `Instrumentation & Evidence Plan`
- **Body bullets:**
  - `Client-side events follow the analytics spec (cta_click_primary, waitlist_submit_success, survey_start, etc.).`
  - `Backend adheres to waitlist & survey API design (email storage, userId issuance, survey payload schema).`
  - `Weekly experiment summaries shared with the waitlist (aggregated, anonymized).`
- **CTA:** `Close`

---

## Stage 2 — Insight Engine (Thank You Page)

### 1. Confirmation Hero
- **Headline:** `Thanks for joining — help us prioritize your workflows.`
- **Sub-head:** `Select the LangGraph assistant capabilities you need and we’ll notify you as they launch.`
- **Supporting line:** `Your responses stay internal and guide the experiment backlog.`

### 2. Survey Groups & Copy
Use four accordion or card groups with checkbox lists. Each option needs short helper text explaining the outcome.

1. **Core Development Experience**
   - `Automated debugging runs your failing nodes through the validator and proposes fixes.`
   - `AI-powered test generation creates runnable graph tests for new flows.`

2. **Platform & Deployment**
   - `Managed knowledge server (Supabase + Neo4j) so your team skips the infra lift.` (**TBD:** confirm offering before launch.)
   - `One-click agent publishing packages validated graphs for LangServe or similar deployment.`

3. **Advanced Agent Capabilities**
   - `Observable agents stream intermediate reasoning and metrics to LangSmith-compatible traces.`
   - `Self-improving agents re-run failed tasks with new context without manual prompts.`
   - `Architectural guidance suggests graph patterns backed by runnable examples.`

4. **Enterprise & Team**
   - `On-prem / VPC deployment keeps all data within your network.`
   - `Advanced IAM & security auditing integrates with existing policies.`
   - `CI/CD integration enforces validation before merges.`

### 3. Additional Inputs
- **Free-text field:** `Critical workflow you need covered` (optional).
- **Toggle:** `Interested in beta testing?` (Boolean).
- **Submission CTA:** `Submit my build priorities`
- **Success state:** `Thanks! We’ll email you as soon as the workflows you selected are ready.`

### 4. Privacy & Data Handling Callout
- **Copy:** `We store survey responses in Postgres per the waitlist API design and only use them to prioritize roadmap decisions.`
- **Link:** Placeholder for privacy note (**TBD** — publish with Story 5).

### 5. Analytics Triggers
- `survey_start` fires when the page confirms the `userId` query param.
- `feature_select` includes feature key + state.
- `survey_submit` on successful API response.
- `survey_error` on failure (surface inline error message).

---

## Outstanding Follow-ups (Summary)
- Replace placeholder hero log output with current validation run (Engineering).
- Produce pillar assets (code snippet, validator GIF, metric chart prototype) — owners listed above.
- Publish privacy & measurement disclosure referenced in CTA + Stage 2 callout (PM/Legal).
- Confirm managed knowledge server offer before locking copy (Product).

