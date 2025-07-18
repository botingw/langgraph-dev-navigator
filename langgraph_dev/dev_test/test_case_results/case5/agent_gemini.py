with open("agent.py", "w") as f:
    f.write("""# LangGraph Agent Loop Example""")

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

# 1. Define the state for the graph
# The state is a dictionary that will be passed between nodes.
class AgentState(TypedDict):
    # messages will accumulate over time
    messages: Annotated[List[str], operator.add]
    # The 'next_action' field will be set by the agent to determine the next step
    next_action: str

# 2. Define the dummy functions for the nodes

def agent_node_func(state: AgentState):
    """
    A dummy agent node that simulates deciding the next action.
    For this example, it will decide to use the tool a maximum of 2 times.
    """
    print("---AGENT NODE---")
    # Count how many times the tool has been used
    num_tool_uses = sum(1 for msg in state['messages'] if "tool_output" in msg)

    print(f"Tool has been used {num_tool_uses} time(s).")

    # If the tool has been used 2 or more times, decide to answer.
    if num_tool_uses >= 2:
        decision = 'answer'
    else:
        decision = 'tool'

    print(f"Decision: The next action is '{decision}'")
    # The dictionary returned by a node updates the state.
    return {"next_action": decision}

def search_tool_func(state: AgentState):
    """A dummy search tool node that simulates a tool execution."""
    print("---SEARCH TOOL NODE---")
    # Simulate a tool output string
    tool_output = "tool_output: The agent is still searching for the answer..."
    print("Output: The tool returns a simulated result.")
    # Return the output to be added to the 'messages' list in the state
    return {"messages": [tool_output]}

def final_answer_func(state: AgentState):
    """A dummy final answer node that simulates generating a final response."""
    print("---FINAL ANSWER NODE---")
    final_answer = "This is the final answer after using the tool."
    print(final_answer)
    return {"messages": [final_answer]}

# 3. Define the conditional edge logic

def should_continue(state: AgentState):
    """
    This function is a router. It determines which node to go to next
    based on the 'next_action' field in the state.
    """
    print("---CONDITIONAL EDGE ROUTING---")
    print(f"Routing based on next_action: '{state['next_action']}'")
    if state['next_action'] == 'tool':
        return "tool"
    else:
        return "answer"

# 4. Build the graph

# Create a new graph instance
workflow = StateGraph(AgentState)

# Add the nodes to the graph
workflow.add_node("agent", agent_node_func)
workflow.add_node("tool", search_tool_func)
workflow.add_node("answer", final_answer_func)

# Set the entry point for the graph
workflow.set_entry_point("agent")

# Add the conditional edge.
# This edge will call the `should_continue` function and, based on its
# return value ("tool" or "answer"), will route to the corresponding node.
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tool": "tool",
        "answer": "answer",
    }
)

# The 'tool' node should always loop back to the 'agent' node to continue the process
workflow.add_edge('tool', 'agent')

# The 'answer' node is the final step, so we add an edge from it to the special END node
workflow.add_edge('answer', END)


# 5. Compile the graph into a runnable application
app = workflow.compile()


# 6. Run the agent with a sample question
if __name__ == "__main__":
    print("Starting the agent execution...")
    # Define the initial input for the agent.
    initial_input = {"messages": ["What is the capital of France?"]}

    # The `stream` method executes the graph and yields the output of each step.
    # This allows us to see the agent's process in real-time.
    for event in app.stream(initial_input):
        # Print the event name and the corresponding data
        for key, value in event.items():
            print(f"--- Event: {key} ---")
            print(value)
        print("\\n" + "="*40 + "\\n")

    print("Agent execution finished.")


