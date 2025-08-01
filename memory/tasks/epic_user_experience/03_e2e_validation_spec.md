# Story Spec: End-to-End Validation

**User Story:** As a developer, I want a simple way to verify that the entire MCP server setup is working correctly, so I can be confident that the RAG and Knowledge Graph features are fully operational before I start using them.

---

### Feature 3.1: Create a Two-Stage Post-Setup Validation Script

**Description:** Develop a Python script that runs a series of checks in two distinct stages to confirm that the MCP server can connect to its dependencies and that data has been ingested correctly.

*   **Acceptance Criteria:**
    *   A script named `validate_setup.py` exists in the `mcp-crawl4ai-rag/` directory.
    *   The script accepts a `--stage` argument (1 or 2).
    *   **Stage 1 (Connection Check):** Running the script with `--stage 1` (or by default) performs these checks:
        1.  Loading environment variables.
        2.  Connecting to Supabase.
        3.  Connecting to Neo4j.
    *   **Stage 2 (Data Integrity Check):** Running the script with `--stage 2` performs all Stage 1 checks, plus:
        1.  Verifying that the `crawled_pages` table in Supabase contains data.
        2.  Verifying that the Neo4j database contains nodes.
        3.  Performing a sample RAG query to ensure the end-to-end system works.
    *   The script exits with a non-zero status code if any check fails.
    *   The root `README.md` is updated to instruct the user to run the validation script at two points in the setup process (before and after ingestion).

*   **Implementation Plan:**
    - [x] Create the `mcp-crawl4ai-rag/validate_setup.py` file.
    - [x] **Task: Implement Argument Parsing:**
        - [x] Use `argparse` to handle the `--stage` command-line argument.
    - [x] **Task: Implement Stage 1 Checks:**
        - [x] Add logic to load environment variables from the `.env` file.
        - [x] Add a Supabase connection check.
        - [x] Add a Neo4j connection check.
    - [x] **Task: Implement Stage 2 Checks:**
        - [x] Add a check to query the row count of the `crawled_pages` table.
        - [x] Add a check to query the node count in Neo4j.
        - [x] Add a sample RAG query check.
    - [x] **Task: Update Documentation:**
        - [x] Modify `README.md` to include the two-stage validation process in the "Getting Started" guide.
    - [x] Create a pull request for review.
