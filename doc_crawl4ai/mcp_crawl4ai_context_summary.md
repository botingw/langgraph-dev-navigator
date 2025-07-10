This summary outlines how an AI assistant should approach tasks related to the `mcp-crawl4ai-rag` submodule. It defines the purpose of the submodule, its architecture, its core functionalities, and which documents to consult for specific information.

### 1. High-Level Context and Purpose

**Objective**: The `mcp-crawl4ai-rag` directory is a Git submodule that functions as a standalone server. Its purpose is to provide this project with powerful **Retrieval-Augmented Generation (RAG)** and **Code Analysis** capabilities.

**How to Read**: For the overall integration strategy and the "why" behind this submodule, the primary document is `doc_crawl4ai/crawl4ai_integrate_into_langgraph_dev_navigator_strategies.md`.

### 2. Architecture Overview

The server has two distinct architectural pillars:

1.  **RAG System**: Crawls web content, processes it into chunks, generates embeddings, and stores it in a **Supabase** vector database for semantic search.
2.  **Knowledge Graph (KG) System**: Parses Python code from GitHub repositories, builds a model of the code's structure (classes, methods, etc.) in a **Neo4j** graph database, and uses this model to detect "hallucinations" in AI-generated code.

**How to Read**:
*   To understand the complete architecture, component interactions, and data flows, consult **`doc_crawl4ai/architecture_analysis.md`**.
*   For the specific database schemas (table structures in Supabase, node/relationship models in Neo4j), refer to **`doc_crawl4ai/database_models.md`**.

### 3. Core Functionality & Tools

The server's functionality is exposed via a set of tools in `mcp-crawl4ai-rag/src/crawl4ai_mcp.py`. The behavior of these tools is heavily dependent on environment variables defined in `mcp-crawl4ai-rag/.env`.

**Key `.env` Flags**:
*   `USE_AGENTIC_RAG`: Enables extraction and specialized searching for code examples.
*   `USE_HYBRID_SEARCH`: Combines keyword and vector search.
*   `USE_RERANKING`: Improves search result relevance with a cross-encoder model.
*   `USE_CONTEXTUAL_EMBEDDINGS`: Enhances embedding quality with more context (slower, more expensive).
*   `USE_KNOWLEDGE_GRAPH`: Enables all Neo4j-related features.

**Tool Summary**:

| Tool | Purpose | Key Dependencies/Notes |
| :--- | :--- | :--- |
| **Crawling & Ingestion** |
| `crawl_single_page` | Crawls one URL. | Quick and simple. |
| `smart_crawl_url` | Crawls an entire site, detecting sitemaps or performing recursive crawling. | The main tool for bulk ingestion. |
| `parse_github_repository` | Parses a GitHub repo's Python code into the Neo4j knowledge graph. | Requires `USE_KNOWLEDGE_GRAPH=true`. |
| **RAG & Search** |
| `get_available_sources` | Lists all crawled domains available for filtering searches. | Should be used before querying to see what can be filtered on. |
| `perform_rag_query` | Performs a semantic search over general crawled content. | The primary RAG tool. |
| `search_code_examples` | Searches specifically for code snippets and their summaries. | Requires `USE_AGENTIC_RAG=true`. |
| **Knowledge Graph** |
| `check_ai_script_hallucinations` | Validates a Python script against the code in the Neo4j graph. | Requires `USE_KNOWLEDGE_GRAPH=true`. |
| `query_knowledge_graph` | Allows direct exploration of the Neo4j graph with specific commands. | Requires `USE_KNOWLEDGE_GRAPH=true`. |

**How to Read**:
*   For a quick overview of all tools, read **`doc_crawl4ai/Crawl4AI_Function_Summary.md`**.
*   For a **detailed breakdown of each tool's parameters, return values, and internal logic**, the most important file is **`doc_crawl4ai/Crawl4AI_Function_Detail.md`**.
*   The ultimate source of truth for implementation is the main server file: **`mcp-crawl4ai-rag/src/crawl4ai_mcp.py`**.
*   For setup instructions, environment variables, and recommended configurations, consult **`mcp-crawl4ai-rag/README.md`**.

### 4. How an AI Should Approach Tasks

When a task involves the `mcp-crawl4ai-rag` submodule, the AI should follow this process:

1.  **Identify the Goal**: Is the task about crawling, querying, or code analysis?
2.  **Consult the Right Documentation**:
    *   **"How do I use tool X?"** -> Start with `Crawl4AI_Function_Detail.md`.
    *   **"How does the system work?"** -> Refer to `architecture_analysis.md`.
    *   **"What data is stored?"** -> Look at `database_models.md`.
    *   **"How do I set it up?"** -> Check the `README.md` and `boting_experience.md` for installation quirks.
3.  **Formulate a Plan**: Based on the documentation, select the correct tool(s) and parameters.
4.  **Execute and Verify**: Run the tool and interpret the JSON output. The source code in `crawl4ai_mcp.py` is the final reference for how the output is structured.