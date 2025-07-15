# Gold Standard Solution for Test Case 1.1

from typing import TypedDict, List, Annotated
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # The key fix is using Annotated with add_messages to handle the append logic.
    messages: Annotated[List[BaseMessage], add_messages]

def agent_node(state: AgentState) -> dict:
    # Now, returning a list of messages will correctly append to the state.
    return {"messages": [AIMessage(content="This is a new message.")]}

graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.set_entry_point("agent")
graph_builder.add_edge("agent", END)
app = graph_builder.compile()
