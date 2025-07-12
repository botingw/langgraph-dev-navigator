# Task 2 Sub-Task: Token Usage Analysis and Debugging Plan

This plan outlines a data-driven approach to diagnose the root cause of the 100x token consumption discrepancy and extreme slowness during the knowledge base ingestion process.

## Phase 1: Implement a Statistics-Gathering and "Dry Run" Framework

The core objective is to gather precise metrics on all potential API calls without actually consuming tokens.

1.  **Introduce `DRY_RUN` Mode:**
    *   Add a `DRY_RUN` environment variable to the `mcp-crawl4ai-rag/.env` file.
    *   When `DRY_RUN` is set to `"true"`, the system will perform all calculations, logging, and data preparation steps but will skip the final OpenAI API call.
    *   The API call sites will be mocked to return a successful response, allowing the ingestion process to complete its full workflow.

2.  **Create a Central `StatsCollector` Class:**
    *   Implement a new, simple singleton or globally accessible class named `StatsCollector`.
    *   This class will be responsible for tracking and aggregating statistics throughout the entire ingestion run.
    *   It will be initialized once at the beginning of the `ingest_repository` function.

3.  **Define Statistics to be Collected:**
    *   The `StatsCollector` will track metrics at two levels:
        *   **Aggregated Stats:**
            *   `total_api_calls_initiated`
            *   `total_successful_calls` (simulated)
            *   `total_input_tokens_calculated`
            *   `total_estimated_output_tokens`
            *   A breakdown of calls and tokens by `call_type`.
        *   **Per-Request Log (a list of dictionaries):**
            *   `call_type`: A string identifying the purpose of the call (e.g., `contextual_embedding`, `code_summary`, `create_embedding`).
            *   `source_file`: The relative path to the documentation file or code file being processed.
            *   `chunk_index` or `block_index`: The specific index of the content piece within the file.
            *   `input_tokens`: The exact number of tokens calculated for the request payload.
            *   `status`: A string, e.g., "Success (Dry Run)".

4.  **Integrate Stats Collection into API Call Sites:**
    *   Modify the key functions in `src/utils_botingw.py` that wrap OpenAI API calls: `generate_contextual_embedding`, `create_embeddings_batch`, and `generate_code_example_summary`.
    *   Inside each of these functions, right before the API call is made:
        a.  Calculate the exact number of input tokens for the request.
        b.  Call a method on the `StatsCollector` instance to log all the "Per-Request" details.
        c.  Check if `DRY_RUN` is true. If so, bypass the actual API call and return a mock success response.

## Phase 2: Execute and Analyze

1.  **Enable Dry Run:** Set `DRY_RUN="true"` in the `.env` file.
2.  **Execute Ingestion:** Run the `test_build_langgraph_docs_knowledge.py` script.
3.  **Generate Final Report:**
    *   Modify the `test_build_langgraph_docs_knowledge.py` script to retrieve the final statistics from the `StatsCollector` at the end of the run.
    *   Print a comprehensive, well-formatted JSON report to the console containing both the aggregated stats and the detailed per-request log.

This data-driven approach will provide the necessary evidence to pinpoint the exact source of the token amplification and guide the next steps for optimization.
