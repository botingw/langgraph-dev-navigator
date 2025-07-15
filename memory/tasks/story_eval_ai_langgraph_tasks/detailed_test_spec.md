# Detailed Test Specifications for AI Assistant Evaluation

This document provides the detailed, actionable specifications for each test case in the evaluation plan. It replaces the high-level `standardized_test_suite.md`.

For each test case, we define:
1.  **Objective:** The specific capability being measured.
2.  **Setup:** The precise file structure and content required to run the test.
3.  **Input:** The exact prompt to be given to the AI assistant.
4.  **Expected Output & Success Criteria:** A clear definition of what a successful outcome looks like, including code and explanations.

---

## Scenario 1: The Debugging Challenge

### Test Case 1.1: Incorrect State Update

*   **Objective:** Verify the AI can identify and fix a common state mutation error where a list is overwritten instead of appended to.
*   **Setup (in `story_eval_ai_langgraph_tasks/scenario_1/task_1_1/`):**
    *   **`broken_agent.py`:**
        ```python
        from typing import TypedDict, List
        from langchain_core.messages import BaseMessage, AIMessage
        from langgraph.graph import StateGraph, END

        class AgentState(TypedDict):
            messages: List[BaseMessage]

        def agent_node(state: AgentState) -> dict:
            # This is the bug: direct assignment overwrites the history.
            return {"messages": [AIMessage(content="This is a new message.")]}

        graph_builder = StateGraph(AgentState)
        graph_builder.add_node("agent", agent_node)
        graph_builder.set_entry_point("agent")
        graph_builder.add_edge("agent", END)
        app = graph_builder.compile()
        ```
    *   **`run_test.py`:**
        ```python
        from broken_agent import app
        from langchain_core.messages import HumanMessage

        initial_state = {"messages": [HumanMessage(content="Hello")]}
        final_state = app.invoke(initial_state)

        # This assertion proves the bug. A correct fix will have a length of 2.
        assert len(final_state["messages"]) == 1
        print("Bug confirmed: History was overwritten.")
        ```
*   **Input (Prompt to AI):** "The agent in `broken_agent.py` is supposed to add its response to the message history. However, as proven by `run_test.py`, it's overwriting the history instead. Analyze the code, explain the root cause, and provide the corrected code for `broken_agent.py`."
*   **Expected Output & Success Criteria:**
    1.  **Explanation (Diagnostic Accuracy):** The AI must correctly identify that returning a new list from `agent_node` replaces the state's `messages` list.
    2.  **Corrected Code (Functional Correctness):** The AI should propose a fix. The highest quality fix is an idiomatic refactoring using `add_messages`.
        *   **Excellent Fix:**
            ```python
            from typing import TypedDict, List, Annotated
            from langchain_core.messages import BaseMessage, AIMessage
            from langgraph.graph import StateGraph, END
            from langgraph.graph.message import add_messages

            class AgentState(TypedDict):
                messages: Annotated[List[BaseMessage], add_messages]

            def agent_node(state: AgentState) -> dict:
                return {"messages": [AIMessage(content="This is a new message.")]}
            
            # ... rest of graph ...
            ```
    3.  **Verification:** The corrected code, when run with `run_test.py`, should cause the initial assertion to fail and a new assertion `assert len(final_state["messages"]) == 2` to pass.

---
## Scenario 2: The Refactoring Challenge

### Test Case 2.1: Simplify State Management

*   **Objective:** Verify the AI can refactor code to use modern, idiomatic LangGraph helpers.
*   **Setup:**
    *   **`original_agent.py`:**
        ```python
        from typing import TypedDict, List
        from langchain_core.messages import BaseMessage, AIMessage
        from langgraph.graph import StateGraph, END

        class AgentState(TypedDict):
            messages: List[BaseMessage]

        def node(state: AgentState) -> dict:
            # Manual and verbose state update
            new_messages = state['messages'] + [AIMessage(content="A new message.")]
            return {"messages": new_messages}
        # ... rest of graph ...
        ```
