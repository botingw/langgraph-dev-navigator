# Proposal: Improvements to `copilot_instructions_v3.md`

## 0. Scope & Integration

- `modify_proposal_v2.md` already locks in the Agentic RAG funnel (navigation → discovery → skeleton → targeted reads) and the precision tooling contracts, so this proposal does **not** restate those mechanics.
- `copilot_instructions_v3.md` (and the emerging `copilot_instructions_v3_1.md`) already define the four execution phases; we keep that backbone intact.

This document only adds the additional behaviors uncovered in the latency test prompt: enforce hybrid MCP + command searches, mandate the `tool_examples_notes.md` command patterns, require an investigation notes file, and tighten reference discipline.

## 1. Problem Statement & Observations

When we ask simple conceptual questions like:

> “In the official LangChain, LangGraph, or LangSmith docs, what are the recommended techniques to reduce latency for agent or multi-agent workflows?”

the assistant frequently produces **shallow or incomplete answers**. A typical “raw” behavior (without extra user prompt engineering) looks like:

- Runs a couple of generic, high-level searches (e.g., “search codebase for `reduce latency agent workflow performance optimization parallel tool calls batching`”).
- Surfaces only the most obvious ideas (basic parallel tool calls, batch API calls, streaming, async).
- Misses **important latency-related techniques** that are clearly documented, such as:
  - Anthropic prompt caching in Deep Agents harness.
  - LangSmith background batching / serverless tracing behavior.
  - LangGraph fan-out/fan-in patterns, deferred node execution, Send API.
  - Multi-agent patterns that impact latency (e.g. supervisor vs swarm patterns).

In practice, to get a **complete, doc-backed answer**, we had to add substantial **user-level instructions**, including:

1. **Use both semantic search and exact text search**; do not rely on just one.
2. **Prefer MCP tools and the concrete command patterns from `prompt_dev/tool_examples_notes.md` over generic “default tools” or ad-hoc Python scripts.**
3. **Maintain an investigation note file** (e.g. `mcp-test-result/lang_question_note.md`) and append findings with references as you go, instead of only synthesizing at the end.
4. **Attach references for every major claim**, not just a loose references section.

Once those behaviors were injected at the user-prompt level, the assistant:

- Ran multiple `perform_rag_query` calls scoped to LangChain/LangGraph/LangSmith sources.
- Used `rg`/`find` with the exact patterns recommended in `tool_examples_notes.md`.
- Incrementally wrote findings (including file paths and line ranges) into the investigation note file.
- Produced a **much more complete** latency answer, with detailed references and coverage of many more techniques.

This demonstrates that **`copilot_instructions_v3.md` is directionally correct**, but it is not strong enough on:

- Enforcing a **hybrid RAG + exact-search strategy** for conceptual questions.
- Making **MCP tools and the curated command patterns** the default, rather than allowing vague “search codebase” behaviors.
- Requiring a **scratchpad / notes workflow** for multi-step investigations.
- Tightening the **“every key claim should be traceable to a local file+line”** rule.

The proposal below describes how to encode these successful behaviors directly into v3 so they do not depend on ad-hoc user prompts.

### Alignment with the Original Test Prompt

The original test user prompt explicitly required:

