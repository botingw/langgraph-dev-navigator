# Story Spec: Remote MCP Deployment on Google Cloud

**User Story:** As a remote MCP client user, I want to connect to a hosted MCP server without running any backend locally, so I can use the service by only configuring my tool client.

---

### Acceptance Criteria
* A deployed HTTP MCP endpoint is available at `{deployed-remote-http-mcp-server-url}` (real URL shared privately with early adopters).
* Client setup docs include ready-to-run snippets for Claude CLI and GitHub Copilot using the placeholder URL.
* Documentation explicitly tells users to request the actual URL privately; no secret values are committed to the repo.
* Remote users do not need any backend/local setup steps beyond client configuration.

---

### Implementation Plan
- [x] Deploy MCP server to Google Cloud Run (HTTP transport).
- [x] Verify connectivity end-to-end using the deployed endpoint.
- [x] Prepare client configuration snippets for Claude CLI and GitHub Copilot with `{deployed-remote-http-mcp-server-url}` placeholder.
- [x] Note that the real URL is distributed privately; placeholder remains in public docs.

---

### Notes
* Depends on HTTP transport enablement being complete (Story 1).
* Use rules/instructions v4_1 for remote users where applicable; local users keep existing rule version.
