# LangGraph-Dev-Navigator

This repository streamlines and enhances the LangGraph development process by providing a comprehensive framework for using AI coding assistants (like Cursor, Windsurf, and Cline) in a grounded, reproducible, and efficient manner. It empowers developers to build robust, reliable, and well-documented LangGraph applications by ensuring AI-generated code adheres to best practices and leverages official documentation.

## Key Features:

*   **AI-Driven Development Guidance:** Provides a structured system of rules that guides AI assistants in understanding developer intentions and selecting the appropriate documentation for each development task, leading to more accurate and relevant code generation.
*   **Local Repository as Source of Truth:** Enforces the use of the local `langchain-ai/langgraph` repository as the primary knowledge base, ensuring all code is aligned with the latest version-controlled documentation and eliminating reliance on outdated or external information.
*   **IDE Integration for Development Efficiency:** Offers pre-built configurations and best practices for seamlessly integrating these rules into popular IDEs, making AI assistance a natural part of your development workflow.
*   **Transparent and Traceable Development:** Encourages AI assistants to explicitly declare the rules they are following and the reasoning behind their choices, promoting greater transparency and trust in the generated code, and simplifying debugging.
*   **Mitigation of Development Pitfalls:** Includes a detailed roadmap for implementing key features and proactively mitigating common pitfalls in LangGraph development, such as API drift, biased outputs, and security vulnerabilities.

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

## Documentation:

*   `langchain-agent-workflow-plan.md`: High-level plan for agentic workflow development.
*   `ide_integration_guide.md`: Concrete steps for integrating the rules into your IDE.
*   `task_implementation_strategies.md`: Mapping of roadmap items to implementation strategies.
*   `tmp_windsurf_rule.md`: The core rules file that guides the AI assistant.

## Contributing:

... (Add your contribution guidelines here) ...
