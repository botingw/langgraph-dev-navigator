# Story Spec: Automation Script

**User Story:** As a developer, I want to run a single interactive script that handles all the tedious configuration and installation steps for the MCP server, so I can avoid manual file editing and reduce the chance of errors.

---

### Feature 2.1: Create Interactive Setup Script `setup_mcp_server.sh`

**Description:** Develop a user-friendly bash script at the project root that automates the entire setup process for the `mcp-crawl4ai-rag` server.

*   **Acceptance Criteria:**
    *   A script named `setup_mcp_server.sh` exists in the project root and is executable.
    *   Running the script successfully configures and installs the MCP server without requiring the user to manually edit files or run installation commands.
    *   The script prompts the user for all necessary secrets and configuration values.
    *   The script exits with a helpful error message if prerequisites (`git`, `uv`) are not met.
    *   The script provides clear status messages to the user as it progresses.

*   **Implementation Plan:**
    - [ ] Create and `chmod +x` the `setup_mcp_server.sh` file.
    - [ ] Implement prerequisite checks for `git` and `uv`.
    - [ ] Use `read` commands to create interactive prompts for API keys and URLs.
    - [ ] Add logic to programmatically generate the `mcp-crawl4ai-rag/.env` file from user input.
    - [ ] Add commands to `cd` into `mcp-crawl4ai-rag` and run the `uv` installation and ingestion commands.
    - [ ] Add `echo` statements for user feedback and `set -e` for error handling.
    - [ ] Update the `README.md` to recommend using this script as the primary setup method.
    - [ ] Create a pull request for review.
