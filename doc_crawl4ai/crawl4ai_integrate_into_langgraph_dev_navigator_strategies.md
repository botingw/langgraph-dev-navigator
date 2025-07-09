# Combined Strategy for Crawl4AI Integration and Enhancement

This document outlines the architectural and implementation strategy for integrating the `mcp-crawl4ai-rag` server into the `langgraph-dev-navigator` project and the key features we will build.

## 1. Core Objective & Key Challenges

The primary goal is to leverage the RAG server as a core component for code analysis and generation. This moves beyond simple file-based context to an active, queryable knowledge engine. 

This requires a solution that addresses several key challenges:

*   **Code Modification:** We must be able to modify and extend the RAG server's functionality.
*   **Upstream Syncing:** We need a clean way to pull in future updates from the original `coleam00/mcp-crawl4ai-rag` repository.
*   **Dependency Conflicts:** The RAG server has specific dependencies that may conflict with the main application's environment.
*   **Architectural Clarity:** The integration must be maintainable, with clear separation between components.

## 2. Architectural & Integration Strategy (The "How")

To manage dependencies and ensure a clean architecture, we will adopt the following integration strategy.

### 2.1. Code Integration: Git Submodule

We will integrate the `mcp-crawl4ai-rag` code as a Git submodule pointing to our own fork (`botingw/mcp-crawl4ai-rag`).

*   **Implementation Steps:**
    1.  **Fork:** Create a fork of `coleam00/mcp-crawl4ai-rag` under the `botingw` organization/user.
    2.  **Add Submodule:** In the root of the `langgraph-dev-navigator` repository, run:
        ```bash
        git submodule add https://github.com/botingw/mcp-crawl4ai-rag.git rag_server
        ```
    3.  **Cloning for Users:** The project's `README` must instruct users to clone using:
        ```bash
        git clone --recurse-submodules https://github.com/botingw/langgraph-dev-navigator.git
        ```
*   **Rationale:**
    *   **Componentization:** Treats the RAG server as a distinct, version-pinned dependency.
    *   **Controlled Modifications:** Changes are committed within the submodule, keeping its development lifecycle separate.
    *   **Clear Upstream Link:** Makes it straightforward to pull updates from the original upstream repository.

### 2.2. Dependency Management: Decoupled Services via MCP

We will run the RAG server as a standalone MCP process to isolate its environment. The main application will communicate with it via the Model-Context Protocol.

*   **Implementation Example:**
    1.  **Start RAG Server (Terminal 1):** The RAG server is run in its own isolated environment.
        ```bash
        # Navigate to the submodule directory
        cd rag_server
        
        # Create and activate its dedicated environment using uv
        uv venv
        source .venv/bin/activate
        
        # Install its exact dependencies
        uv pip install -r requirements.txt
        
        # Start the MCP server
        python src/crawl4ai_mcp.py
        ```
    2.  **Configure Main App:** The main application connects to the server via its MCP configuration (e.g., in `.gemini/settings.json`).
*   **Rationale:**
    *   **Total Isolation:** This completely prevents dependency conflicts.
    *   **Clear Contract:** The MCP tool definitions provide a formal, explicit contract between the two services.

## 3. Key Feature Initiatives (The "What")

Within the integrated submodule, we will implement the following key features.

### 3.1. Initiative 1: Unified Repository Ingestion

**Goal:** Create a single, robust tool capable of processing a GitHub repository for both documentation (for RAG) and Python code (for the Knowledge Graph).

*   **Actions:**
    1.  Implement a new unified tool, `ingest_github_repository`, in the `mcp-crawl4ai-rag` server.
    2.  The tool will accept a `repo_url` and an `ingest_types` parameter (e.g., `["docs", "code"]`).
    3.  It will identify and process both documentation files (`.md`, `.rst`, `.ipynb`) and Python source files (`.py`).
    4.  Documentation content will be passed to the RAG pipeline for storage in Supabase.
    5.  Python code will be passed to the Knowledge Graph pipeline for storage in Neo4j.
    6.  **Enhancement:** During documentation processing, extract and separately index all code snippets using the `USE_AGENTIC_RAG` pipeline to make them searchable via `search_code_examples`.

### 3.2. Initiative 2: Local Development & Testing Interface

**Goal:** Decouple the core ingestion logic from the MCP server to allow for faster, easier local development and testing via a command-line interface.

*   **Actions:**
    1.  **Refactor Core Logic:** Abstract the main functions for cloning, file identification, and data ingestion into a central, reusable `ingestion_engine.py` module within the submodule.
    2.  **Build CLI Runner:** Create a new script (`run_ingestion.py`) that uses `argparse` to provide a command-line interface to the core engine. This enables local execution without needing to restart the MCP server.

## 4. Combined Implementation Plan

1.  **Fork and Submodule:** Fork the `coleam00/mcp-crawl4ai-rag` repository and add it as a submodule to this project.
2.  **Refactor:** Refactor the core logic from the submodule's MCP tools into a reusable `ingestion_engine.py`.
3.  **Implement Unified Tool:** Create the `ingest_github_repository` tool in the MCP server as a thin wrapper around the new engine.
4.  **Implement CLI:** Create the `run_ingestion.py` script as another thin wrapper for local development.
5.  **Update Documentation:** Update the main project `README` to include instructions for cloning with `--recurse-submodules` and running the decoupled services.
