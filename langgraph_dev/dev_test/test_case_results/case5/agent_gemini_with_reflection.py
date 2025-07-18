# LangGraph Agent with Reflection Loop Example

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

# 1. Define the state for the graph
# The state is a dictionary that will be passed between nodes.
# We add a 'reflection' field to store the critique of the tool's output.
class AgentState(TypedDict):
    messages: Annotated[List[str], operator.add]
    next_action: str
    reflection: str # New field for the reflection result

# 2. Define the functions for the nodes

def agent_node_func(state: AgentState):
    """
    The agent node now decides the next action based on the reflection.
    """
    print("---AGENT NODE---")
    
    # The decision is now based on the reflection field, not a simple counter.
    # If the reflection is 'sufficient', the agent decides to answer.
    # Otherwise, it decides to use the tool.
    if state.get('reflection') == 'sufficient':
        decision = 'answer'
    else:
        decision = 'tool'

    print(f"Decision based on reflection: The next action is '{decision}'")
    # The dictionary returned by a node updates the state.
    return {"next_action": decision}

def search_tool_func(state: AgentState):
    """
    A dummy search tool node that simulates a tool execution.
    To make the loop terminate for this example, we'll have it return a 
    "sufficient" answer after one use.
    """
    print("---SEARCH TOOL NODE---")
    num_tool_uses = sum(1 for msg in state['messages'] if "tool_output" in msg)
    
    if num_tool_uses < 1:
        # First time, the output is insufficient
        tool_output = "tool_output: The agent is still searching for the answer..."
        print("Output: The tool returns an insufficient result.")
    else:
        # Second time, the output is sufficient
        tool_output = "tool_output: The agent found the answer is Paris."
        print("Output: The tool returns a sufficient result.")
        
    # Return the output to be added to the 'messages' list in the state
    return {"messages": [tool_output]}

# New node for reflection
def reflection_node_func(state: AgentState):
    """
    A dummy reflection node that simulates assessing the tool's output.
    In a real application, this would involve an LLM call to critique the tool's result.
    """
    print("---REFLECTION NODE---")
    last_message = state['messages'][-1]

    # Simulate an LLM assessing the tool output.
    if "Paris" in last_message:
        reflection = "sufficient"
        print("Reflection: The tool output is sufficient for a final answer.")
    else:
        reflection = "insufficient"
        print("Reflection: The tool output is not sufficient. Need to search again.")

    # Update the state with the result of the reflection
    return {"reflection": reflection}

def final_answer_func(state: AgentState):
    """A dummy final answer node that simulates generating a final response."""
    print("---FINAL ANSWER NODE---")
    final_answer = "This is the final answer after reflecting on the tool's output."
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

# 4. Build the graph with the new reflection step

# Create a new graph instance
workflow = StateGraph(AgentState)

# Add the nodes to the graph
workflow.add_node("agent", agent_node_func)
workflow.add_node("tool", search_tool_func)
workflow.add_node("reflection", reflection_node_func) # Add the new reflection node
workflow.add_node("answer", final_answer_func)

# Set the entry point for the graph
workflow.set_entry_point("agent")

# Add the conditional edge from the agent.
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tool": "tool",
        "answer": "answer",
    }
)

# The 'tool' node now goes to the 'reflection' node instead of back to the agent
workflow.add_edge('tool', 'reflection')

# The 'reflection' node loops back to the 'agent' node to make a new, informed decision
workflow.add_edge('reflection', 'agent')

# The 'answer' node is the final step
workflow.add_edge('answer', END)


# 5. Compile the graph into a runnable application
app = workflow.compile()


# 6. Run the agent with a sample question
if __name__ == "__main__":
    print("Starting the agent execution with reflection...")
    # Define the initial input for the agent.
    initial_input = {"messages": ["What is the capital of France?"], "reflection": "insufficient"}

    # The `stream` method executes the graph and yields the output of each step.
    for event in app.stream(initial_input):
        # Print the event name and the corresponding data
        for key, value in event.items():
            print(f"--- Event: {key} ---")
            print(value)
        print("\n" + "="*40 + "\n")

    print("Agent execution finished.")
