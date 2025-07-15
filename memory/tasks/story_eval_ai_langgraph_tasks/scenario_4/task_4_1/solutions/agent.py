# Gold Standard Solution for Test Case 4.1: ReAct Agent

import os
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# This is a mock LLM call for deterministic testing.
# In a real scenario, this would be a call to an actual LLM.
def mock_llm(prompt: str):
    if "search" in prompt:
        return '{"tool_calls": [{"name": "web_search", "args": {"query": "number of letters in the capital of France"}}]}'
    if "calculator" in prompt:
        return '{"tool_calls": [{"name": "calculator", "args": {"expression": "5**0.5"}}]}'
    return '{"tool_calls": []}' # Default to no tool calls

# Import the tools from the provided file
from tools import web_search, calculator

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# Agent node
def agent(state: AgentState):
    last_message = state['messages'][-1]
    # Simulate LLM call to decide the next action
    llm_response = mock_llm(last_message.content)
    return {"messages": [("ai", llm_response)]}

# Create a tool node
tools = [web_search, calculator]
tool_node = ToolNode(tools)

# Define the graph
graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent)
graph_builder.add_node("tools", tool_node)

graph_builder.set_entry_point("agent")

# Conditional edge to decide whether to call tools or end
def should_continue(state: AgentState):
    last_message = state['messages'][-1]
    if "tool_calls" in last_message.content and last_message.content['tool_calls']:
        return "tools"
    else:
        return END

graph_builder.add_conditional_edges("agent", should_continue)
graph_builder.add_edge("tools", "agent")

# Compile the app
app = graph_builder.compile()
