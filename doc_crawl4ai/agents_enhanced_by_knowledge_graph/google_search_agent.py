import asyncio
import os
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.llm.openai import OpenAI
from serpapi import GoogleSearch
from dotenv import load_dotenv
import argparse

# Load environment variables from .env file
load_dotenv()

# Ensure the necessary API keys are set
if "SERPAPI_API_KEY" not in os.environ:
    raise ValueError("SERPAPI_API_KEY not found in .env file")
if "OPENAI_API_KEY" not in os.environ:
    raise ValueError("OPENAI_API_KEY not found in .env file")

class SearchResult(BaseModel):
    """Represents a single Google search result."""
    title: str = Field(..., description="The title of the search result.")
    link: str = Field(..., description="The URL link of the search result.")
    snippet: str = Field(..., description="A brief snippet or description of the search result.")

class SearchResults(BaseModel):
    """Represents a list of Google search results."""
    results: list[SearchResult] = Field(..., description="A list of organic search results.")

def google_search(query: str) -> SearchResults:
    """
    Performs a Google search for the given query using SerpApi.

    Args:
        query: The search query.

    Returns:
        A SearchResults object containing the organic search results.
    """
    params = {
        "engine": "google",
        "q": query,
        "api_key": os.environ["SERPAPI_API_KEY"],
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    
    organic_results = results.get("organic_results", [])
    
    search_results_list = [
        SearchResult(
            title=item.get("title", "No Title"),
            link=item.get("link", "No Link"),
            snippet=item.get("snippet", "No Snippet")
        )
        for item in organic_results
    ]
    
    return SearchResults(results=search_results_list)

# Create the agent and register the tool
llm = OpenAI()
agent = Agent([google_search], llm)

async def run_agent(query: str):
    """Runs the agent with the given query and prints the results."""
    print(f"Performing Google search for: '{query}'")
    result = await agent.run(f"Perform a google search for '{query}' and return the results.")
    
    if isinstance(result, SearchResults):
        for i, item in enumerate(result.results, 1):
            print(f"\nResult {i}:")
            print(f"  Title: {item.title}")
            print(f"  Link: {item.link}")
            print(f"  Snippet: {item.snippet}")
    else:
        print("\nCould not retrieve structured search results. Raw output:")
        print(result)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Google Search Agent using pydantic-ai")
    parser.add_argument("query", type=str, help="The search query to perform.")
    args = parser.parse_args()
    
    asyncio.run(run_agent(args.query))
