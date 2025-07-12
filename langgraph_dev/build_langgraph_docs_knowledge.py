

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory of 'mcp-crawl4ai-rag' to the Python path
# This is necessary for the import of 'ingest_repository' to work
# sys.path.append(str(Path(__file__).resolve().parent.parent))

# from mcp-crawl4ai-rag.src.ingestion_engine import ingest_repository
from crawl4ai_mcp.ingestion_engine import ingest_repository

async def main():
    """
    Builds a knowledge base for the LangGraph documentation by ingesting
    the docs/docs folder from the official repository.
    """
    # Load environment variables from the .env file in the mcp-crawl4ai-rag submodule
    project_root = Path(__file__).resolve().parent.parent / "mcp-crawl4ai-rag"
    dotenv_path = project_root / '.env'
    load_dotenv(dotenv_path, override=True)

    # --- Configuration ---
    repo_url = "https://github.com/langchain-ai/langgraph.git"
    ingest_types = ["docs"]
    include_folders = ["docs/docs"]

    print(f"--- Starting Knowledge Base Build for: {repo_url} ---")
    print(f"Ingestion types: {ingest_types}")
    print(f"Included folders: {include_folders}")

    # --- Run Ingestion ---
    result = await ingest_repository(repo_url, ingest_types, include_folders=include_folders)
    
    print("\n--- Knowledge Base Build Result ---")
    import json
    print(json.dumps(result, indent=2))

    if result.get("success"):
        print("\n--- Knowledge Base built successfully. ---")
    else:
        print("\n--- Knowledge Base build failed. ---")
        print(f"Error details: {result.get('error')}")

if __name__ == "__main__":
    # Ensure you have the necessary environment variables set in .env:
    # SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY
    asyncio.run(main())