> “please consider both mcp server tools (semantic search) and other command tools (or any tools you have) for your investigation based on their proper (flexibly apply the characteristics of these tools and the situations in which they are best suited). if for a work (e.g. search terms in files) you can use commands or examples recommended in tool_examples_notes.md , choose it over your default command tools or python tools, your default tools are not very reliable. semantic search (e.g. rag) some times can find insight that exact keyword search cannot find so you should not only reply on exact search to collect information unless that information must be a exact term (like function name, error message, etc). when doing your investigation, when have any new finding, you can write your finding (include contents and reference paths) into lantency_investigation_note.md rather than organize your findings as final answer after finish all of investigations (you could forgot early result if you don't take note), then when you are ready to give me your answers this note file can help you memorize or organize your findings to the answer. please remember to attach references.”

### 1.3 Unique Deltas & Section Pointers

| Prompt requirement | Where this proposal handles it |
| --- | --- |
| Combine MCP semantic tools with precise command-line searches, depending on the situation. | Section 2.1 (Tool Arsenal) plus Section 2.2.1 (Workflow enforcement). |
| Prefer the vetted `tool_examples_notes.md` command recipes over default scripts. | Section 2.1. |
| Record every new finding in an investigation note as the work progresses. | Section 2.2.2. |
| Attach local file+line references for every major claim. | Section 2.3. |

---

## 2. Specific Changes to `copilot_instructions_v3.md`

This section describes **where** and **what** to change in the current v3 text.

### 2.1. Section “1. Tool Arsenal & Usage Protocols”

**Current behavior:**  
The section already defines the funnel (Navigation → Discovery → Structure → Content), but:

- It does not assert a **preference** for MCP tools + `tool_examples`-style commands over generic tools.
- It does not explicitly require combining RAG and exact search for conceptual queries.

**Proposed modifications:**

1. Under **Layer 2: Discovery (Low Cost)**:
   - Add language that **for conceptual questions**, the assistant should **always pair** `perform_rag_query` with at least one scoped `rg`/`grep` search, instead of choosing just one modality.
   - Add an explicit statement: **“Prefer these tools and command patterns over any opaque 'search' tools or ad-hoc Python scripts; those are considered less reliable.”**

2. Add a short note near the top of Section 1:
   - Emphasize that **MCP tools and the command workflows shown in `prompt_dev/tool_examples_notes.md` are the primary, trusted mechanisms** for retrieval and navigation.
   - Clarify that any generic “search codebase” shortcuts are **fallbacks only** when these are unavailable.

**Rationale:**  
This directly addresses the observed behavior where the assistant used only one fuzzy search path and missed relevant content, instead of systematically combining semantic and exact search.

---

### 2.2. Section “3. Q&A Execution Logic”

This section is where most of the new behavior should be encoded.

#### 2.2.1. Phase 1 / Phase 2: Make hybrid search mandatory for conceptual queries

**Current text (simplified):**

- Intent B (conceptual) → `perform_rag_query`.
- Phase 2 Concept Path → run `perform_rag_query` (and optionally others).

**Issues:**

- “Optionally” using `search_code_examples` or `query_knowledge_graph` and no explicit requirement to use `rg`/exact search means the model might rely only on RAG output.
- This is precisely what caused shallow answers in practice.

**Proposed changes:**

1. In **Intent B: Exploration** (conceptual), add a line:
   - “For conceptual questions, **always pair** at least one `perform_rag_query` call with scoped `rg`/`grep` searches in the most likely directories (as determined from the tree snapshots).”

2. In **Phase 2: Narrowing the Context → Concept Path**, change the bullet to:
   - Explicitly say:
     - Run `perform_rag_query` to get conceptual leads.
     - For each key term/feature that appears (e.g., “prompt caching”, “streaming”, “fan-out”), use `rg` scoped to the relevant repo section (`docs/src`, `langgraph/docs/docs`, etc.) to pull exact sections.
     - Verify file paths from RAG against the tree before reading.

**Rationale:**  
This locks in the “semantic + exact” combo that proved necessary to find all latency techniques.

#### 2.2.2. Add a “Scratchpad / Investigation Notes” requirement

**Current state:**  
v3 talks about phases (Routing, Narrowing, Verification, Synthesis) but does not mention maintaining a structured notes file or scratchpad across the investigation.

**Observed effective behavior:**

- During the latency investigation, the assistant:
  - Wrote findings (with file paths and line ranges) into `mcp-test-result/lang_question_note.md` (or similar) as it discovered them.
  - Used that file as memory to produce a comprehensive, organized final answer.

**Proposed addition:**

Add a new subsection under **Section 3** (e.g., after Phase 3) titled **“Phase 3.5: Scratchpad (Investigation Notes)”** or equivalent:

- For any non-trivial, multi-step question (e.g., “survey all techniques”, “compare behaviors across systems”, “investigate cause of latency”), the assistant must:
  - Maintain a **running notes file** (or scratchpad) for that task.
    - If the user provides a path (e.g. `mcp-test-result/..._investigation_note.md`), use it.
    - Otherwise, create or use a general-purpose path such as `mcp-test-result/lang_question_note.md` within the workspace’s notes area.
  - After each batch of tool calls (RAG, `rg`, file reads), **append**:
    - A short bullet summary of the finding.
    - The concrete file path and line range used (e.g., `docs/src/oss/langchain/models.mdx:443-469`).
    - Optional tags or headings to group related findings (e.g., “Streaming”, “Prompt caching”).
- When entering the Synthesis phase, the assistant should **skim its own notes file first** to avoid forgetting earlier discoveries.

**Rationale:**  
This converts the successful “investigation_note.md” pattern from an ad-hoc user instruction into a core behavior, reducing the chance that early findings are dropped in the final answer and making the reasoning more auditable.

**Example from Checkpoint Explanation:**

In responding to the checkpoint concept query, the assistant created and maintained `mcp-test-result/lang_question_note.md`, appending structured findings after each tool call:

- Summaries from RAG queries.
- File paths and line ranges from reads (e.g., `langgraph/docs/docs/concepts/persistence.md:1-100`).
- Used the notes to ensure the final answer cited all sources accurately.

This pattern was directly applied and proved effective for comprehensive, traceable answers.

---

### 2.3. Section “4. Answer Format (Default)”

**Current behavior:**

- Encourages references and distinguishing doc-backed facts vs inferences, but does not strictly require a file+line reference for each major claim.

**Problem:**  
Without a stronger rule, the assistant may produce vague references or only cite some of the claims, making it harder to audit or reproduce the answer.

**Proposed modifications:**

1. Strengthen the **References** bullet to say:
   - "For every **major claim or technique** in the answer (especially lists like 'Key Latency Techniques'), include at least one specific local file path and line/section hint that supports it, formatted as a clickable Markdown link if possible (e.g., `[docs/src/oss/langchain/models.mdx:443-469](docs/src/oss/langchain/models.mdx:443-469)` or `[langgraph/docs/docs/how-tos/graph-api.md # 'Parallel execution'](langgraph/docs/docs/how-tos/graph-api.md # 'Parallel execution')`)."
   - RAG IDs are **not sufficient**; they must be backed by local filesystem content whenever possible.

2. In the Synthesis phase (Section 3), add a line:
   - “When forming each final bullet or recommendation, check that it is backed by at least one entry in your notes file or by a specific file slice you have read during this session.”

**Rationale:**  
This ensures that the final answers have **complete traceability** and forces the assistant to treat local files as the source of truth, consistent with the Agentic RAG principles.

---

## 3. Expected Impact of v3.1

By making these changes, we expect:

1. **More complete conceptual answers**  
   - The assistant will systematically combine RAG and exact search, surfacing more documented techniques and edge cases (like prompt caching, deferred nodes, LangSmith batching) that were previously missed.

2. **More reliable and reproducible tooling behavior**  
   - By preferring MCP tools and `tool_examples` command workflows over ad-hoc “search” tools, behavior becomes more predictable across sessions and environments.

3. **Better memory across long investigations**  
   - The scratchpad/notes requirement prevents early findings from being lost and makes it easier for humans to review the investigation process.

4. **Stronger auditing and trust**  
   - Tightening the file+line reference requirement means answers are easier to verify and debug, aligning with the “precision over recall” philosophy of the Agentic RAG design.

Overall, v3.1 should encode the behaviors that already proved effective in the latency investigation, so that future questions get the same level of quality **without relying on additional user-side prompt engineering**.
