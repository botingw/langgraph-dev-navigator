
# LangChain Agent Workflow Plan

## 1. First Principles

1.  **Executable Truth**: Every agent workflow and code sample must be runnable, tested, and version-pinned to prevent drift and reduce hallucinated/outdated code.
2.  **Observability by Default**: Every workflow must include tracing and evaluation hooks (e.g., LangSmith) from the start to make agent decisions and bugs transparent.
3.  **Bias and Compliance as Product Requirements**: For agentic workflows in sensitive domains (e.g., hiring), bias, privacy, and fairness must be continuously monitored and enforced.
4.  **Automated Maintenance**: Use CI/CD to ensure breaking changes in LangChain/LangGraph and their ecosystem are caught and fixed proactively.
5.  **Human-AI Collaboration**: Use clear, structured prompts/specifications for agent design. Human review of the spec comes before code generation to avoid vague or hallucinated plans.
6.  **Metric-Driven Experimentation**: The enhancement of AI developer assistance is treated as a scientific endeavor. We will define clear success metrics (e.g., reduction in hallucinations, increased autonomy) and treat all technical approaches (full-context, RAG, KG, etc.) as experiments designed to improve these metrics. We will prioritize initiatives based on their potential impact on these key results.

## 2. Workflow Overview

1.  **Define intention:** Human writes a one-sentence or structured prompt describing the desired agentic workflow (e.g., resume screening agent).
2.  **AI generates a structured spec:** AI outputs a JSON or outline of nodes, tools, inputs/outputs, and success criteria.
3.  **Human reviews/edits spec:** The human verifies/clarifies requirements and trims hallucinations.
4.  **AI generates code scaffold & tests:** AI converts the approved spec to Python code and pytest cases. All dependencies (LangChain, LangGraph, etc.) must be version-pinned.
5.  **CI pipeline runs:** All tests must pass in CI; fails if broken APIs, test errors, or regressions are detected.
6.  **Instrument tracing & evaluation:** Every agent execution is wrapped with LangSmith or similar tracing. Evaluators and logs are added for debugging and performance review.
7.  **Bias & compliance checks:** For sensitive workflows, run agent outputs over a synthetic, balanced dataset and block merges if bias or fairness thresholds are violated.
8.  **Iterate & deploy:** Fix weakest node or failing spec; once green, optionally deploy as a LangServe endpoint for interactive or downstream use.
9.  **Automated maintenance:** Weekly CI and dependency-bump bots ensure the workflow stays current as upstream libraries change.

## 3. Pitfalls & Mitigations

| Pitfall | Impact | Mitigation |
| --- | --- | --- |
| **Stale APIs** | Silent runtime breakage | Pin dependencies; CI fails on breaking change |
| **Hallucinated code/Classes** | Unrunnable or incorrect agent logic | Require runnable scaffold + pytest for each change |
| **Bias/Compliance risk** | Legal/ethical exposure in hiring, etc. | Synthetic dataset audit; fairness checks in CI |
| **Silent runtime errors** | Loss of trust, hard-to-diagnose bugs | Default tracing and evaluation on every agent run |
| **Runaway cost/memory** | Cost blowouts, OOM errors | Set memory/token budget and budget hooks in agents |
| **Docs/code drift** | Inaccurate AI-generated completions | Automated doc generation from tested code |
| **Secret/key leakage** | Security exposure | Always load keys from .env and redact sensitive logs |
| **Prompt-injection, SQLi** | Security vulnerabilities | Validate all tool/model inputs, especially external |

---

## 5. Framework for Enhancing AI Developer Capability

Our primary objective is to systematically improve the ability of an AI assistant to develop and maintain high-quality, runnable LangGraph workflows. We will use the following framework to guide our efforts.

### 5.1. Success Metrics (The "Why")

We will measure success through the following key performance indicators. Our goal is to achieve measurable improvements in these areas:

*   **1. Reduction in Hallucinations:** A quantifiable decrease in the generation of non-existent or incorrect code constructs (e.g., invalid API calls, incorrect parameters).
    *   *Measurement:* Tracked via the `check_ai_script_hallucinations` tool and CI test failures.
    *   *Target:* Achieve a >30% reduction in structural code errors on the first generation pass.

*   **2. Increased Development Autonomy:** A reduction in the number of conversational turns or human interventions required to complete a development task.
    *   *Measurement:* Average number of user prompts per completed task.
    *   *Target:* Reduce conversational turns by 25% for common tasks like "scaffold a new agent."

*   **3. Improved First-Pass Success Rate:** An increase in the percentage of AI-generated code that passes CI tests without any human modification.
    *   *Measurement:* CI pass/fail rate on AI-generated pull requests.
    *   *Target:* Increase the initial pass rate from a baseline (TBD) to over 50%.

