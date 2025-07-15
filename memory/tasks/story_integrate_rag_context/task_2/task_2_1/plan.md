# Task 2 Plan: Refactor Core Ingestion Logic

**Objective**: Abstract the core logic for repository ingestion from `crawl4ai_mcp.py` and `knowledge_graphs/parse_repo_into_neo4j.py` into a new, reusable `src/ingestion_engine.py`. This will decouple the business logic from the MCP server, making it easier to test, maintain, and reuse in a future CLI.

---

### Part 1: Create the Ingestion Engine (`ingestion_engine.py`)

This file will become the central module for all repository processing.

1.  **`clone_repository(repo_url: str) -> str`**:
    *   **Responsibility**: Clones a Git repository to a temporary local directory.
    *   **Logic**: Move the `git.Repo.clone_from` logic from `parse_repo_into_neo4j.py` into this standalone function. It will create a temporary directory, clone the repo into it, and return the path to the temporary directory.

2.  **`get_repository_files(repo_path: str) -> Dict[str, List[Path]]`**:
    *   **Responsibility**: Identify all relevant code and documentation files within the cloned repository.
    *   **Logic**: Use the existing (but improved) file-walking logic from the user-provided `ingestion_engine.py`. This function will return a dictionary with two keys: `python_files` and `doc_files`, containing lists of `Path` objects.

### Part 2: Abstract Ingestion Pipelines

These functions will handle the two distinct ingestion processes.

1.  **`ingest_code_to_kg(repo_extractor: DirectNeo4jExtractor, python_files: List[Path]) -> Dict`**:
    *   **Responsibility**: Process all identified Python files and store their structure in the Neo4j Knowledge Graph.
    *   **Logic**: This function will iterate through the `python_files` list. For each file, it will use the `Neo4jCodeAnalyzer` to parse the file's AST and then use the `repo_extractor` instance to write the resulting data to Neo4j. It will return a summary dictionary with statistics (e.g., number of files processed, classes found).

2.  **`ingest_docs_to_rag(supabase_client: Client, doc_files: List[Path], source_id: str) -> Dict`**:
    *   **Responsibility**: Process all documentation files and store their content in the Supabase RAG database.
    *   **Logic**: This function will:
        *   Read the content of each file in the `doc_files` list.
        *   Call `smart_chunk_markdown` (reused from `crawl4ai_mcp.py`) on the content.
        *   Call `add_documents_to_supabase` (reused from `utils.py`) to handle embedding and storage.
        *   **Conditional Logic**: Internally, it will check the `USE_AGENTIC_RAG` environment variable. If `true`, it will also call `extract_code_blocks` and `add_code_examples_to_supabase` (reused from `utils.py` and `crawl4ai_mcp.py`).
        *   Return a summary dictionary with statistics (e.g., number of files processed, chunks created).

### Part 3: Create the Main Orchestrator

This will be the primary entry point for the engine.

1.  **`ingest_repository(repo_url: str, ingest_types: List[str] = ["code", "docs"]) -> Dict`**:
    *   **Responsibility**: Orchestrate the entire ingestion process from end to end.
    *   **Logic**:
        1.  Validate the `repo_url`.
        2.  Call `clone_repository` to get the local path.
        3.  Call `get_repository_files` to get the file lists.
        4.  **Conditional Logic**:
            *   If `"code"` is in `ingest_types` and `USE_KNOWLEDGE_GRAPH` is `true`, it will initialize the `DirectNeo4jExtractor` and call `ingest_code_to_kg`.
            *   If `"docs"` is in `ingest_types`, it will initialize the `SupabaseClient` and call `ingest_docs_to_rag`.
        5.  Clean up the temporary directory.
        6.  Return a consolidated JSON report summarizing the results of both ingestion processes.

---

### Part 4: Configuration and Scope Clarification

This section clarifies how the `ingestion_engine` will interact with the project's `USE_*` configuration flags.

*   **Ingestion-Time Flags (Handled by this engine)**:
    *   `USE_KNOWLEDGE_GRAPH`: Handled directly in the `ingest_repository` function. Code ingestion is skipped if this is `false`.
    *   `USE_AGENTIC_RAG`: Handled within the `ingest_docs_to_rag` function. Code example extraction from docs is skipped if this is `false`.
    *   `USE_CONTEXTUAL_EMBEDDINGS`: Handled **indirectly**. The engine calls the `add_documents_to_supabase` utility, which already contains the necessary logic to check this flag and enrich embeddings accordingly.

*   **Query-Time Flags (Out of Scope for this engine)**:
    *   `USE_HYBRID_SEARCH`: This affects how search queries are performed, not how data is ingested. It is outside the scope of this refactoring.
    *   `USE_RERANKING`: This also affects search-time behavior by re-ranking results. It is outside the scope of this refactoring.
