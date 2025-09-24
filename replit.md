# Overview

LangGraph-Dev-Navigator is a framework designed to enhance AI-assisted development of LangGraph applications by grounding AI agents with accurate, version-controlled documentation and code knowledge. The system combines Retrieval-Augmented Generation (RAG) with Knowledge Graph validation to reduce hallucinations and provide reliable, runnable code generation. The project treats AI development assistance as a scientific endeavor with quantifiable metrics for improvement.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The system uses a multi-channel approach for AI assistance integration:
- **Multiple AI Assistant Support**: Configured for Claude, Cursor, Windsurf, GitHub Copilot, and other popular AI coding assistants
- **Instruction Distribution**: Automated setup scripts distribute LangGraph-specific rules and instructions to different AI assistants via their respective configuration files
- **Web Interface**: Express.js-based API server with static file serving for frontend components

## Backend Architecture
The core architecture follows a microservices pattern with specialized components:

### Main Application Layer
- **Node.js/Express API Server**: Handles HTTP requests, CORS, security middleware, and serves static content
- **Python Tools Layer**: Command-line utilities for web scraping, search, screenshot capture, and LLM API interactions
- **Configuration Management**: Environment-based configuration with `.env` file support and VS Code debug configurations

### Knowledge Processing Layer
The system implements a dual-pipeline approach for different types of knowledge:

#### RAG Pipeline
- **Web Crawling**: Playwright-based scraping with HTML5 parsing for content extraction
- **Content Chunking**: Smart markdown chunking with configurable chunk sizes (default 5000 characters)
- **Vector Embeddings**: OpenAI API integration for generating semantic embeddings
- **Semantic Search**: Vector similarity search with optional hybrid search combining keyword and vector approaches

#### Knowledge Graph Pipeline
- **Code Analysis**: Python AST parsing to extract classes, methods, functions, and imports
- **Graph Database Storage**: Neo4j for storing code structure and relationships
- **Hallucination Detection**: Validation of AI-generated code against actual library structure

### Data Storage Strategy
The architecture uses a polyglot persistence approach:
- **Vector Database**: Supabase (PostgreSQL with pgvector) for RAG content and embeddings
- **Graph Database**: Neo4j for code structure and validation
- **In-Memory Storage**: JavaScript Map objects for development/testing scenarios

## External Dependencies

### Cloud Services
- **Supabase**: PostgreSQL-based vector database with pgvector extension for semantic search
- **Neo4j**: Graph database for code structure analysis and hallucination detection
- **OpenAI API**: Embedding generation and LLM interactions
- **Google Generative AI**: Alternative LLM provider support
- **Anthropic**: Claude API integration

### Development Tools
- **Playwright**: Headless browser automation for web scraping and screenshot capture
- **DuckDuckGo Search**: Privacy-focused search engine integration
- **UV Package Manager**: Python dependency management and virtual environment handling

### Framework Dependencies
- **LangGraph Submodule**: Git submodule pointing to official LangGraph repository for ground truth documentation
- **MCP Server Integration**: Model-Context Protocol server (`mcp-crawl4ai-rag`) as a separate submodule providing RAG and graph capabilities
- **Express.js**: Web server framework with security middleware (Helmet, CORS)

### Testing and Quality Assurance
- **PyTest**: Python testing framework with async support
- **VS Code Integration**: Debug configurations and task automation
- **JSON Schema Validation**: Request validation using jsonschema library

The system follows a "grounded AI" approach where all code generation is validated against actual, version-controlled source code rather than potentially outdated training data, ensuring higher reliability and accuracy in AI-generated solutions.