### 5.2. Experimental Initiatives (The "How")

We will implement and compare several initiatives to provide the AI with the necessary context. Each is a hypothesis about what will best improve the metrics above.

*   **Initiative A: Rule-Guided Direct Access (Baseline)**
    *   **Hypothesis:** Providing the AI with a curated set of rules that map user intent to specific, high-quality documentation files is a reliable baseline. This ensures accuracy but requires manual curation of the rules.
    *   **Implementation:** The current method, defined in `.clinerules/01-langgraph-ai-rules.md`, where the AI is instructed to use `@file` to read specific documents from a local clone of the `langgraph` repository.

*   **Initiative B: Retrieval-Augmented Generation (RAG)**
    *   **Hypothesis:** A semantic search capability will allow the AI to find relevant information from the documentation on-demand, reducing its reliance on pre-defined rules and increasing its flexibility.
    *   **Implementation:** Utilize the `mcp-crawl4ai-rag` server to ingest all LangGraph documentation into a vector database and equip the AI with the `perform_rag_query` tool.

*   **Initiative C: Knowledge Graph Validation**
    *   **Hypothesis:** Validating generated code against a structural graph of the actual repository will directly reduce code-level hallucinations and improve the first-pass success rate.
    *   **Implementation:** Use the `mcp-crawl4ai-rag` server to parse the LangGraph codebase into Neo4j and equip the AI with the `check_ai_script_hallucinations` tool for self-correction.

*   **Initiative D: [Future Experiment Placeholder]**
    *   *This space is reserved for future ideas, such as fine-tuning, agentic web research on the official LangChain blog, etc.*

### 5.3. Current Focus and Implementation Plan

Our immediate priority is to implement and measure the impact of **Initiative B (RAG)** and **Initiative C (Knowledge Graph)**.

1.  **Setup and Configuration:**
    *   Configure and launch the `mcp-crawl4ai-rag` server.
    *   Set `USE_AGENTIC_RAG=true` and `USE_KNOWLEDGE_GRAPH=true` in the environment to enable all relevant tools.

2.  **Knowledge Ingestion:**
    *   Use the `parse_github_repository` tool to ingest the local `langgraph` repository, populating both the RAG database and the Knowledge Graph. This is the foundational step.

3.  **Agent Tool Integration:**
    *   Integrate the `perform_rag_query` and `check_ai_script_hallucinations` tools into the primary development assistant's capabilities.

4.  **Baseline and Measurement:**
    *   Establish baseline metrics for a set of standardized development tasks (e.g., "create a simple chatbot," "add a node to an existing graph").
    *   Re-run these tasks using the newly equipped agent and measure the change in the success metrics defined in 5.1.
    *   The detailed methodology for this evaluation is documented in the [AI Assistant Evaluation Plan](</memory/tasks/evaluation_plan.md>).

---

## 6. Reference Materials

The following external links are for human reference and supplementary context. They inform the principles of this project but are not used as a direct source for AI code generation.

*   [LangSmith agent-trajectory evaluators](https://docs.langchain.com/langsmith/agent-evaluation)
*   [LangGraph multi-agent workflow blog](https://blog.langchain.dev/langgraph-0-0-12/)
*   [LangServe deployment guide](https://docs.langchain.com/langserve/)
*   [Token-buffer memory API docs](https://api.python.langchain.com/en/latest/memory/langchain.memory.ConversationTokenBufferMemory.html)
*   [US legal note on AI bias in hiring](https://www.americanbar.org/groups/labor_law/publications/labor_employment_law_news/fall-2023/compliance-and-legal-risk-mitigation-artificial-intelligence-hiring-tools/)
*   [LangChain v0.2 breaking-change guide](https://github.com/langchain-ai/langchain/discussions/19154)
*   [GitHub Action for dependencies auto-update](https://github.com/marketplace/actions/create-pull-request)
*   [LangChain structured output best practices](https://docs.langchain.com/docs/guides/development-guides/output-parsing/)
*   [LangSmith agent evaluation tutorial](https://docs.langchain.com/langsmith/agent-evaluation)
*   [LangGraph multi-agent Medium tutorial](https://medium.com/langchain/langgraph-multi-agent-workflows-74bfcfe73ee8)
*   [Official LangServe docs](https://docs.langchain.com/langserve/)
*   [LangChain memory constraints reference](https://docs.langchain.com/docs/guides/development-guides/memory/)
*   [ABA article on compliance & AI bias](https://www.americanbar.org/groups/labor_law/publications/labor_employment_law_news/fall-2023/compliance-and-legal-risk-mitigation-artificial-intelligence-hiring-tools/)
*   [Guardian report on discrimination risks in AI interviews](https://www.theguardian.com/technology/2024/feb/20/ai-job-interviews-algorithms-discrimination)
