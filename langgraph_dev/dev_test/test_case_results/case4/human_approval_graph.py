
from typing import TypedDict, Annotated, Union
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# This script requires a checkpointer to manage state across interruptions.
memory = MemorySaver()

class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        plan: The proposed plan to be executed.
        approved: A boolean indicating whether the user has approved the plan.
    """
    plan: str
    approved: bool

def propose_plan(state: GraphState):
    """Proposes a plan for the user to approve."""
    print("--- proposing plan ---")
    return {"plan": "Format the hard drive"}

def wait_for_approval(state: GraphState):
    """
    This is a placeholder node where the graph will pause.
    The user's decision will be supplied when resuming.
    """
    print("--- pausing for approval ---")
    # This node doesn't do anything itself, it's just a point to interrupt.
    return {}

def execute_plan(state: GraphState):
    """Executes the plan if approved."""
    print("--- executing plan ---")
    print(f"Executing approved plan: {state['plan']}")
    return {}

def should_execute(state: GraphState) -> str:
    """
    Determines whether to execute the plan based on user approval.
    This node is the gatekeeper after the human-in-the-loop interruption.
    """
    print("--- checking for approval ---")
    if state.get("approved"):
        print("Approval received. Proceeding to execution.")
        return "execute"
    else:
        print("No approval. Ending workflow.")
        return "end"

# Define the workflow
workflow = StateGraph(GraphState)

# Add the nodes
workflow.add_node("propose_plan", propose_plan)
workflow.add_node("wait_for_approval", wait_for_approval)
workflow.add_node("execute_plan", execute_plan)


# Build the graph structure
workflow.set_entry_point("propose_plan")
workflow.add_edge("propose_plan", "wait_for_approval")

# After the pause, the graph will conditionally decide whether to execute.
workflow.add_conditional_edges(
    "wait_for_approval",
    should_execute,
    {
        "execute": "execute_plan",
        "end": END,
    },
)
workflow.add_edge("execute_plan", END)


# To interrupt, we need to compile the graph with a checkpointer and specify
# where to interrupt. We will interrupt *before* the wait_for_approval node.
app = workflow.compile(
    checkpointer=memory,
    interrupt_before=["wait_for_approval"]
)

# --- Simulate the Human-in-the-Loop Interaction ---

# 1. Start the graph. It will run until the interrupt.
config = {"configurable": {"thread_id": "user-approval-thread-1"}}
print("--- Starting the graph. It will pause for approval. ---")
# The first run will execute `propose_plan` and then pause before `wait_for_approval`.
paused_state = app.invoke({"approved": False}, config)

# 2. The graph is now paused. The `paused_state` contains the current state.
print(f"\n--- Graph paused. Current plan: '{paused_state['plan']}' ---")
print("Waiting for human approval...")

# 3. Simulate the user making a decision.
# Let's say the user approves.
user_approved = True # Change to False to see the rejection path

# 4. Resume the graph with the user's decision in the state.
print(f"\n--- Resuming graph with approval: {user_approved} ---")
# Update the state with the user's approval before resuming
app.update_state(config, {"approved": user_approved})
# Resume the graph from where it was interrupted
final_state = app.invoke(None, config)

print("\n--- Graph finished. ---")
print("Final state:", final_state)

# --- Demonstrate the rejection path ---
print("\n" + "="*40)
print("--- Demonstrating the rejection path ---" + "="*40)
config_2 = {"configurable": {"thread_id": "user-approval-thread-2"}}
print("--- Starting the graph for rejection case. ---")
paused_state_2 = app.invoke({"approved": False}, config_2)
print(f"\n--- Graph paused. Current plan: '{paused_state_2['plan']}' ---")
print("Waiting for human approval...")
user_approved_2 = False
print(f"\n--- Resuming graph with approval: {user_approved_2} ---")
app.update_state(config_2, {"approved": user_approved_2})
final_state_2 = app.invoke(None, config_2)
print("\n--- Graph finished. ---")
print("Final state:", final_state_2)


