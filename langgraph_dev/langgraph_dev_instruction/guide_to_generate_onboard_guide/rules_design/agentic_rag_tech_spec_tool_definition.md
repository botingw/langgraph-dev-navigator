This is the **Technical Specification & Tool Definition** layer. You can attach this directly to your System Prompt or use it to build the actual Python/Typescript functions for your Agent.

When setting up your Agent (in Cursor, LangChain, or Claude), define these **5 Core Tools**.

#### Current Workspace Implementation Status

| Conceptual Tool | Current Equivalent / Status | Notes |
| --- | --- | --- |
| `get_file_tree` | Use the static tree snapshots (`@/langgraph_tree_structure.md`, `@/docs_tree_structure.md`, `@/langsmith-docs_tree_structure.md`) plus terminal utilities like `ls`, `tree`, or `find`. | Provides the same “map” insight even though a callable tool is not exposed. |
| `search_vector_db` | `perform_rag_query` (after `get_available_sources`). | Request 10–12 chunks and down-rank low-confidence hits. |
| `search_exact_text` | `rg`, `grep`, `find`, or scoped searches via the CLI. | Use regexes (`rg -n '^(class|def) ' file.py`) or Markdown heading scans (`rg -n '^#{1,5} ' file.md`). |
| `get_file_skeleton` | **Not implemented.** Approximate with the regex/heading commands above before opening a file. | If a real skeleton tool becomes available, plug it in here. |
| `read_file_content` | `read_file`, `read_many_files`. | Keep reads ≤300 lines; supply `start_line`/`end_line` when supported, or request the needed slice explicitly. |

See `prompt_dev/tool_examples_notes.md` for runnable workflows that pair these substitutes (e.g., `rg -n 'class StateGraph'` followed by `sed -n '111,125p'` to emulate skeleton→read behavior).

---

### I. Environment Prerequisites
Before the Agent runs, ensure the host machine has these installed for maximum performance:
1.  **`ripgrep` (`rg`)**: Much faster than `grep`. (Brew/Apt install `ripgrep`)
2.  **`Universal Ctags`**: For code structure understanding. (Brew/Apt install `universal-ctags`)
3.  **`tree`**: For visual structure.

---

### II. The Tool Definitions (API for the AI)

Copy-paste these function signatures and docstrings into your Agent's "Tools" definition. The docstrings are critical—they tell the AI *when* and *how* to use the tool.

#### 1. `get_file_tree` (The Map)
```python
def get_file_tree(directory_path: str = ".", max_depth: int = 2) -> str:
    """
    Returns the folder structure of the project as a tree text.
    Use this FIRST to understand the project layout and verify file paths.
    
    Args:
        directory_path: Root folder to scan (default: current dir).
        max_depth: How deep to traverse (default: 2). Increase only if necessary.
    
    Returns:
        String visualization (like the 'tree' command).
    """
```

#### 2. `search_vector_db` (The Concept Search)
```python
def search_vector_db(query: str, n_results: int = 5) -> str:
    """
    Performs a semantic search on the RAG database.
    Use this for "How to", "Why", or conceptual questions. 
    
    Args:
        query: Natural language query (e.g. "How is authentication handled?").
        n_results: Number of chunks to retrieve.
        
    Returns:
        List of text chunks with their source filenames.
        Warning: Code here might be slightly outdated; verify with read_file.
    """
```

#### 3. `search_exact_text` (The Entity Search)
```python
def search_exact_text(query: str, path: str = ".", case_sensitive: bool = False) -> str:
    """
    Uses 'ripgrep' to find exact string matches. 
    Use this for error codes, variable names, specific imports, or known strings.
    
    Args:
        query: The exact string or regex to look for.
        path: The directory or file to search in.
        case_sensitive: Whether to match case strictly.
        
    Returns:
        Output showing Filename, Line Number, and the matching line content.
    """
```

#### 4. `get_file_skeleton` (The Navigator)
```python
def get_file_skeleton(file_path: str) -> str:
    """
    Uses 'ctags' to return ONLY the definitions (classes, functions, methods) in a file.
    Use this to scan a file's logic without reading the whole content (saves tokens).
    
    Args:
        file_path: Path to the code file.
        
    Returns:
        A list of symbols with line numbers (e.g., 'def login (line 45)').
    """
```

#### 5. `read_file_content` (The Source of Truth)
```python
def read_file_content(file_path: str, start_line: int = 1, end_line: int = -1) -> str:
    """
    Reads the actual content of a local file.
    Use this to verify logic or debug code found via search tools.
    
    Args:
        file_path: Relative path to the file.
        start_line: The first line to read (1-indexed).
        end_line: The last line to read. If -1, reads until end (use carefully for large files).
        
    Returns:
        The text content of the file with line numbers added for reference.
    """
```

