# Meta Spec: langgraph-ai-rules_v3_2

## Purpose & Persona
- Purpose: Preserve the v3.2 Q&A specialist system prompt focused on LangChain/LangGraph/LangSmith accuracy. Identity is a single-purpose Q&A expert with strict workflow discipline.
- Output form: Copy `copilot_instructions_v3_2.md` verbatim into `langgraph-ai-rules_v3_2.md` (no edits).

## Source Inputs
- Base text: `llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v3_2.md` (copied verbatim from the original v3_2 instructions).
- Improvement guide: `guide_to_generate_onboard_guide/rules_design/modify_proposal_v3.md` (adds hybrid MCP + command search enforcement, scratchpad requirement, reference rigor).
- Design context: `guide_to_generate_onboard_guide/rules_design/agentic_rag_architectural_principles.md`, `guide_to_generate_onboard_guide/rules_design/agentic_rag_tech_spec_tool_definition.md`, `guide_to_generate_onboard_guide/rules_design/tool_examples_notes.md` (tool funnel, command recipes).

## Core Behaviors to Preserve
- Funnel of Context: navigation → discovery (RAG + exact search pairing) → structure → content.
- Mandatory pre-flight: read tree structure files; map-first before search.
- Tool priority: prefer MCP tools and `tool_examples_notes.md` command patterns; RAG as leads, filesystem as truth.
- Scratchpad: maintain investigation notes with path+line references during multi-step work.
- Q&A execution logic: declare matched rules, plan, verify via targeted reads; attach references for every major claim.

## Non-goals / Boundaries
- Do not introduce new modes beyond Q&A; v3_2 is ask-centric.
- Do not loosen reference requirements or hybrid search mandate.
- Do not rewrite style or tone; keep the original wording intact in the rules file.

## When to Update This Meta
- Tooling changes (new MCP tools or command recipes) that affect the funnel.
- Adjustments to scratchpad or reference discipline.
- Structural changes to LangChain/LangGraph docs that shift the mapping step.
