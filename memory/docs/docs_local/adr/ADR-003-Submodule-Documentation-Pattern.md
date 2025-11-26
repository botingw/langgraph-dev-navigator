# ADR-003: Submodule Documentation Pattern

*   **Status:** Accepted
*   **Date:** 2025-07-25
*   **Deciders:** Gemini, Boting

---

### Context and Problem Statement

This project relies on external git submodules (e.g., `mcp-crawl4ai-rag`) that have their own documentation (`README.md`). When writing our project's main `README.md`, we need to provide setup instructions for these submodules. A naive approach would be to copy the setup steps from the submodule's documentation into our own.

This creates a conflict between two core principles:

1.  **The User's Journey Should Be Seamless:** A user should not be forced to jump between different documentation files to complete a single setup process.
2.  **There Must Be a Single Source of Truth:** Duplicating instructions will inevitably lead to our documentation becoming stale and incorrect when the submodule is updated.

We need a pattern that provides a smooth user experience without creating a maintenance burden or providing inaccurate information.

### The Decision

We have decided to adopt a **"Cite and Curate"** pattern for documenting submodule setup in our main `README.md`.

This pattern consists of three parts:

1.  **Acknowledge the Dependency:** Explicitly state that the setup step involves configuring a submodule.
2.  **Summarize and Curate:** Provide a high-level summary of the required steps (e.g., "You will need to create a `.env` file and run an installation script."). Crucially, we will also add value by providing context specific to *our project* (e.g., "For this project, ensure you set `USE_KNOWLEDGE_GRAPH=true`.").
3.  **Cite the Source of Truth:** For the specific, detailed commands and instructions, we will provide a direct link to the relevant section of the submodule's own `README.md`. This is the canonical source of truth.

### Consequences

*   **Positive:**
    *   Our main `README.md` remains clean and high-level.
    *   The risk of our documentation becoming out of sync with the submodule is eliminated.
    *   The user journey is smooth; they are guided by our `README.md` and click a single link for the detailed commands when needed.
    *   We add specific value by curating the instructions for our use case.

*   **Negative:**
    *   There is a slightly higher cognitive load for the user, as they will have to click a link to see the detailed commands.
    *   We are dependent on the submodule maintaining clear, linkable headings in its documentation.
