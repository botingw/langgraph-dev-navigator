backup: crawl4ai mcp repo has similar guide, whether we want duplicate it in our README?

#### Step 2.1: Prerequisites - External Services

To enable the server, you will need free or paid accounts with the following services:

*   **OpenAI:** For an API key to generate embeddings.
*   **Supabase:** For a vector database to store and query documentation.
*   **Neo4j:** For a graph database to store code structure for analysis.

#### Step 2.2: Configure the Server

1.  **Navigate to the Server Directory:**
    ```bash
    cd mcp-crawl4ai-rag
    ```

2.  **Create the Environment File:**
    Copy the example environment file. This file will hold your API keys and service credentials.
    ```bash
    cp .env.example .env
    ```

3.  **Edit the `.env` File:**
    Open the newly created `.env` file and fill in the following required variables with the credentials you obtained in Step 2.1:
    ```dotenv
    # Credentials (Required)
    OPENAI_API_KEY=...
    SUPABASE_URL=...
    SUPABASE_SERVICE_KEY=...
    NEO4J_URI=...
    NEO4J_USER=...
    NEO4J_PASSWORD=...

    # Enable Server Features (Set to true)
    USE_KNOWLEDGE_GRAPH=true
    USE_AGENTIC_RAG=true
    ```

#### Step 2.3: Install Dependencies & Ingest Knowledge

This one-time process sets up the server's environment and populates your Supabase and Neo4j databases with the LangGraph knowledge base.

1.  **Create Virtual Environment:**
    ```bash
    uv venv
    ```

2.  **Activate Environment:**
    ```bash
    source .venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    uv pip install -r requirements.txt
    ```

4.  **Run Knowledge Ingestion:**
    This script will clone, parse, and store the LangGraph documentation and code. This may take several minutes.
    ```bash
    uv run python test_build_langgraph_docs_knowledge.py
    ```

#### Step 2.4: Launch the Server

With the setup complete, you can now launch the MCP server.

```bash
bash start_mcp_server.sh
```

The server will now be running in the background, ready to provide RAG and Knowledge Graph tools to your AI agent.