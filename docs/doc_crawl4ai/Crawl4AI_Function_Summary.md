   1. `crawl_single_page(ctx, url)`:
       * Purpose: Crawls a single web page at the given URL, extracts its content, and stores it in the Supabase vector database. It's designed for quick retrieval of content from a specific URL without following links. If USE_AGENTIC_RAG is
         enabled, it also extracts and processes code examples from the page.


   2. `smart_crawl_url(ctx, url, max_depth, max_concurrent, chunk_size)`:
       * Purpose: Intelligently crawls a URL by detecting its type (sitemap, text file, or regular webpage). For sitemaps, it extracts and crawls all URLs in parallel. For text files, it directly retrieves content. For regular webpages, it
         recursively crawls internal links up to a specified depth. All crawled content is chunked and stored in Supabase. If USE_AGENTIC_RAG is enabled, it also extracts and processes code examples from all crawled documents.


   3. `get_available_sources(ctx)`:
       * Purpose: Retrieves and lists all unique sources (domains) that have been crawled and stored in the Supabase database. It provides details such as source ID, summary, total word count, and creation/update timestamps. This tool is crucial
         for identifying available content for subsequent queries.


   4. `perform_rag_query(ctx, query, source, match_count)`:
       * Purpose: Performs a Retrieval Augmented Generation (RAG) query on the stored content in Supabase. It searches the vector database for content relevant to the given query, optionally filtering by a specific source domain. It supports both
         standard vector search and hybrid search (combining vector and keyword search) if USE_HYBRID_SEARCH is enabled. Results can also be reranked if USE_RERANKING is enabled.


   5. `search_code_examples(ctx, query, source_id, match_count)`:
       * Purpose: Specifically searches for code examples relevant to the query within the Supabase vector database. It returns matching code examples along with their summaries. This tool requires USE_AGENTIC_RAG to be enabled. Similar to
         perform_rag_query, it supports optional source filtering, hybrid search, and reranking.


   6. `check_ai_script_hallucinations(ctx, script_path)`:
       * Purpose: Analyzes an AI-generated Python script for potential hallucinations by validating its imports, method calls, class instantiations, and function calls against a Neo4j knowledge graph. This tool requires USE_KNOWLEDGE_GRAPH to be
         enabled and a configured Neo4j instance. It provides a comprehensive report on detected hallucinations, confidence scores, and recommendations.


   7. `query_knowledge_graph(ctx, command)`:
       * Purpose: Allows direct querying and exploration of the Neo4j knowledge graph. It supports various commands to list repositories, explore repository details, list classes, get class information (including methods and attributes), search
         for methods, and execute custom Cypher queries. This tool also requires USE_KNOWLEDGE_GRAPH to be enabled.


   8. `parse_github_repository(ctx, repo_url)`:
       * Purpose: Clones a GitHub repository, analyzes its Python files, and stores the code structure (classes, methods, functions, imports) in the Neo4j knowledge graph. This tool is used to populate the knowledge graph with real repository
         data for hallucination detection and code validation. It requires USE_KNOWLEDGE_GRAPH to be enabled.