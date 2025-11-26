# Meta Spec: langgraph-ai-rules_v4_1

## Purpose & Persona
- Purpose: Preserve the v4.1 engineering protocols with mode routing (Research, Architect, Implement) for LangChain/LangGraph/LangSmith tasks, enforcing Agentic RAG rigor and style mimicry.
- Output form: Copy `copilot_instructions_v4_1.md` verbatim into `langgraph-ai-rules_v4_1.md` (no edits).

## Source Inputs
- Base text: `llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v4_1.md` (copied verbatim from the original v4_1 instructions).
- Improvement guide: `guide_to_generate_onboard_guide/rules_design/modify_proposal_3_2.md` (adds mode split, planning verification, notes discipline).
- Design context: `guide_to_generate_onboard_guide/rules_design/agentic_rag_architectural_principles.md`, `guide_to_generate_onboard_guide/rules_design/agentic_rag_tech_spec_tool_definition.md`, `guide_to_generate_onboard_guide/rules_design/tool_examples_notes.md`.

## Core Behaviors to Preserve
- Funnel of Context: map → hybrid discovery (RAG + scoped rg) → skeleton → targeted read.
- Mode router: Mode A (Research/Q&A) with mandatory hybrid search and scratchpad; Mode B (Architect) requiring research-first verification and pseudo-code/file placement; Mode C (Implement) with style mimic, import guard, skeleton-before-diff.
- Notes discipline: log findings with path:line ranges; RAG outputs are leads only.
- Reference discipline: inline citations near claims plus References section; trust filesystem over RAG.

## Non-goals / Boundaries
- Do not collapse modes back into a single “ask” flow.
- Do not relax hybrid search, scratchpad, or citation requirements.
- Keep wording/style intact in the rules file; this meta is guidance, not a rewrite.

## When to Update This Meta
- New tool availability or command patterns that change the funnel steps.
- Changes to mode behaviors (e.g., added modes or altered verification rules).
- Significant shifts in LangChain/LangGraph doc layout affecting the mapping step.
