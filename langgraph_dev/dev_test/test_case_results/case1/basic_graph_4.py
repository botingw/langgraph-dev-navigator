"""
A simple LangGraph application that generates a search query from a topic and simulates a search.
"""
from typing import Dict, TypedDict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from duckduckgo_search import DDGS
from dotenv import load_dotenv
import os
import json

# load env
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Set up the Gemini model
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

# Define the state schema
class GraphState(TypedDict):
    """State of the graph."""
    topic: str
    search_query: str = ""
    search_results: str = ""

def generate_query(state: GraphState) -> Dict[str, str]:
    """Generate a search query based on the topic."""
    messages = [
        HumanMessage(
            content=f"Generate a search query for the topic: {state['topic']}. "
                    "Return only the query with no additional text or formatting."
        )
    ]
    
    response = llm.invoke(messages)
    # Clean up the query by removing extra quotes and whitespace
    query = response.content.strip('"\'').strip()
    print(f"Generated query after cleanup: '{query}'")
    return {"search_query": query}

def run_search(state: GraphState) -> Dict[str, str]:
    """Run a real web search with the generated query using DuckDuckGo."""
    query = state['search_query']
    print(f"Attempting to search for: {query}")
    
    try:
        with DDGS() as ddgs:
            print("Connected to DDGS")
            # Get search results with a simpler query
            search_results = list(ddgs.text(query, max_results=5))
            print(f"Found {len(search_results)} results")
            
            if not search_results:
                # Try a fallback search with just the main topic
                print("Trying fallback search...")
                fallback_query = state['topic'].split()[0]  # Try just the first word
                search_results = list(ddgs.text(fallback_query, max_results=5))
                print(f"Fallback search found {len(search_results)} results")
                
                if not search_results:
                    return {"search_results": f"No search results found for: {query}"}
            
            # Format the results
            formatted_results = f"Search results for '{query}':\n\n"
            for i, result in enumerate(search_results, 1):
                title = result.get('title', 'No title')
                url = result.get('href', 'No URL')
                body = result.get('body', 'No description')
                
                formatted_results += (
                    f"{i}. {title}\n"
                    f"   URL: {url}\n"
                    f"   {body}\n\n"
                )
            
            return {"search_results": formatted_results}
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error details: {error_details}")
        return {"search_results": f"Error performing search: {str(e)}\n\n{error_details}"}

def main():
    # Create a new graph
    workflow = StateGraph(GraphState)
    
    # Add nodes to the graph
    workflow.add_node("generate_query", generate_query)
    workflow.add_node("run_search", run_search)
    
    # Define the edges
    workflow.add_edge("generate_query", "run_search")
    workflow.add_edge("run_search", END)
    
    # Set the entry point
    workflow.set_entry_point("generate_query")
    
    # Compile the graph
    app = workflow.compile()
    
    # Example usage
    topic = "latest advancements in AI"
    print(f"Processing topic: {topic}")
    
    # Execute the graph
    for output in app.stream({"topic": topic}):
        for key, state in output.items():
            if key == "generate_query":
                print(f"\nGenerated search query: {state['search_query']}")
            elif key == "run_search":
                print(f"\n{state['search_results']}")

if __name__ == "__main__":
    main()
