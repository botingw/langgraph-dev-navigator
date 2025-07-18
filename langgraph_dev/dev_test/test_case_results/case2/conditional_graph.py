
from typing import TypedDict, Annotated
import operator

from langgraph.graph import StateGraph, END

class GraphState(TypedDict):
    """
    Represents the state of our graph.

    Attributes:
        question: The user's question.
    """
    question: str

def get_weather(state: GraphState):
    """
    A node that handles weather-related questions.
    """
    print("---WEATHER NODE---")
    question = state['question']
    print(f"Getting the weather for: {question}")
    return {}

def general_qa(state: GraphState):
    """
    A node that handles general questions.
    """
    print("---GENERAL QA NODE---")
    question = state['question']
    print(f"Answering general question: {question}")
    return {}

def route_question(state: GraphState):
    """
    A node that routes the question to the appropriate handler.
    """
    print("---ROUTING QUESTION---")
    question = state['question']
    if "weather" in question.lower():
        print("Routing to get_weather")
        return "get_weather"
    else:
        print("Routing to general_qa")
        return "general_qa"

# Define the workflow
workflow = StateGraph(GraphState)

# Add the nodes
workflow.add_node("get_weather", get_weather)
workflow.add_node("general_qa", general_qa)

# Set the conditional entry point
workflow.set_conditional_entry_point(
    route_question,
    {
        "get_weather": "get_weather",
        "general_qa": "general_qa",
    },
)

# Add edges from the handler nodes to the end
workflow.add_edge("get_weather", END)
workflow.add_edge("general_qa", END)

# Compile the graph
app = workflow.compile()

# Run the graph with a weather question
print("--- Running with a weather question ---")
inputs = {"question": "What is the weather in San Francisco?"}
for output in app.stream(inputs):
    for key, value in output.items():
        print(f"Finished node '{key}':")
print("\n")

# Run the graph with a general question
print("--- Running with a general question ---")
inputs = {"question": "How does LangGraph work?"}
for output in app.stream(inputs):
    for key, value in output.items():
        print(f"Finished node '{key}':")
