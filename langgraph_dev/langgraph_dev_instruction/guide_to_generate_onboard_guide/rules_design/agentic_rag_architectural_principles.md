Here is the architectural blueprint and set of principles for your Agentic RAG system. You can feed this context to an LLM to help it generate the specific system prompts or agent configurations you need.

---

# Architectural Principles for Hybrid Agentic RAG
**Objective:** To merge the **Semantic Recall** of Vector RAG with the **Precision and Truth** of direct filesystem access, minimizing hallucinations and token waste.

## I. The Core Philosophy: "The Funnel of Context"
The Agent must treat information retrieval as a funnel, moving from low-cost/broad tools to high-cost/specific tools.

1.  **Stage 1: Mapping (Zero Cost)** $\rightarrow$ Check the File Tree.
2.  **Stage 2: Candidate Retrieval (Low Cost)** $\rightarrow$ Vector Search or Keyword/Symbol Search.
3.  **Stage 3: Skeleton/Snippet Analysis (Medium Cost)** $\rightarrow$ `ctags` or `grep` snippets.
4.  **Stage 4: Deep Reading (High Cost)** $\rightarrow$ `read_file` (source of truth).

---

## II. Tool Taxonomy & Strategic Usage

Define the tools by their *purpose*, not just their command.

### 1. The Map (File Tree Structure)
*   **Nature:** A text representation of directory structure (`|-- folder/file.md`).
*   **Role:** The Agent’s "Eyes."
*   **Principles:**
    *   **Disambiguation:** Before searching, check if the query matches a filename exactly. If the user asks about "Auth," and `src/auth.py` exists in the tree, go there first.
    *   **Hallucination Guard:** If RAG suggests a file path, the Agent **must** validate it against the Tree before attempting to read it.
    *   **Folder Inference:** If a file is named `index.mdx` inside `langsmith/`, the Agent infers that the parent folder name provides the context for that generic filename.

### 2. The Concept Search (Vector RAG)
*   **Nature:** Semantic/Embedding search.
*   **Role:** The "Librarian" (finding topics).
*   **Principles:**
    *   **Use for:** "How to," "Why," "Explain," or broad feature exploration.
    *   **Do NOT use for:** Finding exact function definitions, error codes, or recent code changes (RAG is often slightly stale or fuzzy).
    *   **Action:** Output of RAG is treated as a *lead*, not a fact. It provides a *candidate file path*.

### 3. The Entity Search (Keyword/Terminal)
*   **Tools:** `grep`, `ripgrep` (`rg`), `find`.
*   **Nature:** Literal string matching.
*   **Role:** The "Detective" (finding evidence).
*   **Principles:**
    *   **Use for:** Exact variable names (`max_retries`), Error IDs (`0x541`), known filenames, or specific imports.
    *   **Case Sensitivity:** The Agent must be aware of snake_case vs CamelCase.
    *   **Scope:** Always prefer scoped searches (e.g., search inside `src/auth/`) over global searches to reduce noise.

### 4. The Definition Search (Symbol Table)
*   **Tools:** `ctags`, `Symbol Index`.
*   **Nature:** Structural code index (Classes, Functions, Methods).
*   **Role:** The "Navigator."
*   **Principles:**
    *   **The "Noise Killer":** If looking for `def login`, use Symbol Search. Do not use `grep`, which will return every place `login` is *called*.
    *   **Skeleton View:** Before reading a huge file, the Agent should request the "Skeleton" (list of symbols) to see if the relevant logic is actually there.

### 5. The Reader (Local File Access)
*   **Tools:** `read_file`, `cat`.
*   **Nature:** Retrieving raw content.
*   **Role:** The "Judge" (Final Truth).
*   **Principles:**
    *   **Lazy Loading:** Never read a file without a prior step (Tree, RAG, or Search) justifying *why* that file is relevant.
    *   **Windowed Reading:** Prefer reading specific line ranges (e.g., lines 10-50) identified by Search/Grep, rather than dumping 5,000 lines into context.

---

## III. The Decision Router (The Agent's Brain)

When you create your prompt, instruct the AI to classify the user intent into one of three categories to determine the starting tool.

**Intent A: Navigation ("Where is...?")**
*   *Signal:* User asks for a specific class, file, or configuration.
*   *Workflow:* **File Tree** $\rightarrow$ **Symbol Search/Ctags** $\rightarrow$ **Read File**.
*   *Anti-Pattern:* Do not use Vector RAG (it is too slow and fuzzy for exact locations).

**Intent B: Exploration ("How does... works?")**
*   *Signal:* User asks about high-level logic, workflows, or documentation.
*   *Workflow:* **Vector RAG** (get 3 candidate files) $\rightarrow$ **File Tree** (verify existence) $\rightarrow$ **Read File** (verify logic).

**Intent C: Debugging ("Why is this failing?")**
*   *Signal:* User provides error logs, specific code snippets, or variable names.
*   *Workflow:* **Keyword Search (`rg`)** (find occurrence) $\rightarrow$ **Read Context** (surrounding lines).

---

## IV. The "Refusal & Recovery" Protocol

The Agent must have instructions on what to do when tools fail.

1.  **The "Stale RAG" Check:** If RAG provides a snippet that does not match the current file content (proven by `read_file`), the Agent must trust the `read_file` content (Local Filesystem) as the absolute truth and ignore the RAG snippet.
2.  **The "Lost" Protocol:** If `grep` returns 0 results and RAG returns low confidence:
    *   **Do not** hallucinate a file.
    *   **Do** return to the **File Tree** and list the top-level directories to ask the user for guidance (e.g., "I couldn't find 'auth_token', but I see an 'identity' folder. Should I look there?").
3.  **The Token Budget:** If a file is larger than X lines (e.g., 300 lines), the Agent must *not* read the whole file. It must use `grep` or `ctags` to narrow down the region of interest first.

---

## V. Summary for Prompt Generation

When you ask the AI to write the system prompt, attach the above context and summarize the goal as:

> "Create a system instruction for an AI Agent that prioritizes **precision over recall**. It has access to a File Tree, Vector RAG, and Terminal Tools. It should use the File Tree as its primary map, Vector RAG for conceptual queries, and Terminal Tools (`grep`/`ctags`) for specific code navigation. It should only read full file content as a last step to verify information."