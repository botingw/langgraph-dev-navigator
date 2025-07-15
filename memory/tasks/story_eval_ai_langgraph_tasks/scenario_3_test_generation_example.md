# Evaluation Scenario 3: Test Generation Example

This document provides a concrete example of the expected input and output for the "Test Generation Challenge". It serves as a reference or "gold standard" for evaluating the AI assistant's performance on this task.

The goal is to test the AI's ability to write `pytest` tests for an existing LangGraph agent, covering both the primary success path and a common edge case (tool failure).

---

### Part 1: The Agent to be Tested

This is the input code that would be provided to the AI assistant.

**File: `agent.py`**
```python
# agent.py
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# A simple state that holds a list of messages
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# A dummy tool for our tests
def web_search(query: str) -> str:
    """A dummy web search tool."""
    print(f"--- Searching for: {query} ---")
    # In a real app, this would make an API call.
    return "LangGraph is a library for building stateful, multi-agent applications."

# The primary agent node
def agent_node(state: AgentState):
    """Calls the tool and returns the result."""
    query = state["messages"][-1].content
    result = web_search(query)
    return {"messages": [("ai", result)]}

# Define the graph
graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.set_entry_point("agent")
graph_builder.add_edge("agent", END)

# Compile the graph into a runnable app
app = graph_builder.compile()
```

---

### Part 2: The Expected `pytest` Output

This is the ideal output we would expect the AI assistant to generate.

**File: `test_agent.py`**
```python
# test_agent.py
import pytest
from agent import app, web_search

# --- Test 1: The "Happy Path" ---
# Goal: Verify the agent works correctly when the tool succeeds.

def test_happy_path_search_success():
    """
    Tests the agent's successful execution path.
    """
    # 1. Define the input for the agent
    inputs = {"messages": [("user", "What is LangGraph?")]}

    # 2. Invoke the compiled graph
    final_state = app.invoke(inputs)

    # 3. Assert the final output is what we expect
    # The last message in the state should be from the AI with the tool's result.
    last_message = final_state["messages"][-1]
    assert last_message.type == "ai"
    assert "LangGraph is a library" in last_message.content

# --- Test 2: The Edge Case (Tool Failure) ---
# Goal: Verify the agent handles tool errors gracefully.

def test_edge_case_tool_error(monkeypatch):
    """
    Tests how the agent behaves when the web_search tool raises an exception.
    """
    # 1. Define a mock function that simulates a tool failure
    def mock_web_search_fails(query: str):
        raise ValueError("API Error: Search failed!")

    # 2. Use pytest's `monkeypatch` to replace the real tool with our failing one
    monkeypatch.setattr("agent.web_search", mock_web_search_fails)

    # 3. Define the input
    inputs = {"messages": [("user", "What is LangGraph?")]}

    # 4. Assert that invoking the app raises the expected error
    # This confirms the error from the tool is correctly propagated.
    with pytest.raises(ValueError, match="API Error: Search failed!"):
        app.invoke(inputs)
```

---

### Part 3: Explanation of the Tests

This section explains why this output is considered high-quality.

1.  **`test_happy_path_search_success()`**:
    *   **Purpose:** This is the most fundamental test. It checks if the agent produces the correct output when everything works as expected.
    *   **Method:** It calls the compiled `app` with a user question and then inspects the final `state` to ensure the AI's response contains the expected text from the `web_search` tool. This validates the core logic of the graph.

2.  **`test_edge_case_tool_error(monkeypatch)`**:
    *   **Purpose:** This is a crucial robustness test. Real-world tools fail, and this test checks if the agent and the graph handle that failure correctly.
    *   **Method:** It uses `pytest`'s powerful `monkeypatch` fixture to temporarily replace the real `web_search` function with a mock function that just raises a `ValueError`. It then uses `pytest.raises` to assert that when the `app` is invoked, it correctly propagates this `ValueError`. This proves the system doesn't crash silently or hang; it fails predictably.

An AI that can generate both of these tests demonstrates a sophisticated understanding of not just LangGraph's functionality but also the principles of robust software testing.
