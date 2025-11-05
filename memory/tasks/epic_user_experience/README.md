# Epic Overview: Improve User Experience

This document provides the strategic overview for the epic focused on improving the user experience for setting up and running the self-hosted `mcp-crawl4ai-rag` server.

## The Goal

The primary goal is to reduce friction, clarify the process, and make the advanced RAG and Knowledge Graph features of the `langgraph-dev-navigator` more accessible to new users.

## The Strategy: Docker-First, with a Path for Advanced Users (Current as of July 2025)

This epic will be executed by providing two clear paths for users:

*   **The Docker-First Path (Recommended):** The primary goal is to provide a simple, one-command Docker setup that handles all dependencies and configurations. This is the recommended path for most users.
    *   **Story:** [Full Containerization](./04_containerization_spec.md)

*   **The Local Development Path (Advanced):** For developers who need to work on the server code directly, we will maintain a clear guide for setting up a local Python environment.
    *   **Story:** [README Overhaul](./01_readme_overhaul_spec.md)

---

### Obsolete Strategy (Pre-July 2025)

*Note: The following phased approach was the original plan. The success of the containerization spike (Story #4) proved that a Docker-first approach was superior and simpler, making the local automation script (Story #2) obsolete.*

**The Phased Approach**

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

### Related Epics

- **Enterprise MCP Configuration Hardening:** See `../epic_improve_mcp_for_enterprice/README.md` for the configuration-focused initiative that complements the user experience workstream.
