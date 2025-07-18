"""agent.py
A runnable example of a looping LangGraph agent. The graph has three nodes:
1. **agent** – decides whether to call a `search_tool` or produce a `final_answer`.
2. **search_tool** – a dummy tool node. Control always loops back to **agent**.
3. **final_answer** – produces the answer and ends the graph.

Run from the CLI:
    python agent.py
"""
from __future__ import annotations

from typing import Dict, Literal

from langgraph.graph import END, StateGraph
from pydantic import BaseModel

# -----------------------------------------------------------------------------
# 🗺️  Define the graph state
# -----------------------------------------------------------------------------
class AgentState(BaseModel):
    """The single piece of state that flows through the graph."""

    question: str
    intermediate_steps: list[str] = []  # results from tool calls
    answer: str | None = None


# -----------------------------------------------------------------------------
# 🧠  Node: agent – decide between tool use vs. answering
# -----------------------------------------------------------------------------

def agent_node(state: AgentState) -> Dict[Literal["action", "state"], str | AgentState]:
    """Simple heuristic: if we have no tool results yet, use the tool once.
    Otherwise, generate the final answer.
    Returns a dict with the key ``action`` so the conditional edge can route.
    ``state`` is passed along unmodified here.
    """

    if not state.intermediate_steps:
        # First time through → search
        decision: Literal["tool", "answer"] = "tool"
    else:
        decision = "answer"
        state.answer = (
            "Here is a dummy answer based on the search results: "
            f"{state.intermediate_steps[-1]}"
        )
    return {"action": decision, "state": state}


# -----------------------------------------------------------------------------
# 🔍  Node: search_tool – dummy external call
# -----------------------------------------------------------------------------

def search_tool(state: AgentState) -> AgentState:
    """Pretend to call a search API and store the result."""

    fake_result = f"[search results for: {state.question}]"
    state.intermediate_steps.append(fake_result)
    return state


# -----------------------------------------------------------------------------
# ✅  Node: final_answer – terminate the run
# -----------------------------------------------------------------------------

def final_answer(state: AgentState) -> AgentState:
    """Nothing to do – returning the state ends the graph via END."""

    print("Final Answer →", state.answer)
    return state


# -----------------------------------------------------------------------------
# 🔗  Build the LangGraph
# -----------------------------------------------------------------------------

graph = StateGraph(AgentState)

# Register nodes
graph.add_node("agent", agent_node)
graph.add_node("search_tool", search_tool)
graph.add_node("final_answer", final_answer)

# Entry point
graph.set_entry_point("agent")

# Conditional routing based on the value returned in agent_node["action"].
# The callable receives the same return dict from the node.

graph.add_conditional_edges(
    source="agent",
    condition=lambda output: output["action"],
    # Map the two possible decisions to their next nodes
    #   - If ``tool`` → run search_tool and then loop back to agent
    #   - If ``answer`` → run final_answer and then END
    edge_map={
        "tool": "search_tool",
        "answer": "final_answer",
    },
)

# Manual edge to create the loop: after search_tool, go back to agent
graph.add_edge("search_tool", "agent")

# Final_answer should terminate the graph
graph.add_edge("final_answer", END)

# Compile to an executable app
app = graph.compile()


# -----------------------------------------------------------------------------
# 🚀  CLI helper for quick testing
# -----------------------------------------------------------------------------

def main() -> None:  # pragma: no cover
    """Simple CLI – run `python agent.py` and ask a question."""

    question = input("Question: ")
    state = AgentState(question=question)
    app.invoke(state)


if __name__ == "__main__":
    main()
