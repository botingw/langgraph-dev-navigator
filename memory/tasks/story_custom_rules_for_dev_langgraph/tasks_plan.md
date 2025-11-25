# Task Plan: Custom Rules for LangGraph Development AI

This document summarizes the high-level tasks completed for this story.

## Tasks

1.  **Create Meta-Guide for AI Instruction:**
    -   **Status:** Done
    -   **Importance:** High
    -   **Dependencies:** None
    -   **Description:** Designed and wrote a comprehensive guide on the principles and best practices for creating system prompts and instructions for AI agents.
    -   **Artifact:** `langgraph_dev/langgraph_dev_instruction/00-meta-agent-onboarding-guide.md`

2.  **Create AI Playbook for Current Toolbox:**
    -   **Status:** Done
    -   **Importance:** High
    -   **Dependencies:** Task 1 (The principles from the meta-guide inform the playbook's structure).
    -   **Description:** Developed a detailed operational playbook for the AI, instructing it how to use its specific set of local file system and MCP server tools to develop and debug LangGraph applications. This includes a knowledge hierarchy and escalation paths.
    -   **Artifact:** `langgraph_dev/langgraph_dev_instruction/02-langgraph-ai-playbook.md`

3.  **Integrate after_v3 instruction updates:**
    -   **Status:** Done
    -   **Importance:** High
    -   **Dependencies:** Tasks 1–2 (meta guide and toolbox playbook).
    -   **Description:** Copy `copilot_instructions_v3_2.md` and `copilot_instructions_v4_1.md` verbatim into versioned rules files and preserve their behaviors per the after_v3 design docs.
    -   **Artifact:** `langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v3_2.md`, `langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v4_1.md`

4.  **Align task tracking with project management guide:**
    -   **Status:** In Progress
    -   **Importance:** Medium
    -   **Dependencies:** Task 3 (new instructions inform remaining milestones).
    -   **Description:** Keep this story plan in sync with the project management approach (epic dashboard + story tasks), noting statuses, dependencies, and deliverables for instruction updates.

5.  **Document version-specific meta specs:**
    -   **Status:** Done
    -   **Importance:** Medium
    -   **Dependencies:** Task 3 (rules files must exist).
    -   **Description:** Write meta design/spec docs that state goals, sources, and preservation rules for each rules version (v3_2, v4_1) to guide future iterations.
    -   **Artifact:** `langgraph_dev/langgraph_dev_instruction/guide_to_generate_onboard_guide/langgraph-ai-rules_v3_2_meta.md`, `langgraph_dev/langgraph_dev_instruction/guide_to_generate_onboard_guide/langgraph-ai-rules_v4_1_meta.md`
