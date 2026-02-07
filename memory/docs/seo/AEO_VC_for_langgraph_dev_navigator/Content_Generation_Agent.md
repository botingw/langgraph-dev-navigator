Update Content Generation Agent findings:

Files to modify:
- app/layout.tsx

Goals: ### **Snippet-Friendly Summaries**

Context:
- ### **Snippet-Friendly Summaries**
- Here are two concise, AEO-optimized summaries based on the website's core value propositions.
- **For "What is LangGraph Dev Navigator?"**
- The LangGraph Dev Navigator is a development tool designed to eliminate AI code hallucinations. It provides developers with runnable, version-correct answers by searching their local repository instead of the public web. Using a Supabase RAG pipeline for retrieval and a Neo4j knowledge graph for validation, the Navigator ensures every piece of generated code is grounded in your specific project files and structurally sound before you receive it. This allows you to ship reliable code with confidence.
- **For "How does it guarantee correct code?"**
- The tool uses a transparent "Retrieve, Generate, Validate" workflow. First, it retrieves the most relevant files and examples directly from your repository using RAG. Next, it generates a scoped code solution based on that context. Finally, it validates the generated code's structure—including classes, methods, and parameters—against a Neo4j knowledge graph of your specific LangGraph version. Only verified, runnable answers are delivered, complete with traceable proof of their origin.