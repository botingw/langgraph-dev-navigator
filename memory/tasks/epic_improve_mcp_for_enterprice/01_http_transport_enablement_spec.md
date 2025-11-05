# Story Spec: HTTP Transport Enablement

**User Story:** As an enterprise developer or an ops engineer, I want to run the MCP server with an `http` transport so that I can deploy it in a standard, scalable cloud environment without relying on `stdio` or unstable `sse` connections.

---

### Feature 1.1: Add HTTP Transport Support to MCP Server

**Description:** The `crawl4ai_mcp.py` script will be updated to support `http` as a transport mechanism, selectable via an environment variable. This aligns with the need for a stable, industry-standard deployment option for enterprise use cases.

*   **Acceptance Criteria:**
    *   Setting `TRANSPORT=http` in the `.env` file successfully starts the server in HTTP mode.
    *   The `main()` function in `src/crawl4ai_mcp.py` correctly identifies the `http` transport option and calls the appropriate `mcp.run_*` method.
    *   The server runs without errors when `TRANSPORT=http` is set.
    *   The `start_mcp_server.sh` script continues to work as the entry point without modification.
    *   The default transport, if `TRANSPORT` is not set, remains `sse` to maintain backward compatibility.

*   **Technical Context:**
    *   **Key File:** `mcp-crawl4ai-rag/src/crawl4ai_mcp.py` - The main server script. The entry point logic is in the `main()` async function at the end of the file.
    *   **Configuration:** The transport mechanism is controlled by the `TRANSPORT` environment variable, loaded from a `.env` file.
    *   **Framework:** The server uses `FastMCP`. The epic `README.md` references FastMCP documentation for HTTP transport, suggesting a method like `mcp.run_http_async()` likely exists, analogous to the existing `mcp.run_sse_async()` and `mcp.run_stdio_async()`.

*   **Implementation Plan:**
    - [ ] Create a new branch (e.g., `support-http-transport`).
    - [ ] Modify the `main()` function in `mcp-crawl4ai-rag/src/crawl4ai_mcp.py` to include a new `elif transport == 'http':` condition.
    - [ ] In the new branch, call the appropriate async run method for HTTP transport. Assume `mcp.run_http_async()` based on framework conventions.
    - [ ] Update the `else` condition to explicitly handle the `stdio` case for clarity.
    - [ ] Manually test the change by setting `TRANSPORT=http` in a local `.env` file and running `start_mcp_server.sh`.
    - [ ] Create a pull request for review.
