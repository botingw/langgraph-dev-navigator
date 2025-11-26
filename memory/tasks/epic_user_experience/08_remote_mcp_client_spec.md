# Story Spec: Remote MCP Client UX

**User Story:** As a remote MCP user, I want a minimal setup guide that only covers hosted MCP configuration, the correct LangGraph instruction file, and optional local docs, so I can use the service without cloning or navigating the full dev repository.

---

### Acceptance Criteria
* A dedicated remote client README lives under `memory/docs/remote_client/README.md` (or similarly named) and is written for consumers, not repo maintainers.
* The guide includes: (a) how to obtain the hosted MCP URL (`{deployed-remote-http-mcp-server-url}` placeholder + “ask maintainer privately”), (b) ready-to-run MCP config snippets for key assistants (Claude, GitHub Copilot, Cursor/Windsurf if applicable), (c) how to apply the LangGraph rules file (`langgraph-ai-rules_v4_1.md`) into their own workspace (e.g., via `src/setup_dev_assistant.py --rule-file ...` or direct download).
* Remote users are clearly told they do **not** need this repo’s dev artifacts (memory/, mcp-crawl4ai-rag scripts, internal guides).
* Optional section shows how to pull LangChain/LangGraph/LangSmith docs as submodules or clones into their own project (docs/, langsmith-docs/, langgraph/), without requiring this repo.
* Root README links to the remote client guide and calls out the “Path R: Hosted MCP client” vs “Path L: Self-host/Dev” split.
* Explicit guidance on rule usage: discourage dropping rule files into assistants’ default system locations when they are ignored; instruct users to attach the rule file inside the chat (e.g., Copilot PLAN mode: “I attach {instruction-file-name}...”), and remind Copilot ASK mode cannot access MCP.

---

### Implementation Plan
- [x] Create `memory/docs/remote_client/README.md` with a concise remote-only quickstart:
  - How to request the real MCP URL (placeholder stays in repo).
  - MCP config snippets for Claude CLI and GitHub Copilot (extend to Cursor/Windsurf if desired).
  - How to use `langgraph-ai-rules_v4_1.md` in their workspace (script flag or raw download).
  - Optional: commands to clone `langchain-ai/docs`, `langchain-ai/langsmith-docs`, `langchain-ai/langgraph` into their own project if they want local docs.
- [x] Add a “rule delivery” section: advise attaching the rule file in the assistant conversation (e.g., Copilot PLAN mode prompt) instead of relying on default rule locations; call out Copilot ASK mode lacks MCP access.
- [x] Update root `README.md` to add a short “role split” banner in Step 3 intro: Path R (remote) links to the remote client guide and skips local backend; Path L (self-host) continues with existing steps.
- [x] Ensure no other sections force remote users to clone this repo; if any references assume local workspace here, add a note redirecting remote users to the remote guide.
- [x] Leave future automation (one-click script) as out of scope for this story; note as potential follow-up.

---

### Notes
* Keep `langgraph-ai-rules_v4_1.md` as the recommended rule for remote users; do not alter rule contents.
* Use `{deployed-remote-http-mcp-server-url}` placeholder in public docs; instruct users to ask privately for the real URL.
* Keep the guide lightweight (no tasks/epics/internal instructions).***
