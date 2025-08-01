# Data Models for Crawl4AI RAG MCP Server

This document outlines the data models for the two primary databases used by this MCP server: Supabase (for Retrieval-Augmented Generation) and Neo4j (for AI Hallucination Detection).

---

## Supabase: The RAG and Content Database

Supabase acts as the vector database for all Retrieval-Augmented Generation (RAG) tasks. It stores the textual content crawled from websites and the vector embeddings needed for semantic search. The schema is defined in the `crawled_pages.sql` file.

There are three main tables:

### `sources` Table

This table acts as a directory of all the websites that have been crawled.

*   **Purpose**: To keep track of which domains have been indexed and to store high-level metadata about them.
*   **Verified Columns**:
    *   `source_id` (text, primary key): The unique domain name (e.g., `crawl4ai.com`).
    *   `summary` (text): A brief, AI-generated summary of the content from that source.
    *   `total_word_count` (integer): The total word count of all content from that source.
    *   `created_at` (timestamp): Timestamp of creation.
    *   `updated_at` (timestamp): Timestamp of the last update.
*   **How it's used for RAG**: This table is queried by the `get_available_sources` tool. The returned `source_id` can then be used as a filter in other query tools to restrict the search to a specific website.

### `crawled_pages` Table

This is the primary table for storing general website content.

*   **Purpose**: To hold the text content from crawled web pages, broken down into manageable chunks for efficient semantic search.
*   **Verified Columns**:
    *   `id` (bigserial, primary key): A unique identifier for each chunk.
    *   `url` (varchar): The source URL where the content was found.
    *   `chunk_number` (integer): The zero-based index of the chunk from its source URL. This is a dedicated column.
    *   `content` (text): The actual text of the chunk.
    *   `metadata` (jsonb): A JSON object containing additional contextual information like headers and word counts.
    *   `source_id` (text): The domain of the URL, acting as a foreign key to the `sources` table.
    *   `embedding` (vector): A 1536-dimension vector representation of the `content` for semantic search.
    *   `created_at` (timestamp): Timestamp of creation.
*   **How it's used for RAG**: The `perform_rag_query` tool converts a search query into a vector and uses it to find the rows in this table with the most similar `embedding` vectors, returning the most relevant `content`.

### `code_examples` Table

This is a specialized table used only when the `USE_AGENTIC_RAG=true` feature is enabled.

*   **Purpose**: To store code snippets and their AI-generated summaries separately from general text, allowing for highly targeted code searches.
*   **Verified Columns**:
    *   `id` (bigserial, primary key): A unique identifier for each code example.
    *   `url` (varchar): The source URL where the code was found.
    *   `chunk_number` (integer): The zero-based index of the code block from its source URL.
    *   `content` (text): The raw code snippet itself.
    *   `summary` (text): An AI-generated summary of what the code does.
    *   `metadata` (jsonb): A JSON object for additional metadata.
    *   `source_id` (text): The domain of the URL, acting as a foreign key to the `sources` table.
    *   `embedding` (vector): A 1536-dimension vector representation of the code and/or its summary.
    *   `created_at` (timestamp): Timestamp of creation.
*   **How it's used for RAG**: The `search_code_examples` tool specifically targets this table to find functional code examples based on a natural language query.

#### Note on `USE_CONTEXTUAL_EMBEDDINGS`

Enabling `USE_CONTEXTUAL_EMBEDDINGS=true` does **not** change the database schema. Instead, it alters the **process** of generating the vector stored in the existing `embedding` column. It uses an LLM to create a richer, more contextually-aware summary of a chunk *before* creating the vector, resulting in a higher-quality embedding stored in the same column.

---

## Neo4j: The Knowledge Graph for Code Structure

Neo4j is a graph database used exclusively for the AI Hallucination Detection feature. It models the structural relationships within a codebase to validate AI-generated code.

The data model consists of Nodes (entities) and Relationships (connections).

### Nodes (The "Things" in a Codebase)

*   `Repository`: The top-level node representing a GitHub repository.
*   `File`: A single Python file (`.py`) within a repository.
*   `Class`: A class defined within a file.
*   `Method`: A method defined within a class. It has properties like `params_list` and `params_detailed` to store its signature.
*   `Function`: A standalone function defined within a file, which also stores its signature.
*   `Attribute`: An attribute belonging to a class.

### Relationships (The "Connections" Between Things)

*   `[:CONTAINS]`: Connects a `Repository` to the `File` nodes within it.
    *   `(Repository)-[:CONTAINS]->(File)`
*   `[:DEFINES]`: Connects a `File` to the `Class` or `Function` nodes it defines.
    *   `(File)-[:DEFINES]->(Class)`
    *   `(File)-[:DEFINES]->(Function)`
*   `[:HAS_METHOD]`: Connects a `Class` to the `Method` nodes it contains.
    *   `(Class)-[:HAS_METHOD]->(Method)`
*   `[:HAS_ATTRIBUTE]`: Connects a `Class` to its `Attribute` nodes.
    *   `(Class)-[:HAS_ATTRIBUTE]->(Attribute)`

### How it's Used for Hallucination Detection

This graph structure is not used for semantic RAG. Its purpose is to allow the `check_ai_script_hallucinations` tool to perform structural validation. To check if a method call is valid, the tool traverses the graph to see if the corresponding `Class` has a `[:HAS_METHOD]` relationship to a `Method` with that name, and then it checks the method's stored parameters to validate the signature of the call.

---

## Source File References

*   **`crawled_pages.sql`**: The ground-truth SQL file that defines the Supabase tables and their structures.
*   **`README.md`**: Describes the purpose of each database and provides the high-level Neo4j schema.
*   **`src/crawl4ai_mcp.py`**: Shows the tools that interact with these databases and contains the detailed Neo4j schema in the `query_knowledge_graph` docstring.