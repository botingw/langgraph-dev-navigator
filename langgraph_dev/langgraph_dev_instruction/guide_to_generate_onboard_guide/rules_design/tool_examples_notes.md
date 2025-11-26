# Tool Command Examples & Verified Outputs

## 1. Outline Markdown headings quickly
- **Use case:** Skim the structure of a doc before reading.
- **Command:** `rg -n '^#{1,5} ' docs/src/oss/deepagents/quickstart.mdx`
- **Verified output:**
```
8:## Prerequisites
12:### Step 1: Install dependencies
46:### Step 2: Set up your API keys
53:### Step 3: Create a search tool
132:### Step 4: Create a deep agent
136:# System prompt to steer the agent to be an expert researcher
141:## `internet_search`
162:## \`internet_search\`
174:### Step 5: Run the agent
180:# Print the agent's response
196:## What happened?
206:## Next steps
```

## 2. List Python definitions via regex (skeleton substitute)
- **Use case:** Check which classes/functions exist before reading code.
- **Command:** `rg -n '^(class|def) ' langgraph/libs/langgraph/langgraph/graph/state.py`
- **Verified snippet:**
```
92:def _warn_invalid_state_schema(schema: type[Any] | Any) -> None:
104:def _get_node_name(node: StateNode[Any, ContextT]) -> str:
111:class StateGraph(Generic[StateT, ContextT, InputT, OutputT]):
912:class CompiledStateGraph(
1234:def _pick_mapper(
...
1429:def _get_json_schema(
```

## 3. Scoped identifier search
- **Use case:** Find every place `StateGraph` shows up inside tutorials.
- **Command:** `rg -n 'StateGraph' langgraph/docs/docs/tutorials | head`
- **Verified snippet:**
```
langgraph/docs/docs/tutorials/chatbot-simulation-evaluation/simulation_utils.py:12:from langgraph.graph import END, StateGraph, START
langgraph/docs/docs/tutorials/chatbot-simulation-evaluation/simulation_utils.py:105:    graph_builder = StateGraph(SimulationState)
langgraph/docs/docs/tutorials/sql/sql-agent.md:294:from langgraph.graph import END, START, MessagesState, StateGraph
langgraph/docs/docs/tutorials/sql/sql-agent.md:410:builder = StateGraph(MessagesState)
...
```

## 4. Workflow: Locate directories using the tree snapshot
- **Use case:** Confirm where the `reference` docs live without opening the repo.
- **Step 1 (Find line):** `rg -n 'reference$' docs_tree_structure.md`
  - **Output:** `2653:|   |-- reference`
- **Step 2 (Read context):** `sed -n '2653,2665p' docs_tree_structure.md`
- **Verified excerpt:**
```
|   |-- reference
|   |   |-- deepagents-javascript.mdx
|   |   |-- deepagents-python.mdx
|   |   |-- integrations-python.mdx
|   |   |-- langchain-javascript.mdx
|   |   |-- langchain-python.mdx
|   |   |-- langgraph-javascript.mdx
|   |   |-- langgraph-python.mdx
|   |   `-- overview.mdx
|   |-- release-policy.mdx
|   |-- releases.mdx
|   |-- security-policy.mdx
|   `-- versioning.mdx
```

## 5. Workflow: locate definition → read implementation
- **Use case:** Find where `StateGraph` is defined, then read its docstring without opening the whole file.
- **Step 1 (Find):** `rg -n 'class StateGraph' langgraph/libs/langgraph/langgraph/graph/state.py`
  - **Output:** `111:class StateGraph(Generic[StateT, ContextT, InputT, OutputT]):`
- **Step 2 (Read):** `sed -n '111,125p' langgraph/libs/langgraph/langgraph/graph/state.py`
- **Verified excerpt:**
```
class StateGraph(Generic[StateT, ContextT, InputT, OutputT]):
    """A graph whose nodes communicate by reading and writing to a shared state.

    The signature of each node is `State -> Partial<State>`.

    Each state key can optionally be annotated with a reducer function that
    will be used to aggregate the values of that key received from multiple nodes.
```

## 6. Find entry points inside langsmith-docs
- **Use case:** List the top-level `index.mdx` files to understand sections quickly.
- **Command:** `find langsmith-docs/docs -maxdepth 2 -name index.mdx`
- **Verified output:**
```
langsmith-docs/docs/index.mdx
langsmith-docs/docs/observability/index.mdx
langsmith-docs/docs/evaluation/index.mdx
```

## 7. Workflow: sampling a concept (avoid overload)
- **Use case:** I only need one concrete example of how `Checkpointer` is used—no need to list every occurrence.
- **Step 1 (Sample first hit):** `rg -n 'Checkpointer' docs/src | head -n 1`
  - **Output:** `docs/src/oss/deepagents/human-in-the-loop.mdx:37:# Checkpointer is REQUIRED for human-in-the-loop`
- **Step 2 (Expand around that line):** `sed -n '35,50p' docs/src/oss/deepagents/human-in-the-loop.mdx`
- **Verified excerpt:**
```
# Checkpointer is REQUIRED for human-in-the-loop
checkpointer = MemorySaver()

agent = create_deep_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[delete_file, read_file, send_email],
    interrupt_on={
        "delete_file": True,  # Default: approve, edit, reject
        "read_file": False,   # No interrupts needed
        "send_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
    },
    checkpointer=checkpointer  # Required!
)
```