*   **Input (Prompt to AI):** "This code works, but it manually manages the message list. Please refactor this code to use the built-in `add_messages` helper from LangGraph for a cleaner implementation. Explain why your new version is better."
*   **Expected Output & Success Criteria:**
    1.  **Corrected Code:** The AI must replace the manual list concatenation with the `Annotated` type and `add_messages`.
    2.  **Explanation:** The explanation must correctly state that `add_messages` simplifies state management by handling the append logic automatically.

---
## Scenario 3: The Test Generation Challenge

### Test Case 3.1: Generate Tests for a Simple Agent

*   **Objective:** Verify the AI can generate a robust `pytest` suite for an agent, covering success and failure cases.
*   **Setup:**
    *   **`agent.py`:** The full agent code from `/memory/docs/scenario_3_test_generation_example.md`.
*   **Input (Prompt to AI):** "Here is a simple LangGraph agent in `agent.py`. Write a suite of `pytest` tests for it in a file named `test_agent.py`. The tests should cover the primary success path and the edge case where the `web_search` tool fails."
*   **Expected Output & Success Criteria:**
    1.  **Generated Code (`test_agent.py`):** The generated file must contain two valid `pytest` tests, functionally equivalent to the "Happy Path" and "Edge Case (Tool Failure)" tests outlined in the reference document.
    2.  **Verification:** The generated `test_agent.py` must run successfully and all tests should pass against the provided `agent.py`.

---

## Scenario 4: The Greenfield Implementation Challenge

### Test Case 4.1: Simple ReAct Agent

*   **Objective:** Verify the AI can generate a complete, runnable ReAct agent from a high-level requirement and provided tools.
*   **Setup (in `story_eval_ai_langgraph_tasks/scenario_4/task_4_1/`):**
    *   **`tools.py`:**
        ```python
        def calculator(expression: str) -> str:
            return str(eval(expression))

        def web_search(query: str) -> str:
            if "capital of France" in query.lower():
                return "The capital of France is Paris."
            if "letters in Paris" in query.lower():
                return "There are 5 letters in Paris."
            return "I can't find that information."
        ```
    *   **`run_test.py`:**
        ```python
        # This file will import the AI-generated 'app'
        from agent import app
        from langchain_core.messages import HumanMessage

        inputs = {"messages": [HumanMessage(content="What is the square root of the number of letters in the capital of France?")]}
        final_state = app.invoke(inputs)

        # Final answer should be sqrt(5) -> ~2.23
        final_answer = final_state["messages"][-1].content
        assert "2.23" in final_answer
        print("Greenfield test passed.")
        ```
*   **Input (Prompt to AI):** "Using the functions in `tools.py`, create a ReAct agent in a file named `agent.py`. The agent must be able to answer questions that require chaining tools, like 'What is the square root of the number of letters in the capital of France?'. The final runnable graph must be compiled and assigned to a variable named `app`."
*   **Expected Output & Success Criteria:**
    1.  **Generated Code (`agent.py`):** The file must contain a valid LangGraph implementation of a ReAct agent that correctly uses the provided tools and orchestrates the logic.
    2.  **Verification (First-Pass Success):** The generated `agent.py` must be runnable. The `run_test.py` script must execute successfully and pass its assertion without any human modification to the AI's code.

### Test Case 4.2: Complex Multi-Agent System

*   **Objective:** Verify the AI can generate a complex, multi-agent graph from a high-level specification.
*   **Input (Prompt to AI):** "Design a two-agent system for conducting research.
    1.  **Researcher Agent:** Searches the web to find articles about a given topic.
    2.  **Summarizer Agent:** Takes the researcher's findings and condenses them into a one-paragraph summary.
    3.  **Supervisor:** A main graph should orchestrate this process, passing the topic to the Researcher and the researcher's output to the Summarizer. Please generate the complete, runnable Python code."
*   **Expected Output & Success Criteria:**
    1.  **Generated Code:** The code must define two distinct agentic graphs (or nodes) and a third supervisor graph that correctly routes data between them.
    2.  **Verification:** The code must be runnable and demonstrate the correct flow of information from the Researcher to the Summarizer. A simple `app.invoke()` test showing the final summary would be sufficient.
