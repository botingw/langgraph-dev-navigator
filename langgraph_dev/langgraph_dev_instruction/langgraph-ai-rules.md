---
trigger: always_on
description: when develop langgraph agents related works
---

# AI Assistant Guide to Developing with LangGraph

<meta_instructions>
You are an AI assistant and expert LangGraph developer. Your mission is to help a user by creating plans and code based exclusively on the official documentation in this repository. You MUST follow this precise workflow:

**Phase 1: Analysis and Declaration**

1.  **Analyze the User's ENTIRE Request:** Identify ALL distinct features or concepts the user wants to implement (e.g., "create a basic graph," "add human approval," "make it persistent," "use a specific model").

2.  **Identify ALL Matching Rules:** For each feature, find the corresponding Rule below. It is common for a single request to match multiple rules.

3.  **Declare ALL Matched Rules and Your Plan:** Your response MUST begin by listing every rule you have identified. Then, state your high-level plan, which must involve synthesizing information from the specified documents. Example:
    > "This request requires combining concepts from multiple rules:
    > *   **Rule 2 (Building a First Application)** for the basic graph structure.
    > *   **Rule 5 (Human-in-the-Loop)** for the approval step.
    > *   **Rule 7 (Persistence)** to save the state.
    > My plan is to first use the `quick_start.md` as a base template, then integrate the interrupt pattern from `human_in_the_loop.md` and the checkpointer setup from `persistence.md`."

**Phase 2: Information Retrieval and Development**

4.  **Use Direct File Access FIRST:** Your primary method for information retrieval is to directly open and read the `@file` paths listed in your chosen rules. **Do not use semantic search as a first step.** The thrashing of multiple searches is inefficient. Directly access the file you know is correct.

5.  **Use Semantic Search SECOND:** After opening a file, you may use semantic search *within that file* to locate specific terms or code blocks if needed.

6.  **Synthesize, Don't Hallucinate:** Build your final code by combining the patterns from the documents you've read. If the user requests a specific model or library not mentioned in the docs, acknowledge this and use your general knowledge to implement that specific part, but justify your choice.
</meta_instructions>

---

### **Rule 1: Foundational Concepts (The "First Read")**

**Intent:** To understand the absolute basics of what LangGraph is, how it works, and its core components. This is the starting point for any task.

*   **Key Concepts:** Graph, State, Nodes, Edges.
*   **Primary Documentation & Code:**
    *   For the "what and why": `@file:langgraph/docs/docs/getting_started/introduction.md`
    *   To understand the main idea: `@file:langgraph/docs/docs/concepts/graphs.md`
    *   To understand how information is managed: `@file:langgraph/docs/docs/concepts/state.md`
    *   To understand the units of work: `@file:langgraph/docs/docs/concepts/nodes.md`
    *   To understand how to define the flow: `@file:langgraph/docs/docs/concepts/edges.md`

---

### **Rule 2: Building Your First Application (The "Hello World")**

**Intent:** To create a basic, runnable LangGraph application from scratch.

*   **Key Concept:** Assembling a simple graph with a start and end point.
*   **Primary Documentation & Code:**
    *   The main tutorial is `@file:langgraph/docs/docs/getting_started/quick_start.md`. This is the most critical file for a beginner. It contains both explanatory text and all the necessary code.

---

### **Rule 3: Implementing Conditional Logic (Branching)**

**Intent:** To create a branch in the graph, where the next step is chosen based on the current state (e.g., an "if/else" statement).

*   **Key Concept:** **Conditional Edges**. An edge that routes to different nodes based on a function's output.
*   **Primary Documentation & Code:**
    *   Theory: The "Conditional Edges" section within `@file:langgraph/docs/docs/concepts/edges.md`.
    *   Primary Example: The tutorial in `@file:langgraph/docs/docs/getting_started/quick_start.md` implements a conditional graph.
    *   Advanced Example: `@file:langgraph/docs/docs/use_cases/agent_executor/base.ipynb`.

---

### **Rule 4: Creating Loops and Cycles**

**Intent:** To allow the graph to repeat steps or return to a previous node. This is essential for agentic behavior (e.g., re-trying a tool use).

*   **Key Concept:** Adding an edge from a node back to a previous node in the graph.
*   **Primary Documentation & Code:**
    *   Canonical Example: The agent pattern in `@file:langgraph/docs/docs/use_cases/agent_executor/base.ipynb`.

---

### **Rule 5: Adding Human-in-the-Loop**

**Intent:** To pause the graph execution and require human approval or input before continuing.

*   **Key Concept:** Using an `interrupt` to pause the graph at a specific node.
*   **Primary Documentation & Code:**
    *   Consult `@file:langgraph/docs/docs/how-tos/human_in_the_loop.md`. This is a self-contained guide.

---

### **Rule 6: Streaming Intermediate Results**

**Intent:** To stream tokens, node results, or events back to the user in real-time as the graph executes.

*   **Key Concept:** Using the `.stream()` method and understanding its output.
*   **Primary Documentation & Code:**
    *   For streaming from a specific node: `@file:langgraph/docs/docs/how-tos/streaming_nodes.md`.
    *   For streaming the full graph execution events: `@file:langgraph/docs/docs/how-tos/streaming_graph.md`.

---

### **Rule 7: Saving and Resuming Graph State (Persistence)**

**Intent:** To save the state of a long-running graph and be able to resume it later.

*   **Key Concept:** Checkpointers. These are backends that save the graph's state after each step.
*   **Primary Documentation & Code:**
    *   The complete guide is `@file:langgraph/docs/docs/how-tos/persistence.md`.

---

### **Rule 8: Visualizing and Debugging a Graph**

**Intent:** To generate a diagram or image of the graph to understand its structure and debug its flow.

*   **Key Concept:** Using the `.get_graph().draw_mermaid_png()` method.
*   **Primary Documentation & Code:**
    *   Consult `@file:langgraph/docs/docs/how-tos/visualization.md`.

---

### **Rule 9: Building Complex Agentic Systems**

**Intent:** To build advanced patterns like a ReAct agent, a multi-agent collaboration, or a complex RAG application.

*   **Key Concept:** Combining all previous concepts. The `use-cases` section is a library of advanced templates.
*   **Primary Documentation & Code:**
    *   For a standard agent with tools: Start with the code in `@file:langgraph/docs/docs/use_cases/agent_executor/`.
    *   For multi-agent systems: See `@file:langgraph/docs/docs/use_cases/multi_agent/`.
    *   For advanced RAG: See `@file:langgraph/docs/docs/use_cases/rag/`.

---

### **Rule 10: Deploying a Graph as an API**

**Intent:** To expose a finished LangGraph application as a production-ready API.

*   **Key Concept:** Using `langserve` to wrap a LangGraph object.
*   **Primary Documentation & Code:**
    *   Consult the guides in the `@file:langgraph/docs/docs/deployment/` directory.

---

### **Rule 11: Complex Synthesis (Example for the AI)**
**Intent:** This is a meta-rule to show you how to combine concepts. If a user asks, "How do I build a graph that waits for my approval and also saves its state?", you should recognize that this involves multiple intents.
*   **Action:**
    1.  Identify that the request matches **Rule 5 (Human-in-the-Loop)** and **Rule 7 (Persistence)**.
    2.  Declare this to the user.
    3.  Your primary files for this task are now `@file:langgraph/docs/docs/how-tos/human_in_the_loop.md` AND `@file:langgraph/docs/docs/how-tos/persistence.md`.
    4.  Create a plan that uses a `StateGraph`, adds an `interrupt` based on the Rule 5 document, and configures a `checkpointer` based on the Rule 7 document.