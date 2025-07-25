import os
from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import random

# --- State Schema ---
class AgentState(TypedDict):
    task: str
    current_step: str
    past_actions: List[str]
    reflection: str
    error_count: int
    max_retries: int
    success: bool

# --- Tool Simulation ---
def perform_tool_action(step: str):
    """Simulates a tool action that can succeed or fail."""
    print(f"--- EXECUTING ACTION: {step} ---")
    if "fail" in step.lower() or random.random() < 0.4:
        raise ValueError("Tool action failed unexpectedly.")
    return f"Successfully executed: {step}"

# --- Node Implementations ---
def execute_action(state: AgentState):
    """Executes the current step and handles potential errors."""
    print("--- ACTION ---")
    try:
        result = perform_tool_action(state["current_step"])
        return {"reflection": f"Success: {result}", "success": True}
    except Exception as e:
        print(f"Action failed: {e}")
        return {
            "reflection": f"Error: {str(e)}",
            "error_count": state["error_count"] + 1,
            "success": False,
        }

def generate_reflection(state: AgentState):
    """Generates a reflection on the last action's outcome."""
    print("--- REFLECTION ---")
    # In a real scenario, an LLM would generate this reflection.
    # Here, we simulate it based on the success flag.
    if state["success"]:
        reflection = "The last action was successful. The task can be considered complete."
    else:
        if state["error_count"] < state["max_retries"]:
            reflection = "The last action failed. A retry is recommended with a modified approach."
            # Simulate modifying the step for the retry
            state["current_step"] = state["current_step"].replace("fail", "succeed")
        else:
            reflection = "The last action failed, and the maximum number of retries has been reached. Aborting task."
    
    print(f"Reflection: {reflection}")
    return {"reflection": reflection, "past_actions": state["past_actions"] + [state["current_step"]]}

def success_node(state: AgentState):
    """Handles the successful completion of the task."""
    print("--- SUCCESS ---")
    print(f"Task '{state['task']}' completed successfully.")
    return {"success": True}

def failure_node(state: AgentState):
    """Handles the failure of the task after retries."""
    print("--- FAILURE ---")
    print(f"Task '{state['task']}' failed after {state['max_retries']} retries.")
    return {"success": False}

# --- Decision Router ---
def route_decision(state: AgentState):
    """Routes based on the reflection and error count."""
    print("--- ROUTING ---")
    if state["success"]:
        return "success_node"
    if state["error_count"] >= state["max_retries"]:
        return "failure_node"
    return "execute_action" # Retry

# --- Graph Assembly ---
workflow = StateGraph(AgentState)

workflow.add_node("execute_action", execute_action)
workflow.add_node("generate_reflection", generate_reflection)
workflow.add_node("success_node", success_node)
workflow.add_node("failure_node", failure_node)

workflow.set_entry_point("execute_action")

workflow.add_edge("execute_action", "generate_reflection")
workflow.add_conditional_edges(
    "generate_reflection",
    route_decision,
    {
        "success_node": "success_node",
        "failure_node": "failure_node",
        "execute_action": "execute_action",
    },
)
workflow.add_edge("success_node", END)
workflow.add_edge("failure_node", END)


# --- Compile and Run ---
app = workflow.compile()

# --- Test Cases ---
def run_test(initial_state):
    print("\n" + "="*50)
    print(f"STARTING TEST: {initial_state['task']}")
    print("="*50)
    final_state = app.invoke(initial_state)
    print("\n" + "-"*50)
    print("Final State:")
    print(final_state)
    print("="*50 + "\n")

# Test 1: Successful execution on the first try
initial_state_success = {
    "task": "Process data successfully",
    "current_step": "Process data",
    "past_actions": [],
    "reflection": "",
    "error_count": 0,
    "max_retries": 2,
    "success": False,
}
# To ensure first try success for demo, we remove 'fail' and rely on random chance not failing.
initial_state_success["current_step"] = "Process data without failing" 

# Test 2: Failure and successful retry
initial_state_retry = {
    "task": "Process data with a recoverable error",
    "current_step": "Process data with a fail step",
    "past_actions": [],
    "reflection": "",
    "error_count": 0,
    "max_retries": 2,
    "success": False,
}

# Test 3: Unrecoverable failure
initial_state_failure = {
    "task": "Process data with persistent failure",
    "current_step": "Process data and always fail",
    "past_actions": [],
    "reflection": "",
    "error_count": 0,
    "max_retries": 1, # Lower retries to see failure faster
    "success": False,
}

if __name__ == "__main__":
    # NOTE: You need to have OPENAI_API_KEY set in your environment,
    # even though we are mocking the LLM call for simplicity.
    # The underlying libraries may still try to initialize it.
    # os.environ["OPENAI_API_KEY"] = "your-api-key"
    
    # For this example, we don't need an LLM, so we can run without the key.
    
    run_test(initial_state_success)
    run_test(initial_state_retry)
    run_test(initial_state_failure)