---

### III. The Implementation Logic (Python)

If you are building the backend (e.g., in LangChain or a custom Python script), here is how to implement the "Smart" tools efficiently.

#### Implementation: `get_file_skeleton` (Using Ctags)
This is the "Magic" tool most people miss. It turns a 500-line file into a 20-line summary.

```python
import subprocess
import json

def get_file_skeleton(file_path):
    # 1. check if file exists
    if not os.path.exists(file_path):
        return f"Error: File {file_path} does not exist."

    # 2. Run ctags requesting JSON output
    # --fields=+n adds line numbers, --output-format=json makes it parsable
    cmd = ["ctags", "--output-format=json", "--fields=+n", file_path]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError:
        return "Error: 'ctags' is not installed on the system."

    # 3. Parse and Format
    skeleton_lines = []
    for line in result.stdout.splitlines():
        try:
            tag = json.loads(line)
            # Format: [Function] my_func (Line 20)
            kind = tag.get("kind", "symbol")
            name = tag.get("name", "unknown")
            line_num = tag.get("line", "?")
            skeleton_lines.append(f"[{kind}] {name} (Line {line_num})")
        except json.JSONDecodeError:
            continue

    if not skeleton_lines:
        return "No definitions found (or file is not code)."
        
    return "\n".join(skeleton_lines)
```

#### Implementation: `read_file_content` (With Safety Limits)
Protect your token budget by forcing line numbers.

```python
def read_file_content(file_path, start_line=1, end_line=-1):
    if not os.path.exists(file_path):
        return "Error: File not found."
        
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
    total_lines = len(lines)
    
    # Handle negatives or out of bounds
    if end_line == -1 or end_line > total_lines:
        end_line = total_lines
    start_line = max(1, start_line)
    
    # Guard Rail: Prevent reading > 500 lines accidentally
    if (end_line - start_line) > 500:
        return f"Error: Request too large ({end_line - start_line} lines). Please narrow range or use 'get_file_skeleton' first."

    # Format output with line numbers
    output = []
    for i in range(start_line - 1, end_line):
        output.append(f"{i+1} | {lines[i].rstrip()}")
        
    return "\n".join(output)
```

---

### IV. System Prompt Instructions (The "Glue")

Add this strictly to your System Prompt to ensure the AI uses these implementations correctly.

```text
## TOOL USAGE PROTOCOL

You have access to a specific set of tools. You must use them in this priority order:

1. **PROJECT MAPPING**: Always start by checking the file structure using `get_file_tree` if you are unsure where files are located.
   
2. **SEARCH STRATEGY**:
   - Use `search_vector_db` for CONCEPTUAL queries ("How do I...", "Explain...").
   - Use `search_exact_text` for EXACT MATCHES (Error codes, specific variable names, imports).

3. **INSPECTION (The "Skeleton" Rule)**:
   - Before reading a file, run `get_file_skeleton` to see the functions/classes defined inside.
   - This helps you find the exact line numbers of the function you need.
   - Until that tool exists, mimic it with commands such as `rg -n '^(class|def) ' langgraph/.../state.py` (see Example 2 in `prompt_dev/tool_examples_notes.md`).

4. **READING**:
   - Use `read_file_content`.
   - **CRITICAL**: Always specify `start_line` and `end_line` based on the output of your Search or Skeleton tools. Follow the “Step 1 (Find) → Step 2 (Read)” pattern (e.g., `rg -n 'class StateGraph'` then `sed -n '111,125p'`).
   - Do not read entire files unless they are very small configuration files.

## ERROR HANDLING
- If `read_file_content` fails, check `get_file_tree` to verify the path.
- If `search_vector_db` returns irrelevant info, switch to `search_exact_text` and look for root keywords.
```

---

### V. Repo Map Quick Reference

- **langgraph/** → product code and docs located at `langgraph/docs/docs/...` (tutorial-first).
- **docs/** → LangChain public docs under `docs/src` plus the Python API reference under `docs/reference/python` (e.g., `docs/reference/python/README.md`, `docs/reference/python/langchain/`).
- **langsmith-docs/** → LangSmith guides under `langsmith-docs/docs`.
- Keep the matching tree files (`langgraph_tree_structure.md`, `docs_tree_structure.md`, `langsmith-docs_tree_structure.md`) nearby so both AI agents and humans can jump to the right directory without fishing around.
