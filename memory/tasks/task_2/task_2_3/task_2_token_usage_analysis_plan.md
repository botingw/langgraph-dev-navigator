# Plan: Token Usage Analysis and Debugging

**Objective:** To diagnose and resolve the root cause of the observed 100x token consumption and associated slowness during the documentation ingestion process.

**Context:** The primary suspect for the excessive token usage is the summarization of documentation chunks, which is performed by a chat model. Initial observations from the OpenAI dashboard show a discrepancy between the expected and actual number of tokens consumed. This plan outlines a data-driven approach to pinpoint the source of this amplification.

### Initial Findings on Token Amplification (as of 2025-07-12):
Through preliminary analysis, two significant factors contributing to the high token consumption have been identified:
1.  **Inclusion of `.ipynb` files:** The initial token counting focused primarily on `.md` files. However, the ingestion process also includes `.ipynb` (Jupyter Notebook) files. These files, due to their JSON structure and embedded code/output, contribute approximately 10 times more tokens than equivalent `.md` files.
2.  **Prompt Engineering Overhead:** The prompt sent to the OpenAI API for contextual embedding (and potentially other chat-based operations) includes not only the specific chunk being processed but also a truncated version of the `full_document`, a system prompt, and user prompt descriptions. This means that for a document split into `n` chunks, the total token consumption for contextual embeddings can be approximated as `n * (tokens_in_chunk + tokens_in_full_document_context + tokens_in_system_prompt + tokens_in_user_instructions)`. This significantly amplifies the token usage compared to just the raw chunk tokens.

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
            *   `total_prompt_tokens_sent`: The total number of input tokens sent to the API.
            *   `total_completion_tokens_received`: The total number of output tokens received from the API.
            *   `total_billed_tokens`: The sum of prompt + completion tokens.
            *   Breakdown of calls and tokens by type (e.g., `chunk_summary`, `source_summary`, `embedding`).
        *   **Per-Source Statistics (grouped by `source_id`):**
            *   This tracks metrics for API calls that operate on an entire data source, such as generating a summary for a whole website.
            *   For each source, the following is collected: the same as Per-Chunk Statistics below
        *   **Per-Chunk Statistics (grouped by file, then by chunk index):**
            *   This tracks metrics for API calls that operate on individual chunks of a document, such as generating contextual embeddings.
            *   For each chunk, the following is collected:
                *   `raw_chunk_tokens`: The token count of the original, unprocessed documentation chunk.
                *   `total_api_calls`: The total number of API calls made for this chunk.
                *   `successful_calls`: The number of successful calls.
                *   `failed_calls`: The number of failed calls.
                *   `total_prompt_tokens_sent`: The sum of all input tokens sent for this chunk.
                *   `total_completion_tokens_received`: The sum of all output tokens received for this chunk.
                *   `total_billed_tokens`: The sum of prompt + completion tokens for this chunk.
                *   `call_details`: A list of individual calls made for the chunk, each with:
                    *   `call_type`: (e.g., `chunk_summary`, `create_embedding`).
                    *   `prompt_tokens`: The input token count for that specific call.
                    *   `completion_tokens`: The output token count for that specific call.
                    *   `total_tokens`: The billed token count for that specific call.
                    *   `status`: `Success` or `Fail`.
                    *   `error_details` (optional): Any error messages if the request failed.

3.  **Integrate Stats Collection into API Call Sites:**
    *   Modify the utility functions in `src/utils_botingw.py` that wrap OpenAI API calls.
    *   Before each API call, calculate the required token counts (`raw_chunk_tokens`, `prompt_tokens`) and log all per-request details to the `StatsCollector` using the appropriate logging method (`log_chunk_api_call` or `log_source_api_call`).

4.  **Execute and Analyze:**
    *   Run the ingestion script (`test_build_langgraph_docs_knowledge.py`) on a small repository.
    *   At the end of the run, generate a comprehensive JSON report from the `StatsCollector`.
    *   **Analysis:** Compare the `total_tokens_from_raw_docs` with the `total_prompt_tokens_sent`. The detailed per-source and per-chunk logs will be used to identify exactly where and why token amplification is occurring.

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