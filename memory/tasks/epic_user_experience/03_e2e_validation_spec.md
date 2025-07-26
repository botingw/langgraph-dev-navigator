# Story Spec: End-to-End Validation

**User Story:** As a developer, I want a simple way to verify that the entire MCP server setup is working correctly, so I can be confident that the RAG and Knowledge Graph features are fully operational before I start using them.

---

### Feature 3.1: Create a Post-Setup Validation Script

**Description:** Develop a Python script that runs a series of checks to confirm that the MCP server can connect to all its dependencies (Supabase, Neo4j) and perform a basic query for both RAG and the Knowledge Graph.

*   **Acceptance Criteria:**
    *   A script named `validate_setup.py` exists in the `mcp-crawl4ai-rag/` directory.
    *   Running `uv run python validate_setup.py` executes the checks.
    *   The script prints clear "SUCCESS" or "FAILURE" messages for each check:
        1.  Loading environment variables.
        2.  Connecting to Supabase.
        3.  Connecting to Neo4j.
        4.  Performing a sample RAG query.
        5.  Performing a sample Knowledge Graph query.
    *   The script exits with a non-zero status code if any check fails.
    *   The `README.md` and the `setup_mcp_server.sh` script are updated to instruct the user to run this validation script as the final step.

*   **Implementation Plan:**
    - [ ] Create the `mcp-crawl4ai-rag/validate_setup.py` file.
    - [ ] **Task: Implement Prerequisite Checks:**
        - [ ] Add logic to load environment variables from the `.env` file.
        - [ ] Exit with an error if required variables are missing.
    - [ ] **Task: Implement Supabase Connection Check:**
        - [ ] Add code to initialize the Supabase client.
        - [ ] Perform a simple query (e.g., list tables or fetch one item) to verify the connection and credentials.
    - [ ] **Task: Implement Neo4j Connection Check:**
        - [ ] Add code to initialize the Neo4j driver.
        - [ ] Run a basic Cypher query (e.g., `MATCH (n) RETURN count(n)`) to verify the connection.
    - [ ] **Task: Implement RAG Query Check:**
        - [ ] Reuse the `perform_rag_query` logic to ask a simple question (e.g., "what is LangGraph?").
        - [ ] Check that the query returns at least one document.
    - [ ] **Task: Implement Knowledge Graph Check:**
        - [ ] Reuse the `query_knowledge_graph` logic to run a simple query (e.g., `repos`).
        - [ ] Check that the query returns a valid response.
    - [ ] **Task: Update Documentation:**
        - [ ] Modify `README.md` to include `uv run python validate_setup.py` as the final step in the "Getting Started" guide.
        - [ ] Modify `setup_mcp_server.sh` to inform the user to run the validation script upon successful completion.
    - [ ] Create a pull request for review.
