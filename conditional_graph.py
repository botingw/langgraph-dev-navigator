from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END, START
import operator
import subprocess
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

class State(TypedDict):
    question: str
    answer: str

def get_weather(state: State):
    print("---GET WEATHER---")
    question = state['question']
    # Simple location parsing
    location = question.split("in ")[-1]
    print(f"Getting weather for: {location}")
    try:
        result = subprocess.run(['curl', f'wttr.in/{location}?format=%C+%t'], capture_output=True, text=True, check=True)
        return {"answer": result.stdout.strip()}
    except subprocess.CalledProcessError as e:
        return {"answer": f"Error getting weather: {e}"}


def general_qa(state: State):
    print("---GENERAL QA---")
    question = state['question']
    print(f"Answering general question: {question}")
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
    result = llm.invoke(question)
    return {"answer": result.content}

def router(state: State) -> str:
    """
    Routes the request to the appropriate node based on the question.
    """
    print("---ROUTING---")
    question = state['question']
    if 'weather' in question.lower():
        print("---ROUTING TO GET WEATHER---")
        return "get_weather"
    else:
        print("---ROUTING TO GENERAL QA---")
        return "general_qa"

graph_builder = StateGraph(State)

graph_builder.add_node("get_weather", get_weather)
graph_builder.add_node("general_qa", general_qa)

graph_builder.add_conditional_edges(
    START,
    router,
    {
        "get_weather": "get_weather",
        "general_qa": "general_qa",
    }
)

graph_builder.add_edge("get_weather", END)
graph_builder.add_edge("general_qa", END)

graph = graph_builder.compile()

# Run the graph with a weather question
print("---RUNNING WITH WEATHER QUESTION---")
weather_result = graph.invoke({"question": "What is the weather in SF?"})
print(f"Final Answer: {weather_result['answer']}")

print("\n" + "="*30 + "\n")

# Run the graph with a general question
print("---RUNNING WITH GENERAL QUESTION---")
general_result = graph.invoke({"question": "What is LangGraph?"})
print(f"Final Answer: {general_result['answer']}")
