# no use this doc for now

# Recommended Guide for Knowledge Graph Operations

This guide provides the recommended, most reliable method for interacting with the Neo4j knowledge graph. Due to the instability of the MCP server's knowledge graph tools, **always prefer using the local Python scripts outlined below.**

## 1. Prerequisites: Before You Begin

These steps are **required** for the scripts to function correctly.

-   **Activate Virtual Environment:** Ensure the correct Python virtual environment is active to prevent `ModuleNotFoundError`.
-   **Install Dependencies:** All necessary dependencies must be installed (e.g., via `uv pip install -r requirements.txt` or `pip install -e .`).
-   **Set Neo4j Credentials:** The scripts require a `.env` file in the project root containing the `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD`.

## 2. Knowledge Graph Workflow

### A. Parsing a Repository

-   **Primary Method:** Use `test_parser.py` to parse a new GitHub repository. This is a simple wrapper script designed for this purpose.

**Workflow:**

1.  **Modify `test_parser.py`:** Open the script and update the `repo_url` variable to the target repository's URL.
2.  **Execute:**
    ```bash
    python3 test_parser.py
    ```
3.  **Verify:** The script will confirm when parsing is complete.

**Example:**
> To parse `https://github.com/langchain-ai/langgraph.git`, I will modify `test_parser.py` to set `repo_url = "https://github.com/langchain-ai/langgraph.git"` and then run `python3 test_parser.py`.

### B. Querying the Knowledge Graph

-   **Primary Method:** Use the `knowledge_graphs/query_knowledge_graph.py` command-line script to explore the graph.

**Workflow:**

-   **List all repositories:**
    ```bash
    python3 knowledge_graphs/query_knowledge_graph.py --repos
    ```
-   **Explore a repository's contents:**
    ```bash
    python3 knowledge_graphs/query_knowledge_graph.py --explore <repo_name>
    ```
-   **List classes in a repository:**
    ```bash
    python3 knowledge_graphs/query_knowledge_graph.py --classes <repo_name>
    ```

**Example:**
> To see which repositories are in the knowledge graph, I will run `python3 knowledge_graphs/query_knowledge_graph.py --repos`.

### C. Checking for Hallucinations

-   **Primary Method:** Use the `knowledge_graphs/ai_hallucination_detector.py` script.

**Workflow:**

-   **Run the detector on a script:**
    ```bash
    python3 knowledge_graphs/ai_hallucination_detector.py <path_to_script.py>
    ```

**Example:**
> To check `weather_agent.py` for hallucinations, I will run `python3 knowledge_graphs/ai_hallucination_detector.py weather_agent.py`.

## 3. RAG and Crawling Operations

While the MCP server provides tools for crawling and querying, these can also be performed using local scripts for greater reliability.

**Note:** Currently, there are no direct, pre-built script equivalents for the following MCP server functions. The functionality is contained within `src/crawl4ai_mcp.py` and `src/utils.py`, but they have not been exposed as standalone command-line scripts.

-   `crawl_single_page`
-   `smart_crawl_url`
-   `get_available_sources`
-   `perform_rag_query`
-   `search_code_examples`

To use these features, you must currently rely on the MCP server.
