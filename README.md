# LangGraph-Dev-Navigator

This repository streamlines and enhances the LangGraph development process by providing a comprehensive framework for using AI coding assistants in a grounded, reproducible, and efficient manner.

## How It Works

This project empowers developers to build robust, reliable, and well-documented LangGraph applications by ensuring AI-generated code adheres to best practices and leverages official, version-controlled documentation. It achieves this through two primary mechanisms:

1.  **A Local Knowledge Source:** It uses a local git submodule of the official `langchain-ai/langgraph` repository as the ground truth for documentation and code structure.
2.  **An Advanced Knowledge Server:** It includes the `mcp-crawl4ai-rag` server, which provides powerful Retrieval-Augmented Generation (RAG) for semantic search across documentation and a Knowledge Graph (KG) for validating generated code against the actual codebase structure.

## Getting Started

This guide provides a comprehensive walkthrough for setting up the `langgraph-dev-navigator`, from a basic local-only configuration to the full-featured setup with the MCP Knowledge Server.

### Part 1: Basic Setup (Local Knowledge Source)

This initial setup clones the repository and the required `langgraph` submodule. At this stage, an AI agent can use the local files as a knowledge source.

1.  **Clone the Repository:**
    ```bash
    git clone --recursive https://github.com/botingw/langgraph-dev-navigator.git
    cd langgraph-dev-navigator
    ```

2.  **Initialize Submodules (if not cloned recursively):**
    If you cloned the repository without the `--recursive` flag, you must initialize the submodules manually:
    ```bash
    git submodule update --init --recursive
    ```

### Part 2: Advanced Setup (MCP Knowledge Server)

This setup activates the powerful RAG and Knowledge Graph capabilities of the project by configuring and launching the `mcp-crawl4ai-rag` server submodule.

#### Prerequisites for Advanced Setup

To enable the full functionality of the MCP Knowledge Server, you will need accounts and API keys for the following services. We recommend setting these up *before* proceeding with the installation steps.

*   **OpenAI API Key:** Required for generating embeddings and using LLMs.
    *   [Get your API Key here](https://platform.openai.com/api-keys)
*   **Supabase:** Used as the vector database for RAG.
    *   [Create a Supabase project](https://supabase.com/dashboard/projects)
    *   You will need your Project URL and `service_role` key (found under Project Settings -> API).
*   **Neo4j:** Used as the graph database for Knowledge Graph functionality (hallucination detection, code analysis).
    *   [Sign up for Neo4j AuraDB (cloud)](https://neo4j.com/cloud/platform/aura-graph-database/) or [Install Neo4j Desktop (local)](https://neo4j.com/download/)
    *   **Recommendation:** For local development, consider using the [Local AI Package](https://github.com/coleam00/local-ai-packaged) for an easy local Neo4j setup.

#### Installation and Configuration

The setup involves configuring environment variables, installing dependencies, and running a one-time knowledge ingestion script.

**The complete, detailed instructions for this are maintained in the official submodule documentation.** This ensures you always have the most up-to-date information.

➡️ **[Click here to follow the `mcp-crawl4ai-rag` setup guide](./mcp-crawl4ai-rag/README.md#installation)**

**Key Configuration for This Project:**

When you create your `.env` file as instructed in the guide, ensure the following flags are set to `true` to enable all features for the `langgraph-dev-navigator`:

```dotenv
# Recommended settings for langgraph-dev-navigator
USE_KNOWLEDGE_GRAPH=true
USE_AGENTIC_RAG=true
USE_HYBRID_SEARCH=true
USE_RERANKING=true
```

#### Testing Your Local Server Setup

Once you have completed the installation and configuration steps in the submodule's README, you can launch the server locally to confirm your setup is correct:

```bash
cd mcp-crawl4ai-rag
bash start_mcp_server.sh
```

This command will start the server in your terminal. You can then proceed to integrate it with your AI assistant.

#### Integrating with Your AI Assistant

The `mcp-crawl4ai-rag` server is designed to be integrated with various AI coding assistants (e.g., Cursor, Claude Code). Each assistant has its own method for configuring MCP servers.

➡️ **[Click here for detailed integration instructions for various AI clients](./mcp-crawl4ai-rag/README.md#integration-with-mcp-clients)**



## Advanced Usage & Recipes

### Aligning Docs & Code Version

This is an optional but recommended step to ensure the documentation source (for AI assistants to generate code) perfectly matches the version of the `langgraph` library you have installed.

1.  **Find your installed package version:**
    ```bash
    pip show langgraph
    ```
    (Look for the `Version:` line, e.g., `0.0.56`)

2.  **Align the submodule to that version tag and commit the change:**
    ```bash
    # Go into the submodule, check out the tag, then go back
    (cd langgraph && git fetch --all --tags && git checkout tags/v0.0.56)

    # Commit the new version pointer to your main project
    git add langgraph
    git commit -m "Align langgraph submodule with v0.0.56"
    ```
    *(Remember to replace `v0.0.56` with the version you found in step 1.)*

## Project Documentation

*   `docs/project_management_guide.md`: The standard process for managing epics, stories, and tasks.
*   `memory/tasks/epic_user_experience/README.md`: The strategic plan for the User Experience epic.

## Contributing

... (Add your contribution guidelines here) ...
