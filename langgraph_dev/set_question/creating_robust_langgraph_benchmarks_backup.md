# Guidelines for Creating a LangGraph Benchmark to Measure Tool-Assisted Performance

## 1. The Core Philosophy: Designing for a "Knowledge Gap"

The central challenge in evaluating an AI developer agent is distinguishing its intrinsic problem-solving ability from the performance gains provided by its tools and context. If a test can be solved using only the LLM's pre-trained knowledge, we learn nothing about the value of the ecosystem we have built.

Therefore, the foundational principle of this benchmark is to **create a necessary dependency**. Each test case must be designed to create a specific "knowledge gap" where the LLM's internal knowledge is insufficient or incorrect. The only path to a correct solution must be through the strategic use of the provided tools (local file readers, RAG, knowledge graph validation, etc.).

This approach allows us to meet two primary goals:
1.  **Efficacy:** Can the agent solve complex, realistic LangGraph problems?
2.  **Attribution:** Can we measure and attribute the success to the specific tools provided?

---

## 2. A Framework for Test Case Design

A robust test case is born from a practical source and is designed to target a specific type of knowledge gap.

### 2.1. Sources & Strategies for Creating Challenging Problems (The "How-To")

These are the practical methods for generating effective test cases:

*   **Focus on Modification, Not Just Creation:** Frame tasks as refactoring or enhancement requests on existing code. This is more realistic than starting from a blank slate and forces the agent to first read and comprehend code before making changes.
*   **Combine Multiple Concepts:** Increase complexity by designing tasks that require integrating several distinct LangGraph concepts (e.g., persistence, streaming, and conditional logic). This moves the problem away from any single, known documentation example.
*   **Mine Real-World Scenarios:** Use the `langgraph` GitHub repository's issue tracker (both open and closed) as a primary source of inspiration. Bug reports and feature requests are ideal raw material for creating authentic challenges.

### 2.2. Test Case Categories Based on Knowledge Gaps (The "Why")

Use the sources above to create problems that fit into one of these theoretical categories:

#### Category 1: The "Subtle API" Test
*   **Goal:** To force the agent to read the local, version-specific source code.
*   **How to Create:** Find a feature, parameter, or class in the current version that is too new or obscure to be in general training data. A great source is a recently implemented feature request from GitHub.
*   **Example Task:**
    > "Create a graph that uses the `StateGraph`'s `with_config()` method. Inside the config, you **must** pass a `run_name`. Additionally, one of your nodes must be a `RunnableLambda` that explicitly accesses this `run_name` from its `config` argument."

#### Category 2: The "Version Skew" Test
*   **Goal:** To force the agent to trust up-to-date RAG documentation over its own outdated knowledge.
*   **How to Create:** Find a bug report on GitHub that was caused by an API change. Frame the test case around the old, now-incorrect pattern.
*   **Example Task:**
    > "Build a simple agent with a conditional edge. The condition function should return a single string that is the name of the next node to execute, which was a common pattern in early versions of LangGraph."

#### Category 3: The "Novel Integration" Test
*   **Goal:** To force the agent to use RAG to learn and apply a new, external requirement.
*   **How to Create:** Invent a new "internal standard" for the project and document it only within your RAG knowledge base.
*   **Example Task:**
    > "We have a new internal standard that all tool-using nodes must be decorated with `fast_retry.retry(on=[IOError])` for error handling. Modify the provided agent script to apply this decorator to the `search_tool` node and ensure the `fast-retry` package is added to `requirements.txt`."

---

## 3. Measuring Performance Gain and Attributing Value

This framework provides a clear methodology for measuring the impact of your tools.

1.  **Establish a Baseline (Control Group):** For each test case, run it with a "vanilla" version of the agent where tool use is disabled. In most cases, it will fail, demonstrating the insufficiency of pre-trained knowledge.
2.  **Run the Experiment (Equipped Agent):** Run the same test case with the fully-equipped agent.
3.  **Analyze the Trace for Attribution:** When the equipped agent succeeds, its tool trace provides direct evidence of the performance gain. You can pinpoint the exact `perform_rag_query` or `read_file` call that provided the missing knowledge and confidently attribute the success to that specific tool.
