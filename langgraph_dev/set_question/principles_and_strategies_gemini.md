Evaluating the proficiency of a Large Language Model (LLM) with specialized tools on a specific Python package requires a bespoke evaluation dataset that moves beyond generic code generation benchmarks. Drawing inspiration from the principles behind SWE-bench, this guide outlines a first-principle approach to designing such a dataset, complete with strategies and metrics tailored to your goal.

### Guiding Principles for Designing the Evaluation Dataset

The foundation of a robust evaluation dataset rests on a set of core principles that ensure the tests are realistic, comprehensive, and revealing of the LLM's true capabilities.

#### 1. Real-World Fidelity
Test cases should mirror the genuine challenges and tasks that developers encounter when using the target Python package. This principle, central to SWE-bench, ensures that the evaluation measures practical problem-solving ability rather than just syntactic correctness on isolated problems.

#### 2. Comprehensive Functional Coverage
The dataset must test the breadth and depth of the Python package's functionality. This includes not only common use cases but also more obscure features, edge cases, and error-handling scenarios.

#### 3. Contextual and Tool-Use Awareness
The evaluation must be explicitly designed to assess the LLM's ability to leverage the provided tools (RAG, GraphRAG, project context). The tasks should be difficult or impossible to solve correctly without the effective use of this contextual information.

#### 4. Graduated and Diagnostic Difficulty
Test cases should span a range of complexities to differentiate between LLMs with varying levels of capability. This allows for a more granular understanding of a model's strengths and weaknesses.

#### 5. Reproducibility and Automation
The evaluation process must be standardized, automated, and easily reproducible to ensure consistent and unbiased assessment.

### Strategies and Approaches to Implement the Principles

To put these principles into practice, you can employ the following strategies to build your evaluation dataset.

#### Task Sourcing and Creation (Real-World Fidelity)
*   **Mine Real-World Problems:** Systematically collect and adapt issues, pull requests, and bug reports from the package's official repository and related projects on platforms like GitHub.
*   **Analyze Community Discussions:** Scour platforms like Stack Overflow and Reddit for common questions, complex use cases, and frequent points of confusion related to the package.
*   **Leverage Documentation:** Convert tutorials, "how-to" guides, and examples from the official documentation into problem statements that require the LLM to re-implement or extend the demonstrated functionality.

#### Ensuring Comprehensive Coverage (Functional Coverage)
*   **API-Driven Test Generation:** Map out the package’s public API. Design tasks that specifically target individual functions, classes, and their various parameters.
*   **Interaction Scenarios:** Create test cases that require combining multiple components of the package to achieve a more complex goal.
*   **"Happy Path" and "Edge Case" Scenarios:** For each feature, design both standard-use "happy path" tests and tests that probe edge cases, such as handling invalid inputs, empty data structures, or zero values.

#### Designing for Tool-Use (Contextual Awareness)
*   **For Retrieval-Augmented Generation (RAG):**
    *   **Task:** Create problems that require knowledge of recent or obscure features not likely to be in the LLM's training data.
    *   **Context:** Provide a curated knowledge base containing the package's full documentation, relevant tutorials, and articles. The LLM must retrieve the correct information to solve the task.
*   **For GraphRAG:**
    *   **Task:** Frame problems that involve understanding and navigating the package's internal architecture, such as modifying a class that has complex dependencies.
    *   **Context:** Provide a knowledge graph representing the package's modules, classes, functions, and their interdependencies. The task would necessitate "traversing" this graph to understand the implications of a change.
*   **For Project Context:**
    *   **Task:** Formulate tasks as "change requests" or "new feature additions" within a small but realistic multi-file project that already uses the target package.
    *   **Context:** Provide the entire project structure. The LLM must read existing code, understand the current implementation, and make coherent modifications or additions.

#### Structuring Test Cases (Reproducibility and Difficulty)
*   **Standardized Format:** Define a clear, machine-readable format (e.g., JSON or YAML) for each test case. This should include:
    *   A unique identifier.
    *   A detailed natural language problem description.
    *   The project context (a set of files).
    *   The RAG/GraphRAG knowledge base.
    *   A set of unit tests to validate the solution.
    *   Metadata: Difficulty level, targeted package features, and task type (e.g., bug fix, feature implementation).
*   **Automated Validation:** Use a standard testing framework like `pytest` to automatically execute the unit tests against the code generated by the LLM. This provides a clear, binary pass/fail signal.

### Key Metrics for Evaluation

To quantify the LLM's performance, a combination of automated and, where necessary, human-led metrics should be used.

#### Primary Metric
*   **Pass@k:** This is the most critical metric for functional correctness. It measures the percentage of problems for which at least one of the `k` generated solutions passes all unit tests. For example, `pass@1` measures the model's ability to produce a correct solution on its first attempt.

#### Secondary Metrics
*   **Code Similarity Scores (e.g., CodeBLEU):** While functional correctness is key, these metrics can offer insight into how close a generated solution is to a reference or "golden" solution, assessing stylistic and structural similarity.
*   **Tool-Use Quality:**
    *   **Faithfulness:** For tasks involving RAG, this measures whether the generated code is factually consistent with the provided context.
    *   **Context Relevance:** Assesses whether the most relevant documents or code snippets were retrieved during the RAG process.
*   **Efficiency and Robustness:**
    *   **Execution Time/Resource Usage:** Measures the performance of the generated code.
    *   **Adversarial Testing:** Augment standard tests with adversarial inputs designed to break the generated code, revealing its robustness.
*   **Human Evaluation:** For a qualitative assessment, have experienced developers review the generated code for:
    *   Readability and maintainability.
    *   Idiomatic use of the Python package.
    *   Overall solution quality and elegance.