# LangGraph-Dev-Navigator

This repository streamlines and enhances the LangGraph development process by providing a comprehensive framework for using AI coding assistants (like Cursor, Windsurf, and Cline) in a grounded, reproducible, and efficient manner. It empowers developers to build robust, reliable, and well-documented LangGraph applications by ensuring AI-generated code adheres to best practices and leverages official documentation.

## Key Features:

*   **AI-Driven Development Guidance:** Provides a structured system of rules that guides AI assistants in understanding developer intentions and selecting the appropriate documentation for each development task, leading to more accurate and relevant code generation.
*   **Local Repository as Source of Truth:** Enforces the use of the local `langchain-ai/langgraph` repository as the primary knowledge base, ensuring all code is aligned with the latest version-controlled documentation and eliminating reliance on outdated or external information.
*   **IDE Integration for Development Efficiency:** 🚧 *Not Implemented Yet* - Offers pre-built configurations and best practices for seamlessly integrating these rules into popular IDEs, making AI assistance a natural part of your development workflow.
*   **Transparent and Traceable Development:** 🚧 *Not Implemented Yet* - Encourages AI assistants to explicitly declare the rules they are following and the reasoning behind their choices, promoting greater transparency and trust in the generated code, and simplifying debugging.
*   **Mitigation of Development Pitfalls:** 🚧 *Not Implemented Yet* - Includes a detailed roadmap for implementing key features and proactively mitigating common pitfalls in LangGraph development, such as API drift, biased outputs, and security vulnerabilities.

## Getting Started:

1.  Clone this repository.
This single command clones both this repository and the required `langgraph` documentation repository inside it.
```bash
git clone --recursive https://github.com/your-username/langgraph-dev-navigator.git
cd langgraph-dev-navigator
```
2.  Clone the `langchain-ai/langgraph` repository as a submodule or sibling directory.
```bash
 git submodule init
 git submodule update
```

3. create a conda env
```bash
conda create --name langgraph-dev python=3.13
conda activate langgraph-dev
```

4. install langgraph (when install both google-generativeai and langchain-google-genai seems have conflict)
```bash
pip install langgraph
pip install google-generativeai
pip install langchain-google-genai
pip install python-dotenv
pip install duckduckgo-search
```


5.  Start building!

Of course. Here is a simple and concise paragraph for your README, created using a first-principles approach.

**First Principles Applied:**
1.  **Problem:** The installed code version can differ from the documentation source version.
2.  **Solution:** Find the installed version (`pip`), then force the documentation source to that exact version (`git`).
3.  **Audience Need:** A quick, actionable recipe, not a long tutorial.

---

### Aligning Docs & Code Version

This is an optional but recommended step to ensure the documentation source (for AI assistants to generate code) perfectly matches the version of the `langgraph` library you have installed.

1.  **Find your installed package version:**
    ```bash
    pip show langgraph
    ```
    (Look for the `Version:` line, e.g., `0.0.56`)

2.  **Align the submodule to that version tag and commit the change:**
    ```bash
    # Go into the submodule, check out the tag, then go back
    (cd langgraph && git fetch --all --tags && git checkout tags/v0.0.56)

    # Commit the new version pointer to your main project
    git add langgraph
    git commit -m "Align langgraph submodule with v0.0.56"
    ```
    *(Remember to replace `v0.0.56` with the version you found in step 1.)*

## Documentation:

### For developers
*   `docs/prd.md`: High-level plan for improving SWE agents's capabilities in agentic workflow development. 
*   `docs/ide_integration_guide.md`: Concrete steps for integrating the rules into your IDE.
*   `docs/task_implementation_strategies.md`: Mapping of roadmap items to implementation strategies.
*   `docs/langgraph-ai-rules.md`: The core rules file that guides the AI assistant. It is in .clinerules folder and .windsurf/rules folder.

## Contributing:

... (Add your contribution guidelines here) ...
