# LangGraph Rules Test Cases

These test cases are designed to evaluate how well the LangGraph rules guide AI assistants in developing LangGraph applications. Each test case is atomic and self-contained.

## Test Case 1: Basic Graph Construction

### User Prompt:
```
Create a new Python script named `basic_graph.py`. In this script, build a simple LangGraph application from scratch. The graph should take a topic as input, have a first node that generates a search query, and a second node that pretends to 'run' the search. The graph should then finish.
```

### Expected Rule Reference:
- **Rule 2**: Building Your First Application (The "Hello World")
- Primary Documentation: @file:langgraph/docs/docs/getting_started/quick_start.md

### Expected Output:
- A complete, runnable Python script
- Graph with at least two nodes and one edge
- Correct usage of StateGraph initialization
- Basic node implementation with input/output handling

## Test Case 2: Conditional Logic

### User Prompt:
```
Create a new script named `conditional_graph.py`. In this script, build a complete graph that routes requests based on content. The graph should take a user question as input. A 'router' node will check if the question contains the word 'weather'.
* If it does, the graph must route to a `get_weather` node.
* If it doesn't, the graph must route to a `general_qa` node.
Both the `get_weather` and `general_qa` nodes can just print a message. The graph should end after running one of them.
```

### Expected Rule Reference:
- **Rule 3**: Implementing Conditional Logic (Branching)
- Primary Documentation: @file:langgraph/docs/docs/concepts/edges.md
- Code Example: @file:langgraph/docs/docs/getting_started/quick_start.md

### Expected Output:
- Complete graph with conditional routing
- Proper implementation of conditional edges
- Working routing logic based on state inspection

## Test Case 3: Graph Visualization

### User Prompt:
```
In a new script named `visualize_graph.py`, perform two tasks. First, define a simple LangGraph with three nodes: `node_a`, `node_b`, and `node_c`, connected in a sequence (A -> B -> C). Second, after the graph is defined, add the code required to generate a PNG image of this graph's structure and save it as `diagram.png`.
```

### Expected Rule Reference:
- **Rule 8**: Visualizing and Debugging a Graph
- Primary Documentation: @file:langgraph/docs/docs/how-tos/visualization.md

### Expected Output:
- Complete graph definition
- Correct visualization code
- Generated PNG file showing graph structure

## Test Case 4: Human-in-the-Loop

### User Prompt:
```
Create a new, complete script `human_approval_graph.py`. The graph should have a node that proposes a plan, like 'Format the hard drive'. After this node runs, the graph **must** pause and wait for human input using LangGraph's built-in interrupt mechanism. If the human user approves, it should proceed to a final node called `execute_plan`. If not, it should end.
```

### Expected Rule Reference:
- **Rule 5**: Adding Human-in-the-Loop
- Primary Documentation: @file:langgraph/docs/docs/how-tos/human_in_the_loop.md

### Expected Output:
- Graph with interrupt mechanism
- Correct checkpointing implementation
- Working human approval flow

## Test Case 5: Agentic Loop

### User Prompt:
```
Build a complete, runnable agent in a single new script named `agent.py`. The agent's logic must be built using LangGraph. The agent needs to be able to loop.
1. It should take a question as input.
2. It should have a main 'agent' node that decides whether to use a `search_tool` or to generate a `final_answer`.
3. Use a conditional edge for this routing. If it decides 'tool', it should run a dummy `search_tool` node. If it decides 'answer', it runs a dummy `final_answer` node and the graph should stop.
4. After the `search_tool` node runs, it **must** loop back to the main 'agent' node for the next decision.
Create dummy functions for the tool and the agent nodes.
```

### Expected Rule Reference:
- **Rule 9**: Building Complex Agentic Systems
- Primary Documentation: @file:langgraph/docs/docs/use_cases/agent_executor/

### Expected Output:
- Complete agent implementation
- Working loop structure
- Correct conditional routing
- Proper node implementation

## How to Use These Test Cases

1. Copy each test case prompt into your IDE
2. Observe if the AI assistant:
   - References the correct rule number
   - Uses the appropriate documentation
   - Produces a complete, runnable implementation
   - Follows the correct LangGraph patterns
3. Evaluate the quality and completeness of the generated code
4. Compare results across different AI assistants
