# Onboarding Guide: Epic - Improve User Experience

This document is the essential "onboarding packet" for any developer (human or AI) starting work on the "Improve User Experience" epic. Its purpose is to provide all the necessary context to understand the goals, plans, and technical details required to contribute effectively.

Reading these documents in the specified order will provide a complete understanding of the project's strategic goals and the epic's specific implementation details.

---

### **Part 1: One-Time Onboarding (The "Big Picture")**

Before diving into the epic's specific tasks, it is crucial to understand how this work fits into the larger `langgraph-dev-navigator` project. This should be done once when first joining the project.

*   **1. The Project's Constitution (`/META_DOC.md`)**
    *   **Purpose:** To understand the project's core mission, its overall system architecture, and the intended interaction between all its components. This is the most important starting point.

*   **2. The Server's Deep Dive (`/mcp-crawl4ai-rag/META_DOC.md`)**
    *   **Purpose:** This epic revolves around the setup of the MCP server. This document provides a detailed look into the server's own architecture, features, and operational runbooks.

*   **3. The Product Requirements (`/memory/docs/product_requirement_docs.md`)**
    *   **Purpose:** To understand the business drivers and success metrics for the project. This file explains *why* improving the user experience is a priority and how we will measure our success.

---

### **Part 2: Epic-Specific Context (The "Immediate Task")**

Once the big picture is clear, this context provides the detailed plans and specifications for this epic.

*   **1. The Epic's Strategic Plan (`/memory/tasks/epic_user_experience/README.md`)**
    *   **Purpose:** To understand the high-level strategy for this epic, including the phased approach (Docs -> Script -> Containerization) and the reasoning behind it.

*   **2. The Epic's Dashboard (`/memory/tasks/epic_user_experience/tasks_plan.md`)**
    *   **Purpose:** To get a high-level overview of all the stories within the epic, their priorities, dependencies, and current status.

*   **3. The Story Blueprints (`/memory/tasks/epic_user_experience/*_spec.md`)**
    *   **Purpose:** Before starting a specific story, read its corresponding spec file to understand its user story, detailed acceptance criteria, and the implementation task checklist.

*   **4. The Procedural Guide (`/memory/tasks/epic_user_experience/project_management_guide.md`)**
    *   **Purpose:** To understand the standard `Epic -> Story -> Task` workflow for this project, ensuring all contributions are consistent with our established process.

---

### **Part 3: Per-Story Onboarding (Just-in-Time Context)**

After completing the one-time onboarding, follow this lightweight process **every time you begin a new story**.

*   **1. Start with the Blueprint:** Always begin by reading the `[story_name]_spec.md` file for the story you are assigned. This is your immediate source of truth for the requirements and tasks.

*   **2. Identify Key Concepts and Files:** From the spec, identify the key technical terms, file paths, or commands mentioned.
    *   *Example for the "README Overhaul" story:* The key concepts are "Getting Started," "MCP Server Setup," `git clone --recursive`, `cp .env.example`, `uv pip install`, `test_build_langgraph_docs_knowledge.py`, and `start_mcp_server.sh`.

*   **3. Locate the Grounding Context:** Based on these keywords, locate the specific files you need to read to ensure your work is accurate. This is a "surgical strike" for context, not a broad review.
    *   *Example for the "README Overhaul" story:*
        *   To get the **environment variables** right, I must read: `mcp-crawl4ai-rag/.env.example`.
        *   To get the **installation and launch commands** right, I must consult the `mcp-crawl4ai-rag/META_DOC.md` (which documents the `Quick Start` commands) or the scripts themselves:
            *   `mcp-crawl4ai-rag/test_build_langgraph_docs_knowledge.py`
            *   `mcp-crawl4ai-rag/start_mcp_server.sh`
        *   To understand the **user's current starting point**, I must read the root `/README.md`.
