# Epic Overview: Enterprise MCP Transport Hardening

This epic focuses on making the `mcp-crawl4ai-rag` server production-ready for enterprise deployments that cannot rely on `transport=sse`. We will phase in `transport=http` while keeping `stdio` available for local tooling, eliminate Cloud Run instability triggered by SSE heartbeats, and prepare the server for managed hosting scenarios.

## Goal
- Deliver a deployable MCP server that supports `transport=http` as a first-class option beside `stdio` while leaving `sse` available for legacy parity.
- Remove Cloud Run dropouts caused by truncated SSE streams (see `fix_cloud_run_sse_server_disconnect_context.md`) so remote clients can maintain stable sessions.
- Align transport behavior with the product metrics in `memory/docs/product_requirement_docs.md`: lower hallucination risk through reliable server availability and increase development autonomy by allowing centralized MCP hosting.

## Why Now
- Current entry point (`src/crawl4ai_mcp.py`) only branches between `sse` and `stdio`, so setting `TRANSPORT=http` does nothing.
- Cloud Run kills idle SSE sessions after ~6 seconds (documented in the `fix_cloud_run_sse_server_disconnect_context.md` context memo), blocking remote enterprise usage.
- FastMCP upstream already documents Streamable HTTP (`running_server.md`, `http.md`), so we can reuse proven patterns instead of inventing new transport logic.

## Strategy
1. **Transport Parity (P0):** Add HTTP support and configuration flags so ops teams can launch the existing server behind a stable HTTP endpoint. Keep SSE as a fallback but document it as legacy.
2. **Reliability Hardening (P1):** Once HTTP works, revisit SSE heartbeat handling and Cloud Run timeouts to provide clear guidance or cutover plans.
3. **Deployment Playbooks (P2):** Provide reference manifests and monitoring hooks so enterprise teams can audit, scale, and secure the MCP server.

## Success Indicators
- A single `.env` toggle enables HTTP, and `start_mcp_server.sh` boots the server with the requested transport without manual edits.
- Remote clients stay connected for >10 minutes without heartbeat drops when `transport=http` is active.
- Documentation in this epic remains the source of truth for deployment decisions and feeds the higher-level UX epic (`../epic_user_experience/README.md`).

## References
- FastMCP local server guide: `running_server.md`
- FastMCP HTTP deployment guide: `http.md`
- Cloud Run SSE diagnostic: `fix_cloud_run_sse_server_disconnect_context.md`

---

### Key Discoveries & Decisions

*   **Initial SSE Instability:** The original SSE disconnect issue (periodic 6-7 second timeouts) appears to have been resolved as a side effect of upgrading the `fastmcp` library during the HTTP transport enablement.
*   **New Startup Crash Identified:** After the library upgrade, a more severe issue was uncovered. The server would fail to start on Cloud Run, crashing with a `playwright._impl._errors.Error: Executable doesn't exist`. This indicated that the Playwright browser dependency was not correctly installed or accessible in the Cloud Run container.
*   **Workaround Implemented:** To ensure the availability of critical RAG and knowledge graph tools, a workaround was implemented. A "crawler-less" server version (`crawl4ai_mcp_debug_2_3.py`) was created by removing all `crawl4ai` and `playwright` dependencies. This version starts reliably on Cloud Run.
*   **Future Work:** This workaround creates a known technical debt. The remote MCP server currently **cannot** support any crawler-based tools. A future story, "Properly Fix Crawler Dependencies on Cloud Run," is now tracked to find a robust solution, likely involving adjustments to the Dockerfile to ensure Playwright's browser binaries are correctly installed and available in the production environment.
