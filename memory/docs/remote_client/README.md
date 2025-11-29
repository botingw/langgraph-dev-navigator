# Remote MCP Client Quickstart (Hosted Only)

This guide is for users who **only consume** the hosted MCP server. You do **not** need to clone or navigate the full `langgraph-dev-navigator` repo. Follow these steps in your own workspace.

---

## What You Need
- Hosted MCP URL: `{deployed-remote-http-mcp-server-url}` (ask the maintainer privately; the real URL is not in this repo).
- MCP client config for your AI assistant (Claude, GitHub Copilot, etc.).
- LangGraph rules file: `langgraph-ai-rules_v4_1.md` (recommended for remote).
- Optional: local copies of LangChain/LangGraph/LangSmith docs in your own project.

---

## Step 1: Get the Hosted MCP URL
- Contact the maintainer to obtain the actual URL. Keep it private.

---

## Step 2: Configure Your AI Assistant (MCP Server)

### Claude CLI
```bash
claude mcp add --transport http crawl4ai-rag-http-remote {deployed-remote-http-mcp-server-url}
```

### GitHub Copilot
`.vscode/mcp.json`
```json
{
  "servers": {
    "crawl4ai-rag-http-remote": {
      "url": "{deployed-remote-http-mcp-server-url}",
      "type": "http"
    }
  },
  "inputs": []
}
```
- Copilot note: **ASK mode cannot access MCP**; use PLAN mode (or equivalent) when you need MCP tools.
- Connection tip: Copilot PLAN mode may take several minutes (sometimes ~7 mins) to connect to the hosted MCP server, especially because the server is a serverless deployment that may cold-start. Prompt the AI to run a simple MCP tool (e.g., `get_available_sources`) to confirm the connection once it comes up.

### Other MCP-capable editors (Cursor/Windsurf/etc.)
- Add a server entry pointing to `{deployed-remote-http-mcp-server-url}` with `type/http` (or your editor’s MCP schema).

---

## Step 3: Apply the LangGraph Rules (`langgraph-ai-rules_v4_1.md`)

Choose one:

- **Option A (script; write into a workspace you choose):**
  ```bash
  uv run python src/setup_dev_assistant.py --rule-file langgraph-ai-rules_v4_1.md --workspace /path/to/your/project
  ```
  Then pick your assistant from the menu. The script writes the assistant config files under the given workspace (e.g., `/path/to/your/project/.vscode/mcp.json`, `AGENTS.md`, etc.).

- **Option B (recommended for your own workspace):**
  - Download the file directly (see [`langgraph-ai-rules_v4_1.md`](../../../langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v4_1.md) locally or [on GitHub](https://github.com/botingw/langgraph-dev-navigator/blob/main/langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v4_1.md)) or copy its content into a local file.
  - Use your assistant’s UI to attach the file in the chat/session.

**Delivery advice (important):**
- Many assistants ignore system rule files dropped into default paths. The reliable method—and the one that actually empowers the assistant to follow the LangChain-specific workflow—is to **attach the rule file inside the chat** so it becomes part of the conversation context. Example for Copilot PLAN mode:  
  “Give me a plan to implement a web search multi-agent with checkpoint feature. I attach `langgraph-ai-rules_v4_1.md` for how to work with LangChain ecosystem tasks.”
- Reminder: **Copilot ASK mode cannot access MCP**; use PLAN mode (or equivalent) when you need MCP tools.
- Want to see realistic workflows? Review these step-by-step examples that show how users finish LangGraph tasks with the hosted MCP server:
  - [Chat history inspection via MCP](../../../langgraph_dev/dev_test/test_case_results/case_checkpoint/chat_history_with_mcp_server.md)
  - [Code test run with MCP tools](../../../langgraph_dev/dev_test/test_case_results/case_checkpoint/code_test_with_mcp_server.md)

---

## Step 4 (Recommended): Local Docs in Your Workspace
If you want local copies of the docs (not required for hosted MCP use), you can add them to **your** project:
```bash
git clone https://github.com/langchain-ai/langgraph.git langgraph
git clone https://github.com/langchain-ai/docs.git docs
git clone https://github.com/langchain-ai/langsmith-docs.git langsmith-docs
```
This matches the doc map referenced by the LangGraph rules.

---

## You’re Ready
- Use your assistant with MCP configured to the hosted server and the attached `langgraph-ai-rules_v4_1.md`.
- No other folders from `langgraph-dev-navigator` are needed for remote-only usage.

---

## Notes & Troubleshooting
- `check_ai_script_hallucinations` currently has a known bug for remote MCP environments and is disabled; rely on other MCP tools until a fix is deployed.
- Because the MCP server is hosted on a serverless platform, cold starts can increase connection time. If a tool request stalls, wait and rerun (starting with a light-weight call such as `get_available_sources`).
- For best local search performance when you clone docs yourself, install ripgrep (`sudo apt install ripgrep` on Debian/Ubuntu or `brew install ripgrep` on macOS).
