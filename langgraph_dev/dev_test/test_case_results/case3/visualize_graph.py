
from typing import TypedDict
from langgraph.graph import StateGraph, END

# To visualize the graph, you may need to install pygraphviz:
# pip install pygraphviz

class GraphState(TypedDict):
    """Represents the state of our graph."""
    value: str

def node_a(state: GraphState):
    """A node that prints a message and updates the state."""
    print("---NODE A---")
    print("Executing Node A")
    return {"value": "A"}

def node_b(state: GraphState):
    """A node that prints a message and updates the state."""
    print("---NODE B---")
    print("Executing Node B")
    return {"value": "B"}

def node_c(state: GraphState):
    """A node that prints a message."""
    print("---NODE C---")
    print("Executing Node C")
    # This is the final node, so it doesn't need to return anything to the state
    return {}

# Define the workflow
workflow = StateGraph(GraphState)

# Add the nodes
workflow.add_node("node_a", node_a)
workflow.add_node("node_b", node_b)
workflow.add_node("node_c", node_c)

# Set the entrypoint and build the graph
workflow.set_entry_point("node_a")
workflow.add_edge("node_a", "node_b")
workflow.add_edge("node_b", "node_c")
workflow.add_edge("node_c", END)


# Compile the graph
app = workflow.compile()

# --- Visualization ---
try:
    # Get the graph structure
    graph_image = app.get_graph().draw_mermaid_png()

    # Save the image to a file
    with open("diagram.png", "wb") as f:
        f.write(graph_image)
    print("Graph visualization saved as diagram.png")

except Exception as e:
    print(f"Error generating visualization: {e}")
    print("Please ensure you have pygraphviz installed (`pip install pygraphviz`).")

# --- Optional: Run the graph to see it in action ---
print("\n--- Running the graph ---")
inputs = {"value": "start"}
for output in app.stream(inputs):
    for key, value in output.items():
        print(f"Finished node '{key}': {value}")
