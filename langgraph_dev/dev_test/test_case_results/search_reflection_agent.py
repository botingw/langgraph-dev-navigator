
import os
from dotenv import load_dotenv

load_dotenv()

from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_openai import ChatOpenAI

# Set up your OpenAI API key
# os.environ["OPENAI_API_KEY"] = "YOUR_API_KEY"

# Define the state for our graph
class SearchAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    query: str
    search_results: str
    initial_answer: str
    reflection: str
    final_answer: str

# Define the nodes for our graph
def search_node(state: SearchAgentState):
    """
    Searches the web for the user's query using DuckDuckGo.
    """
    print("---Searching the web with DuckDuckGo---")
    search = DuckDuckGoSearchRun()
    search_results = search.run(state['query'])
    return {"search_results": search_results}

def generation_node(state: SearchAgentState):
    """
    Generates an initial answer based on the search results using an OpenAI model.
    """
    print("---Generating initial answer with OpenAI---")
    llm = ChatOpenAI(model="gpt-4.1-nano", temperature=0)
    prompt = f"""Based on the following search results, please provide an answer to the user's query.

Query: {state['query']}
Search Results: {state['search_results']}

Initial Answer:"""
    response = llm.invoke(prompt)
    return {"initial_answer": response.content}

def reflection_node(state: SearchAgentState):
    """
    Reflects on the initial answer and provides a critique using an OpenAI model.
    """
    print("---Reflecting on the initial answer with OpenAI---")
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    prompt = f"""You are a critic. Your job is to reflect on the following answer and provide a critique.

Query: {state['query']}
Search Results: {state['search_results']}
Initial Answer: {state['initial_answer']}

Critique the answer for accuracy, completeness, and clarity. Provide suggestions for improvement.

Reflection:"""
    response = llm.invoke(prompt)
    return {"reflection": response.content}

def final_generation_node(state: SearchAgentState):
    """
    Generates a final answer based on the reflection using an OpenAI model.
    """
    print("---Generating final answer with OpenAI---")
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    prompt = f"""Based on the following search results, initial answer, and reflection, please provide a final, improved answer to the user's query.

Query: {state['query']}
Search Results: {state['search_results']}
Initial Answer: {state['initial_answer']}
Reflection: {state['reflection']}

Final Answer:"""
    response = llm.invoke(prompt)
    return {"final_answer": response.content}

# Define the graph
builder = StateGraph(SearchAgentState)

builder.add_node("search", search_node)
builder.add_node("generate", generation_node)
builder.add_node("reflect", reflection_node)
builder.add_node("final_generate", final_generation_node)

builder.add_edge(START, "search")
builder.add_edge("search", "generate")
builder.add_edge("generate", "reflect")
builder.add_edge("reflect", "final_generate")
builder.add_edge("final_generate", END)

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# Run the agent
if __name__ == "__main__":
    query = "What is the capital of France?"
    config = {"configurable": {"thread_id": "1"}}
    # We need to initialize the state with the query and an empty list of messages
    initial_state = {"query": query, "messages": [HumanMessage(content=query)]}
    result = graph.invoke(initial_state, config=config)

    print("\n---Final Answer---")
    print(result['final_answer'])
