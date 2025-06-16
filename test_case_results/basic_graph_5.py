"""
A simple LangGraph application that demonstrates a search query generation and execution flow.
This script creates a graph with two nodes: one to generate a search query and another to simulate search execution.
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

# Define the state structure for our graph
class GraphState(TypedDict):
    """State for the graph."""
    topic: str  # Input topic
    search_query: str  # Generated search query

# load env
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Initialize the Gemini model
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

def generate_search_query(state: GraphState) -> dict:
    """Node function to generate a search query based on the topic."""
    print(f"\n--- GENERATING SEARCH QUERY FOR: {state['topic']} ---")
    
    # Create a prompt for generating the search query
    prompt = f"""Given the following topic, generate a concise and effective search query.
    
    Topic: {state['topic']}
    
    Search Query:"""
    
    # Generate the search query using Gemini
    response = model.invoke(prompt)
    search_query = response.content.strip()
    
    print(f"Generated search query: {search_query}")
    return {"search_query": search_query}

def run_search(state: GraphState) -> dict:
    """Node function to simulate running a search."""
    search_query = state["search_query"]
    print(f"\n--- RUNNING SEARCH FOR: {search_query} ---")
    
    # Simulate search results (in a real app, this would call a search API)
    search_results = f"""
    Search Results for "{search_query}":
    
    1. First result about {state['topic']}
    2. Second result about {state['topic']}
    3. Third result about {state['topic']}
    """
    
    print(search_results)
    print("--- SEARCH COMPLETED ---")
    return {}

def main():
    """Build and run the graph."""
    # Create a new graph
    workflow = StateGraph(GraphState)
    
    # Add nodes to the graph
    workflow.add_node("generate_query", generate_search_query)
    workflow.add_node("run_search", run_search)
    
    # Define the graph edges
    workflow.set_entry_point("generate_query")
    workflow.add_edge("generate_query", "run_search")
    workflow.add_edge("run_search", END)
    
    # Compile the graph
    app = workflow.compile()
    
    # Example usage
    topic = "latest advancements in renewable energy"
    print(f"Starting graph execution with topic: {topic}")
    
    # Run the graph
    result = app.invoke({"topic": topic})
    print("\nGraph execution completed!")
    print(f"Final state: {result}")

if __name__ == "__main__":
    main()
