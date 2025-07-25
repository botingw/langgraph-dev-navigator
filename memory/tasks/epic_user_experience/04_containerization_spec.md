# Story Spec: Full Containerization

**User Story:** As an advanced developer, I want to use Docker Compose to manage the MCP server and its dependencies in an isolated environment, ensuring consistency and simplifying deployment.

---

### Feature 4.1: Docker-based Deployment

**Description:** Provide a `docker-compose.yml` file to containerize the MCP server. This is a future goal, contingent on resolving external dependencies.

*   **Acceptance Criteria:**
    *   **[DEFERRED]** A `docker-compose.yml` file exists at the project root.
    *   **[DEFERRED]** Running `docker-compose up -d` successfully builds and starts the MCP server.
    *   **[DEFERRED]** The containerized MCP server can successfully connect to all required external services, including Neo4j.

*   **Implementation Plan:**
    - [ ] **[BLOCKED]** Investigate and resolve the Neo4j compatibility issue within a Docker environment.
    - [ ] Once unblocked, create the `docker-compose.yml` file.
    - [ ] Define the `mcp-crawl4ai-rag` service.
    - [ ] Update the `setup_mcp_server.sh` script to optionally manage the `.env` file and then launch `docker-compose`.
