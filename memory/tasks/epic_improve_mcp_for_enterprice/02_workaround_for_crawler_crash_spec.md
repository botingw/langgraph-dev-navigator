# Story Spec: Workaround for Crawler Crash on Cloud Run

**User Story:** As an Ops engineer, I need the remote MCP server to start reliably on Cloud Run, so that developers can access critical knowledge base and RAG tools, even if it means temporarily disabling some functionality.

---

### Feature 2.1: Prevent Server Crash by Removing Crawler Dependencies

**Description:** After enabling HTTP transport, a new startup crash was discovered on Cloud Run. The server fails during initialization because Playwright cannot find its required browser executable. This is a fatal error that makes the entire MCP server unavailable. The immediate workaround is to create a "crawler-less" version of the server for remote deployment, ensuring core functionalities remain online.

*   **Acceptance Criteria:**
    *   A version of the MCP server (`crawl4ai_mcp_debug_2_3.py`) exists that does not initialize `AsyncWebCrawler` or its dependencies.
    *   This server version deploys and starts successfully on Cloud Run without the `playwright._impl._errors.Error: Executable doesn't exist` crash.
    *   Clients can connect to the deployed server via HTTP and use non-crawler tools (e.g., `perform_rag_query`).
    *   The root cause (missing Playwright executable in the Cloud Run environment) is documented, and a future task is created to address it properly.

*   **Technical Context:**
    *   **Problem:** The server crashes on startup with the error `playwright._impl._errors.Error: BrowserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium-1169/chrome-linux/chrome`.
    *   **Root Cause:** The Docker image running on Cloud Run does not have the Playwright-managed Chromium browser installed at the expected path, causing a fatal error during the `lifespan` initialization of `AsyncWebCrawler`.
    *   **Workaround:** The `crawl4ai_mcp_debug_2_3.py` script was modified to completely remove the initialization and usage of `AsyncWebCrawler`, thus avoiding the call to Playwright.

*   **Implementation Plan:**
    - [x] Identify the startup crash caused by Playwright in the Cloud Run environment.
    - [x] Create a dedicated server script for remote deployment (`crawl4ai_mcp_debug_2_3.py`).
    - [x] In the remote script, remove all code related to `AsyncWebCrawler`, including its instantiation in the `lifespan` context manager and any associated tools.
    - [x] Deploy the modified script to Cloud Run.
    - [x] Verify that the server starts and that non-crawler tools are accessible.
    - [x] Document this workaround and create a new story to track a proper fix.
