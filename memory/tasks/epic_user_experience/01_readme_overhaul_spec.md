# Story Spec: README Overhaul

**User Story:** As a new developer, I want to consult a single, clear, and comprehensive `README.md` file to understand the project's value and follow a step-by-step guide to get my local and server environments running correctly.

---

### Feature 1.1: Restructure Root `README.md`

**Description:** The existing `README.md` will be refactored to create a more logical flow for a new user. The goal is to establish a clean structure that can be populated with the detailed guide.

*   **Acceptance Criteria:**
    *   The root `README.md` file is updated with the following top-level sections: `How It Works`, `Getting Started`, `Advanced Usage & Recipes`, `Contributing`.
    *   Existing content is correctly relocated to the new sections.
    *   The `Getting Started` section is present as a placeholder for the next feature.

*   **Implementation Plan:**
    - [x] Create a new branch (e.g., `feature/readme-overhaul`).
    - [x] Modify `/README.md` to create the new section structure.
    - [x] Move existing content into the appropriate new sections.
    - [x] Create a pull request for review.

---

### Feature 1.2: Implement the "Getting Started" Guide in `README.md`

**Description:** Populate the new "Getting Started" section with a detailed, two-part guide that walks the user through both the basic local setup and the advanced server setup.

*   **Acceptance Criteria:**
    *   A new user can follow the instructions in the `README.md` verbatim and successfully launch the MCP server.
    *   All shell commands are accurate and have been tested.
    *   All required environment variables for the MCP server are documented within the guide.
    *   The guide is clearly divided into "Part 1: Basic Setup" and "Part 2: Advanced Setup".

*   **Implementation Plan:**
    - [x] Write "Part 1: Basic Setup".
    - [x] Write "Part 2: Advanced Setup", including all subsections for prerequisites, configuration, installation, and launching.
    - [x] Verify all commands and instructions by performing a fresh setup.
    - [x] Create a pull request for review.

---

### Feature 1.3: Consolidate Critical Setup Instructions & Value Proposition

**Description:** To make the root `README.md` a true "single source of truth" for setup, critical instructions were pulled from the submodule's README and integrated directly. The value proposition was also clarified.

*   **Acceptance Criteria:**
    *   The root `README.md` contains a dedicated step for setting up the Supabase database schema using the `.sql` file.
    *   The "How It Works" section clearly explains the value of both RAG and the Knowledge Graph.
    *   The `README.md` includes a new "Key Tools" section to showcase the server's capabilities.
    *   Instructions are streamlined, and the purpose of each prerequisite is explained.

*   **Implementation Plan:**
    - [x] Enhance the "How It Works" section to detail RAG and KG capabilities.
    - [x] Add a new "Step 3: Set Up the Supabase Database" to the guide.
    - [x] Add a new "Key Tools Unlocked by the MCP Server" section under "Advanced Usage & Recipes".
    - [x] Refine and clarify instructions throughout the document.

---

### Feature 1.4: Provide Recommended Default Configurations

**Description:** The `.env.example` file was updated to provide sensible, project-specific defaults, and the `README.md` was updated to explain these defaults to the user.

*   **Acceptance Criteria:**
    *   The `mcp-crawl4ai-rag/.env.example` file contains the recommended default settings for `TRANSPORT`, RAG/KG strategies, and `NEO4J_URI`.
    *   The root `README.md` explains the key default settings and the reasoning behind them.

*   **Implementation Plan:**
    - [x] Update `mcp-crawl4ai-rag/.env.example` with the project's recommended configuration.
    - [x] Add a new subsection to the `README.md` explaining the key configurations (`TRANSPORT`, `NEO4J_URI`, etc.).
