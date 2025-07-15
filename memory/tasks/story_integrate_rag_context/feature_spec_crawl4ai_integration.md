# Feature Specification: Crawl4AI Integration

**Feature Story:** As a developer, I want to integrate the `mcp-crawl4ai-rag` tool into the main project as a submodule to provide robust, reusable, and extensible repository ingestion capabilities for both knowledge graph creation and RAG.

## 1. Functional Requirements

### 1.1. Core Ingestion Engine
- The system must provide a centralized `ingestion_engine.py` module responsible for orchestrating the entire repository ingestion process.
- The engine must be decoupled from the MCP server and any specific tool implementation.
- The engine must support a pluggable architecture for different ingestion targets (e.g., Neo4j, Supabase).

### 1.2. Ingestion Pipelines
- **Code Ingestion:** The system must be able to parse Python files from a Git repository and store their abstract syntax trees (ASTs) in a Neo4j knowledge graph.
- **Documentation Ingestion:** The system must be able to process Markdown documentation files, chunk them intelligently, and store them as embeddings in a Supabase vector database for RAG.
- **Agentic RAG (Optional):** The system should be able to extract code blocks from documentation and store them as distinct, searchable examples in Supabase.

### 1.3. Configuration
- The ingestion pipelines must be configurable via environment variables (`USE_KNOWLEDGE_GRAPH`, `USE_AGENTIC_RAG`, etc.).
- The system must gracefully handle the disabling of any ingestion pipeline.

### 1.4. Error Handling and Resilience
- The ingestion process must be resilient to transient errors (e.g., network failures, temporary API unavailability).
- The system should attempt to complete as much of the ingestion as possible, even if individual files or components fail (partial success).
- Upon completion, the system must provide a clear summary report detailing which parts of the ingestion succeeded and which failed, allowing for easier diagnosis and retries.

## 2. Non-Functional Requirements

### 2.1. Modularity and Reusability
- The core logic must be abstracted into reusable and independent modules.
- The system should be easily extensible to support new ingestion targets or file types without requiring major refactoring.

### 2.2. Testability
- The decoupled architecture must allow for independent unit and integration testing of the ingestion engine and its components.

### 2.3. Usability
- The system must provide a simple command-line interface (CLI) for local execution of the ingestion engine.
- For integration with other tools, the engine should be accessible via a clear and simple API or function call.

## 3. Out of Scope
- Real-time or continuous ingestion. The ingestion process is designed to be triggered manually.
- Code analysis for languages other than Python.
- A graphical user interface for managing ingestion tasks.
