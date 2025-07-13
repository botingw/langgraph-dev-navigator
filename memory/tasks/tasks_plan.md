# Task Plan: Crawl4AI Integration

This document tracks the tasks required to integrate and enhance the `mcp-crawl4ai-rag` server.

| Task ID | Description | Importance | Dependency | Status |
|---|---|---|---|---|
| 1 | **Fork and Submodule** | High | - | Done |
| | Fork the `coleam00/mcp-crawl4ai-rag` repository to `botingw/mcp-crawl4ai-rag` and add it as a submodule to the main project. | | |
| | **1.1 Verify MCP Server Setup** | High | Task 1 | Done |
| | Confirmed that the `mcp-crawl4ai-rag` submodule server runs locally and is accessible by Gemini CLI and Cline. Documented troubleshooting in `docs/mcp_crawl4ai_rag_setup_troubleshooting.md`. | | |
| 2 | **Refactor Core Logic** | High | Task 1 | In Progress |
| | **2.1 Abstract Core Logic** | High | Task 1 | In Progress |
| | Abstract the core ingestion logic from MCP tools into a new `src/ingestion_engine.py` within the submodule. | | |
| | **2.2 Verify Refactoring** | High | Task 2.1 | In Progress |
| | Create and run a test script to verify the `ingestion_engine.py` functionality. | | |
| | **2.3 Mitigate Rate Limit Issues** | High | Task 2.1 | In Progress |
| | Implement a token bucket rate limiter with exponential backoff to handle OpenAI API rate limits during ingestion. |
| | **2.3.1 Investigate .ipynb Token Amplification** | High | Task 2.3 | Not Started |
| | Analyze the token consumption of .ipynb files and determine strategies for efficient processing or selective exclusion. |
| | **2.3.2 Optimize Prompt Engineering for LLM Calls** | High | Task 2.3 | Not Started |
| | Refine LLM prompts (e.g., in `generate_contextual_embedding`) to reduce token overhead while maintaining output quality. |
| 3 | **Implement Unified Ingestion Tool** | High | Task 2 | Not Started |
| | Create the `ingest_github_repository` tool in `src/crawl4ai_mcp.py` as a thin wrapper around the new ingestion engine. | | |
| 4 | **Implement CLI Runner** | Medium | Task 2 | Not Started |
| | Create a `run_ingestion.py` script with `argparse` to provide a local command-line interface to the ingestion engine. | | |
| 5 | **Update Documentation** | Medium | Task 1 | Not Started |
| | Update the main project `README.md` to include instructions for cloning with `--recurse-submodules`. | | |