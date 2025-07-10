for setup crawl4ai mcp server, follow mcp-crawl4ai-rag/README

# problems
## P1
when run 'uv pip install -e .', get:
  × No solution found when resolving dependencies:
  ╰─▶ Because torch==2.2.2 has no wheels with a matching Python ABI tag (e.g., `cp313`) and crawl4ai-mcp==0.1.0
      depends on torch==2.2.2, we can conclude that crawl4ai-mcp==0.1.0 cannot be used.
      And because only crawl4ai-mcp==0.1.0 is available and you require crawl4ai-mcp, we can conclude that your
      requirements are unsatisfiable.

      hint: You require CPython 3.13 (`cp313`), but we only found wheels for `torch` (v2.2.2) with the following
      Python ABI tags: `cp38`, `cp39`, `cp310`, `cp311`, `cp312`

## solution:
uv venv --python 3.12

## P2
stdio server run fail

## solution
when AI coding IDE launch the server, it does not use the the virtual env, so need turn on that env in a bash script
try if change the mcp server config's command and args part to below (replace the python part in README) 
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


