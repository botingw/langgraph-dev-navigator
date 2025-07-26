# Legacy Setup Guide (Local-Only)

**Note:** This document contains the original setup instructions for a local-only configuration without the MCP server. The primary, recommended setup guide is now in the main `README.md`. These instructions are preserved for reference.

---

## Getting Started:

1.  Clone this repository.
This single command clones both this repository and the required `langgraph` documentation repository inside it.
```bash
git clone --recursive https://github.com/your-username/langgraph-dev-navigator.git
cd langgraph-dev-navigator
```
2.  Initialize the submodule.
```bash
 git submodule init
 git submodule update
```

3. Create a conda environment.
```bash
conda create --name langgraph-dev python=3.13
conda activate langgraph-dev
```

4. Install dependencies.
```bash
pip install langgraph
pip install google-generativeai
pip install langchain-google-genai
pip install python-dotenv
pip install duckduckgo-search
```
