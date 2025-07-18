# Realistic LangGraph Agent with Reflection
import os
from typing import TypedDict, Annotated, List, Union
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import BaseMessage, HumanMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.pydantic_v1 import BaseModel, Field
import operator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- 1. Define the State for the Graph ---
# We are now making search_results a list that accumulates over time.
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    question: str
    search_queries: List[str]
    search_results: Annotated[List[str], operator.add] # Accumulates search results
    reflection: object

# --- 2. Define Tools and Models ---
search_tool = TavilySearchResults(max_results=2)
model = ChatOpenAI(model="gpt-4.1-nano", temperature=0)

# --- 3. Define Pydantic Models for Structured Output ---
class SearchQueries(BaseModel):
    queries: List[str] = Field(description="A list of 1 to 3 search queries.")

class Reflection(BaseModel):
    is_sufficient: bool = Field(description="Whether the search results are sufficient to answer the question.")
    critique: str = Field(description="A critique of the search results and what's missing.")

agent_model = model.with_structured_output(SearchQueries)
reflection_model = model.with_structured_output(Reflection)

# --- 4. Define the Nodes for the Graph ---

def agent_node(state: AgentState):
    """
    Generates search queries based on the user's question and prior reflection.
    """
    print("---AGENT NODE---")
    
    # Combine all previous search results into a single string for context
    all_results = "\n\n---\n\n".join(state.get('search_results', []))

    if state.get('reflection'):
        prompt = f"""You are a research assistant. The user's question is: '{state['question']}'.
        
        Your previous search results were: 
        {all_results}
        
        Your reflection on these results was: 
        '{state['reflection'].critique}'
        
        Based on this critique, generate a new, more specific set of search queries to find the missing information. Do not repeat past queries."""
    else:
        prompt = f"""You are a research assistant. The user's question is: '{state['question']}'.
        
        Generate a set of 1-3 search queries to find the necessary information."""

    response = agent_model.invoke(prompt)
    print(f"Generated queries: {response.queries}")
    return {"search_queries": response.queries}

def search_tool_node(state: AgentState):
    """
    Executes the search queries using the Tavily tool and formats the results.
    This implementation now follows the simpler pattern from the official examples.
    """
    print("---SEARCH TOOL NODE---")
    queries = state['search_queries']
    # The batch call returns a list of lists, one for each query.
    results_for_all_queries = search_tool.batch([{"query": q} for q in queries])
    
    # Flatten the list of lists into a single list of search results
    all_results = [res for query_results in results_for_all_queries for res in query_results]
    
    # Extract only the content from each result and join into a single string
    results_content = "\n\n".join([res.get('content', '') for res in all_results])
    
    print(f"Search results obtained and formatted.")
    # We return a list with one item so it can be added to the existing list in the state
    return {"search_results": [results_content]}

def reflection_node(state: AgentState):
    """
    Reflects on the accumulated search results and decides if they are sufficient.
    """
    print("---REFLECTION NODE---")
    
    # Join all search results for the reflection prompt
    all_results = "\n\n---\n\n".join(state['search_results'])
    
    prompt = f"""You are a researcher, reflecting on the results of a web search.
    The original question was: {state['question']}
    The accumulated search results are:
    {all_results}
    
    Are these results sufficient to provide a comprehensive answer to the original question?
    Provide a critique of what is missing or what could be improved.
    """
    reflection_result = reflection_model.invoke(prompt)
    print(f"Reflection: Sufficient? {reflection_result.is_sufficient}. Critique: {reflection_result.critique}")
    return {"reflection": reflection_result}

def final_answer_node(state: AgentState):
    """
    Generates the final answer based on all verified search results.
    """
    print("---FINAL ANSWER NODE---")
    
    # Join all search results for the final answer prompt
    all_results = "\n\n---\n\n".join(state['search_results'])
    
    prompt = f"""You are a helpful research assistant.
    The user's original question was: {state['question']}
    You have gathered the following information from multiple web searches:
    {all_results}
    
    Provide a comprehensive final answer to the user's question based on all the gathered information.
    """
    response = model.invoke(prompt)
    print("Final answer generated.")
    return {"messages": [response]}

# --- 5. Define the Conditional Edge Logic ---

def should_continue(state: AgentState):
    """
    Router that decides the next step based on the reflection.
    """
    print("---CONDITIONAL EDGE ROUTING---")
    if state['reflection'].is_sufficient:
        print("Routing to: answer")
        return "answer"
    else:
        print("Routing to: agent (for new queries)")
        return "agent"

# --- 6. Build the Graph ---
workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tool", search_tool_node)
workflow.add_node("reflection", reflection_node)
workflow.add_node("answer", final_answer_node)

workflow.set_entry_point("agent")

workflow.add_edge("agent", "tool")
workflow.add_edge("tool", "reflection")

workflow.add_conditional_edges(
    "reflection",
    should_continue,
    {
        "answer": "answer",
        "agent": "agent",
    }
)

workflow.add_edge("answer", END)

app = workflow.compile()

# --- 7. Run the Agent ---
if __name__ == "__main__":
    print("Starting the realistic agent execution...")
    
    if not os.environ.get("OPENAI_API_KEY") or not os.environ.get("TAVILY_API_KEY"):
        print("\nERROR: Please set the OPENAI_API_KEY and TAVILY_API_KEY environment variables.\n")
    else:
        question = "What were the key findings of the 2023 AI Index Report?"
        initial_input = {
            "question": question,
            "messages": [HumanMessage(content=question)]
        }

        for event in app.stream(initial_input, {"recursion_limit": 15}):
            for key, value in event.items():
                print(f"--- Event: {key} ---")
                if key == 'answer':
                    print(value['messages'][-1].content)
            print("\n" + "="*40 + "\n")

        print("Agent execution finished.")
