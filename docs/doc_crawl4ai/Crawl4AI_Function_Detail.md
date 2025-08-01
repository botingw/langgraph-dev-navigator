1. crawl_single_page(ctx, url)


   * Parameters:
       * ctx: The MCP server context, providing access to the AsyncWebCrawler and SupabaseClient instances.
       * url (string): The full URL of the single web page to be crawled.


   * Return Value: A JSON string summarizing the operation, including:
       * success (boolean): true if the crawl and storage were successful, false otherwise.
       * url (string): The URL that was crawled.
       * chunks_stored (number): The number of content chunks stored in Supabase.
       * code_examples_stored (number): The number of code examples extracted and stored (if USE_AGENTIC_RAG is enabled).
       * content_length (number): The total character length of the crawled markdown content.
       * total_word_count (number): The total word count of the crawled content.
       * source_id (string): The domain of the crawled URL (e.g., example.com).
       * links_count (object): An object detailing the count of internal and external links found on the page.
       * error (string, if success is false): A description of the error that occurred.


   * Key Logic/Dependencies:
       * Uses AsyncWebCrawler to fetch the page content.
       * Parses the URL to determine the source_id.
       * Chunks the markdown content using smart_chunk_markdown (default chunk_size 5000 characters).
       * Extracts section information (headers, char/word counts) for each chunk.
       * Supabase Integration: Stores content chunks and their metadata in the crawled_pages table.
       * Source Information: Updates the sources table with a summary and total word count for the source_id.
       * Agentic RAG (`USE_AGENTIC_RAG=true`): If this environment variable is set to true, it will:
           * Extract code blocks from the markdown content using extract_code_blocks.
           * Generate summaries for each code example using generate_code_example_summary (which involves an LLM call, incurring cost and time).
           * Store these code examples and their summaries in a separate code_examples table in Supabase.

  2. smart_crawl_url(ctx, url, max_depth, max_concurrent, chunk_size)


   * Parameters:
       * ctx: The MCP server context.
       * url (string): The starting URL to crawl (can be a regular webpage, sitemap.xml, or a .txt file).
       * max_depth (number, default: 3): For regular webpages, the maximum recursion depth for following internal links.
       * max_concurrent (number, default: 10): Maximum number of concurrent browser sessions for crawling.
       * chunk_size (number, default: 5000): Maximum size of each content chunk in characters.


   * Return Value: A JSON string with a comprehensive crawl summary, including:
       * success (boolean): true if the crawl and storage were successful, false otherwise.
       * url (string): The initial URL provided.
       * crawl_type (string): Indicates the detected crawl strategy (text_file, sitemap, or webpage).
       * pages_crawled (number): The total number of unique pages successfully crawled.
       * chunks_stored (number): The total number of content chunks stored across all crawled pages.
       * code_examples_stored (number): The total number of code examples extracted and stored (if USE_AGENTIC_RAG is enabled).
       * sources_updated (number): The number of unique sources (domains) for which information was updated.
       * urls_crawled (array of strings): A truncated list of URLs that were crawled.
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * URL Type Detection: Uses is_txt(url) and is_sitemap(url) to determine the crawling strategy.
       * Sitemap Parsing: If a sitemap, parse_sitemap(url) extracts all URLs for batch crawling.
       * Recursive Crawling: For regular webpages, crawl_recursive_internal_links is used to follow internal links up to max_depth.
       * Batch Processing: crawl_batch and crawl_recursive_internal_links use AsyncWebCrawler.arun_many with a MemoryAdaptiveDispatcher for efficient parallel crawling.
       * Content Processing: Similar to crawl_single_page, it chunks content, extracts metadata, and updates source information in Supabase.
       * Agentic RAG (`USE_AGENTIC_RAG=true`): If enabled, it extracts, summarizes, and stores code examples from all crawled documents in parallel, similar to crawl_single_page but across multiple pages.

  3. get_available_sources(ctx)

   * Parameters:
       * ctx: The MCP server context, providing access to the SupabaseClient.


   * Return Value: A JSON string listing all available sources:
       * success (boolean): true if the retrieval was successful, false otherwise.
       * sources (array of objects): Each object represents a source and contains:
           * source_id (string): The unique identifier for the source (domain).
           * summary (string): A brief summary of the content from that source.
           * total_words (number): The total word count of content from that source.
           * created_at (timestamp): When the source was first added.
           * updated_at (timestamp): When the source was last updated.
       * count (number): The total number of available sources.
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * Supabase Integration: Directly queries the sources table in Supabase to retrieve all records.
       * Orders results by source_id.
       * No external API calls or complex processing involved beyond database retrieval.

  4. perform_rag_query(ctx, query, source, match_count)


   * Parameters:
       * ctx: The MCP server context, providing access to SupabaseClient and optionally the CrossEncoder model.
       * query (string): The search query or question.
       * source (string, optional): An optional domain to filter search results (e.g., docs.cline.bot).
       * match_count (number, default: 5): The maximum number of relevant results to return.


   * Return Value: A JSON string containing the search results:
       * success (boolean): true if the query was successful, false otherwise.
       * query (string): The original search query.
       * source_filter (string): The source filter applied (if any).
       * search_mode (string): Indicates whether hybrid or vector search was performed.
       * reranking_applied (boolean): true if reranking was applied, false otherwise.
       * results (array of objects): Each object represents a matching document chunk and contains:
           * url (string): The URL of the document.
           * content (string): The text content of the chunk.
           * metadata (object): Additional metadata about the chunk (e.g., headers, chunk index).
           * similarity (number): The semantic similarity score.
           * rerank_score (number, if reranking applied): The score from the cross-encoder model.
       * count (number): The number of results returned.
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * Supabase Integration: Uses search_documents to perform vector similarity search against the crawled_pages table.
       * Hybrid Search (`USE_HYBRID_SEARCH=true`): If enabled, it performs both:
           * Vector search (using Supabase's match_documents function).
           * Keyword search (using SQL ILIKE on the content column).
           * Combines results, prioritizing items found in both, and then adding unique vector and keyword matches.
       * Reranking (`USE_RERANKING=true`): If enabled and a CrossEncoder model is loaded in the lifespan_context, it uses rerank_results to reorder the search results based on a cross-encoder's relevance score. This improves the precision of the
         top results.


  5. search_code_examples(ctx, query, source_id, match_count)


   * Parameters:
       * ctx: The MCP server context.
       * query (string): The search query for code examples.
       * source_id (string, optional): An optional source ID (domain) to filter code examples.
       * match_count (number, default: 5): The maximum number of code examples to return.


   * Return Value: A JSON string containing the code example search results:
       * success (boolean): true if the query was successful, false otherwise.
       * query (string): The original search query.
       * source_filter (string): The source filter applied (if any).
       * search_mode (string): Indicates whether hybrid or vector search was performed.
       * reranking_applied (boolean): true if reranking was applied, false otherwise.
       * results (array of objects): Each object represents a matching code example and contains:
           * url (string): The URL where the code example was found.
           * code (string): The actual code snippet.
           * summary (string): A summary of the code example.
           * metadata (object): Additional metadata.
           * source_id (string): The source domain.
           * similarity (number): The semantic similarity score.
           * rerank_score (number, if reranking applied): The score from the cross-encoder model.
       * count (number): The number of results returned.
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * Prerequisite (`USE_AGENTIC_RAG=true`): This tool is only enabled if USE_AGENTIC_RAG is set to true in the environment variables. If not, it returns an error.
       * Supabase Integration: Uses search_code_examples (from utils.py) to perform vector similarity search against the code_examples table.
       * Hybrid Search (`USE_HYBRID_SEARCH=true`): Similar to perform_rag_query, it performs both vector and keyword search (on both content and summary fields of code examples) and combines the results.
       * Reranking (`USE_RERANKING=true`): Applies reranking using the CrossEncoder model if enabled.

  6. check_ai_script_hallucinations(ctx, script_path)


   * Parameters:
       * ctx: The MCP server context, providing access to the KnowledgeGraphValidator instance.
       * script_path (string): The absolute path to the Python script (.py file) to be analyzed for hallucinations.


   * Return Value: A JSON string detailing the hallucination detection results:
       * success (boolean): true if the analysis was successful, false otherwise.
       * script_path (string): The path to the analyzed script.
       * overall_confidence (number): An aggregated confidence score for the script's validity.
       * validation_summary (object): Statistics on total, valid, invalid, uncertain, and not-found validations, and a calculated hallucination rate.
       * hallucinations_detected (array of objects): A list of specific issues found (e.g., unknown imports, invalid method calls), including confidence scores and recommendations.
       * recommendations (array of strings): General recommendations based on the analysis.
       * analysis_metadata (object): Counts of imports, classes, methods, attributes, and functions found in the script.
       * libraries_analyzed (array of strings): List of libraries whose imports were analyzed.
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * Prerequisite (`USE_KNOWLEDGE_GRAPH=true`): This tool is only enabled if USE_KNOWLEDGE_GRAPH is set to true.
       * Neo4j Integration: Relies on a connected KnowledgeGraphValidator instance, which in turn connects to Neo4j.
       * Script Validation: validate_script_path ensures the provided path is valid and points to a readable Python file.
       * AST Analysis: Uses AIScriptAnalyzer to parse the Python script's Abstract Syntax Tree (AST) and extract its structural components (imports, class definitions, function calls, etc.).
       * Knowledge Graph Validation: The KnowledgeGraphValidator compares the extracted script components against the data in the Neo4j knowledge graph to identify inconsistencies (hallucinations). This includes:
           * Validating imports against known repositories.
           * Validating method calls on classes.
           * Validating class instantiation parameters.
           * Validating function call parameters.
           * Validating attribute access.
       * Reporting: HallucinationReporter generates a structured and comprehensive report from the validation results.

  7. query_knowledge_graph(ctx, command)


   * Parameters:
       * ctx: The MCP server context, providing access to the DirectNeo4jExtractor (which holds the Neo4j driver).
       * command (string): A command string to execute against the knowledge graph (e.g., repos, explore <repo_name>, class <class_name>, query <cypher_query>).


   * Return Value: A JSON string containing the results of the knowledge graph query:
       * success (boolean): true if the command was successful, false otherwise.
       * command (string): The original command executed.
       * data (object): The specific data returned based on the command (e.g., list of repositories, class details, method details, custom query results).
       * metadata (object): Information about the results, such as total_results and limited (indicating if results were truncated).
       * error (string, if success is false): A description of the error (e.g., unknown command, repository not found, Cypher query error).


   * Key Logic/Dependencies:
       * Prerequisite (`USE_KNOWLEDGE_GRAPH=true`): This tool is only enabled if USE_KNOWLEDGE_GRAPH is set to true.
       * Neo4j Integration: Requires a connected DirectNeo4jExtractor instance, which provides the Neo4j driver for executing Cypher queries.
       * Command Parsing: Parses the input command string to determine the action to perform.
       * Internal Handlers: Routes the command to specific asynchronous helper functions (_handle_repos_command, _handle_explore_command, etc.) that construct and execute appropriate Cypher queries against the Neo4j database.
       * Result Limiting: Custom Cypher queries are limited to 20 records to prevent overwhelming responses.

  8. parse_github_repository(ctx, repo_url)


   * Parameters:
       * ctx: The MCP server context, providing access to the DirectNeo4jExtractor instance.
       * repo_url (string): The full GitHub repository URL (must end with .git, e.g., https://github.com/user/repo.git).


   * Return Value: A JSON string summarizing the parsing operation:
       * success (boolean): true if parsing was successful, false otherwise.
       * repo_url (string): The URL of the repository that was parsed.
       * repo_name (string): The extracted name of the repository.
       * message (string): A confirmation message.
       * statistics (object): Detailed counts of files, classes, methods, functions, and attributes created in the knowledge graph, along with sample module names.
       * ready_for_validation (boolean): Always true if successful, indicating the repository can now be used for hallucination detection.
       * next_steps (array of strings): Suggestions for subsequent actions (e.g., using check_ai_script_hallucinations).
       * error (string, if success is false): A description of the error.


   * Key Logic/Dependencies:
       * Prerequisite (`USE_KNOWLEDGE_GRAPH=true`): This tool is only enabled if USE_KNOWLEDGE_GRAPH is set to true.
       * Neo4j Integration: Relies on a connected DirectNeo4jExtractor instance.
       * URL Validation: validate_github_url ensures the provided URL is a valid GitHub repository URL.
       * Repository Analysis: The repo_extractor.analyze_repository(repo_url) method performs the core logic:
           * Clones the GitHub repository to a temporary location.
           * Analyzes Python files within the cloned repository using AST.
           * Extracts code structure (classes, methods, functions, imports).
           * Stores this extracted structure as nodes and relationships in the Neo4j knowledge graph.
       * Statistics Retrieval: After parsing, it queries Neo4j to gather and return comprehensive statistics about the newly added repository data.