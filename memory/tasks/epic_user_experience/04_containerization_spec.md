# Story Spec: Full Containerization

**User Story:** As an advanced developer, I want to use Docker to run the MCP server in an isolated environment, ensuring consistency and simplifying deployment.

---

### Feature 4.1: Docker-based Deployment

**Description:** Provide a verified, step-by-step guide and the necessary configuration to run the MCP server as a Docker container that can successfully connect to external services (like Neo4j) running on the host machine.

*   **Acceptance Criteria:**
    *   A developer can follow a guide to successfully build and run the MCP server in a Docker container.
    *   The containerized MCP server successfully connects to the Neo4j database running on the host machine.
    *   The `validate_setup.py` script (from Story #3) can be executed *against* the containerized server and pass all checks.
    *   The root `README.md` is updated with instructions for the Docker-based setup.

*   **Implementation Plan:**
    - [ ] **Task: Create a Connection Test Script:**
        - [ ] Create a new, temporary Python script (`mcp-crawl4ai-rag/test_docker_neo4j.py`).
        - [ ] This script will *only* contain the logic to connect to Neo4j using credentials from the `.env` file.
        - [ ] It should print a "SUCCESS" or "FAILURE" message. This allows for a fast, isolated test of the core problem.
    - [ ] **Task: Verify the Docker-to-Host Connection:**
        - [ ] Manually configure the `mcp-crawl4ai-rag/.env` file, setting `NEO4J_URI=bolt://host.docker.internal:7687`.
        - [ ] Build the Docker image: `docker build -t mcp/test-neo4j .`
        - [ ] Run the container, overriding the entrypoint to execute our test script: `docker run --env-file .env mcp/test-neo4j uv run python test_docker_neo4j.py`.
        - [ ] Confirm the script prints "SUCCESS". This validates that the primary blocker is resolved.
    - [ ] **Task: Document the Full Process:**
        - [ ] Once verified, update the root `README.md` with the full, detailed instructions for Docker-based setup, including:
            - Prerequisites (Docker, Neo4j on host).
            - The OS-specific `NEO4J_URI` configuration (`host.docker.internal` for Mac/Win, `172.17.0.1` for Linux).
            - The `docker build` and `docker run` commands.
            - Instructions on how to run the `validate_setup.py` script against the running container.
    - [ ] **Task: Clean Up:**
        - [ ] Remove the temporary `test_docker_neo4j.py` script.
    - [ ] Create a pull request for review.
