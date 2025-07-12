# Plan: Token Usage Analysis and Debugging

**Objective:** To diagnose and resolve the root cause of the observed 100x token consumption and associated slowness during the documentation ingestion process.

**Context:** The primary suspect for the excessive token usage is the summarization of documentation chunks, which is performed by a chat model. Initial observations from the OpenAI dashboard show a discrepancy between the expected and actual number of tokens consumed. This plan outlines a data-driven approach to pinpoint the source of this amplification.

---

## Phase 1: High-Granularity Data Collection (Small-Scale)

The first step is to collect detailed, fine-grained data from an ingestion run on a small, controlled repository. This will allow for a precise analysis without incurring significant costs.

1.  **Create a Central `StatsCollector` Class:**
    *   Implement a simple, globally accessible `StatsCollector` class.
    *   This class will be responsible for tracking and aggregating statistics throughout a single ingestion run. It will be initialized at the beginning of the `ingest_repository` function.

2.  **Define Statistics to be Collected:**
    *   The `StatsCollector` will track metrics with high granularity:
        *   **Aggregated Stats:**
            *   `total_api_calls_initiated`
            *   `total_successful_calls`
            *   `total_failed_calls`
            *   `total_tokens_from_raw_docs` (sum of tokens from all initial chunks)
            *   `total_tokens_sent_to_chat_model` (sum of tokens in the final prompts for summarization)
            *   Breakdown of calls and tokens by type (e.g., `summary`, `embedding`).
        *   **Per-Chunk Statistics (grouped by file, then by chunk index):**
            *   This provides a `GROUP BY`-style view of the process, aggregating all API call statistics for a single chunk of a document.
            *   For each chunk, the following stats will be collected:
                *   `raw_chunk_tokens`: The token count of the original, unprocessed documentation chunk.
                *   `total_api_calls`: The total number of API calls made for this chunk.
                *   `successful_calls`: The number of successful calls.
                *   `failed_calls`: The number of failed calls.
                *   `total_tokens_sent_to_apis`: The sum of all tokens sent across all API calls for this chunk.
                *   `call_details`: A list of individual calls made for the chunk, each with:
                    *   `call_type`: (e.g., `chat_summary`, `create_embedding`).
                    *   `prompt_tokens`: The token count for that specific call.
                    *   `status`: `Success` or `Fail`.
                    *   `error_details` (optional): Any error messages if the request failed.

3.  **Integrate Stats Collection into API Call Sites:**
    *   Modify the utility functions in `src/utils_botingw.py` that wrap OpenAI API calls.
    *   Before each API call, calculate the required token counts (`raw_chunk_tokens`, `prompt_tokens`) and log all per-request details to the `StatsCollector`.

4.  **Execute and Analyze:**
    *   Run the ingestion script (`test_build_langgraph_docs_knowledge.py`) on a small repository.
    *   At the end of the run, generate a comprehensive JSON report from the `StatsCollector`.
    *   **Analysis:** Compare the `total_tokens_from_raw_docs` with the `total_tokens_sent_to_chat_model`. The detailed per-request log will be used to identify exactly where and why token amplification is occurring.

---

## Phase 2: Large-Scale Analysis with Dry Run (Contingency)

This phase will only be initiated if the small-scale analysis in Phase 1 is inconclusive. The `DRY_RUN` mode allows us to simulate a full ingestion on a large repository to understand scaling effects without making any actual API calls.

1.  **Introduce `DRY_RUN` Mode:**
    *   Add a `DRY_RUN` environment variable.
    *   When `DRY_RUN` is `"true"`, the system will perform all steps, including `StatsCollector` logging, but will skip the final API call.
    *   The API call sites will be mocked to return a successful response, allowing the workflow to complete.

2.  **Execute and Analyze:**
    *   With `DRY_RUN="true"`, execute the ingestion script on a large repository.
    *   The `StatsCollector` will generate a report detailing every potential API call that *would* have been made.
    *   **Analysis:** This data will provide insight into how the number of requests and total calculated tokens scale with repository size, which may reveal issues not apparent in the small-scale test.