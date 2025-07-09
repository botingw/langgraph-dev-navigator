# install
1. use conda env uv_py312 before installation (it uses python=3.12 then 'pip install uv')
2. use uv venv -p $(which python) in install part / use specified 3.12 version when run 'uv venv'
3. python src/crawl4ai_mcp.py to replace 'uv run', as somehow torch version doesn't support mac intel hardware
- uv pip install "numpy<2", otherwise will get error 
why:
 When you run uv venv without any arguments, it tries to find a default Python interpreter on your system to create the new .venv with. It does not automatically use the Python from your active Conda environment. On your system, the default python3 is very likely the Python 3.13 that caused the original problem.

 4. mcp server for cline:
    // sse: will get RuntimeError: Received request before initialization was complete, but scalable for remote and multi-user
    "crawl4ai-rag": {
      "transport": "sse",
      "url": "http://localhost:8051/sse"
    }

    // stdio: can resolve sse's error, but only suitable for local application
    "crawl4ai-rag": {
      "command": "python",
      "args": ["/Users/wangbo-ting/code_non_git/mcp-crawl4ai-rag/src/crawl4ai_mcp.py"],
      "env": {
        "TRANSPORT": "stdio",
        "OPENAI_API_KEY": {your-key},
        "SUPABASE_URL": "https://{your-url}.supabase.co",
        "SUPABASE_SERVICE_KEY": {your-key},
        "USE_KNOWLEDGE_GRAPH": "false",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": {your-password}
      }
    }


