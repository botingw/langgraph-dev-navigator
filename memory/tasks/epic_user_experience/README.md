# Epic Overview: Improve User Experience

This document provides the strategic overview for the epic focused on improving the user experience for setting up and running the self-hosted `mcp-crawl4ai-rag` server.

## The Goal

The primary goal is to reduce friction, clarify the process, and make the advanced RAG and Knowledge Graph features of the `langgraph-dev-navigator` more accessible to new users.

## The Phased Approach

This epic will be executed in a series of prioritized phases. This approach delivers value incrementally and defers complex work until foundational pieces are in place.

*   **Phase 1 (P0): The "Single Source of Truth" README**
    *   **Strategy:** First, establish a clear, comprehensive, and accurate set of instructions. A user must have a reliable guide before we can automate it.
    *   **Story:** [README Overhaul](./01_readme_overhaul_spec.md)

*   **Phase 2 (P1): Automation - The Interactive Setup Helper**
    *   **Strategy:** With the manual process clearly documented, we can now automate the most tedious and error-prone steps (configuration, installation) with a guided script.
    *   **Story:** [Automation Script](./02_automation_script_spec.md)

*   **Phase 3 (P2): Full Containerization**
    *   **Strategy:** The ultimate goal for simplicity and reproducibility is a one-command Docker launch. This is the final phase, as it is dependent on the previous steps and currently has external blockers.
    *   **Story:** [Full Containerization](./04_containerization_spec.md)
