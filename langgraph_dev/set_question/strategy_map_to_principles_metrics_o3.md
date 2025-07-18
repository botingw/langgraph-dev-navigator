### 0  Mental model we’re aligning

* **Guidelines** (design principles) drive what “good” test cases look like.
  – Ground‑truth tests, minimal leakage, deterministic replay, etc.
* **Strategies** are concrete ways to *produce* those cases (commit mining, mutation, fuzzing…).
* **Metrics** tell us whether the dataset + harness actually reveal improvements (pass‑rate, retrieval‑recall, token efficiency…).

The map below shows which strategy best fulfils which guideline **and** which metric it empowers—so you can pick and blend techniques with intent, not guesswork.

---

## 1  Mapping grid: Strategy → Guideline / Metric

| Strategy (from §3)               | Directly enforces which *guidelines*?                                                                           | Which *metrics* does it illuminate & why?                                                                           | Sub‑principle rationale                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Commit‑history mining**     | • Ground‑truth ≙ green tests  <br>• Minimal context leakage (pre‑fix snapshot)                                  | *Task pass‑rate* (real bugs) <br>*Time‑to‑first‑green* (reflects genuine dev pain)                                  | Real bug+fix pairs create “authentic signal”; they naturally satisfy Principle 1 because the *fix commit* is literally the ground truth. |
| **B. Issue‑tracker synthesis**   | • Multi‑source reasoning pressure (issues often cite docs, logs) <br>• Difficulty ladder (rank by issue labels) | *Tool‑utilisation rate* (agent must search docs/ref) <br>*Context‑retrieval relevance* (because spec in issue text) | Forces agent to bridge *natural‑language complaint → code region* = perfect test of RAG/GraphRAG.                                        |
| **C. Spec‑vs‑impl gap tests**    | • Multi‑source reasoning <br>• Bias & safety (spec often contains security contract)                            | *Coverage uplift* (patch often adds new checks) <br>*Retrieval recall* (needs doc lookup)                           | Validates whether LLM aligns code to spec—core promise of doc‑aware agents.                                                              |
| **D. Mutation‑testing smokes**   | • Deterministic replay <br>• Difficulty ladder (tunable)                                                        | *Code‑diff entropy* (should be *small*; over‑patch ⇒ high entropy) <br>*Token efficiency*                           | Controlled faults isolate “repair” skill without noisy real‑world confounders.                                                           |
| **E. Property‑based fuzz seeds** | • Version drift tests (edge cases evolve) <br>• Observability hooks (record failing seed)                       | *Task pass‑rate* on deep logic bugs <br>*Time‑to‑green*                                                             | Surfacing rare paths ensures dataset isn’t skewed to superficial fixes; good for measuring reasoning depth.                              |
| **F. API‑evolution tasks**       | • Version drift tests <br>• Minimal leakage (old snapshot)                                                      | *Tool‑utilisation* (needs docs) <br>*Pass‑rate* under new API                                                       | Emulates real upgrade work; highlights whether RAG can surface deprecation notes quickly.                                                |

> *Notice*: every strategy lands on **at least one guideline** *and* feeds **≥1 metric**. That alignment is what keeps the benchmark tight and interpretable.

---

## 2  First‑principles deep‑dive on each mapping

1. **Executable truth at the centre**
   *Why commit‑history mining shines*: it automatically provides a *binary* oracle (pytest red → green). Metrics like pass‑rate or diff‑entropy are *trustworthy* only when oracle quality is high.

2. **Information‑economy principle**
   Guideline “Minimal context leakage” can be violated by naïve prompts. Strategies A & F naturally uphold it—because they start from a *pre‑fix snapshot*; you simply trim any diff hunks containing the golden patch.

3. **Pressure‑testing retrieval**
   The RAG/GraphRAG claim is “I can grab the right chunk from docs/issues.” Strategies B, C, and F all embed *human‑language artefacts* (issue text, docstring) apart from code. That means **Context‑retrieval relevance** becomes measurable: did the agent actually pull the sentences that the original human maintainer used?

4. **Difficulty is not size but *bridging distance***
   – Mutation smoke (D) may be one‑line edits, yet can be hard if the mutated line sits five layers deep.
   – Issue‑tracker tasks (B) might span multiple files but are easy if the issue already points to a single function.
   ⇒ The ladder should encode *cognitive hops*, not LoC.

5. **Why observability hooks matter**
   Without traces, you can’t know *why* pass‑rate changed. For GraphRAG specifically, capturing the node‑transition log lets you later correlate *tool path taken* ↔ *success*. That feeds *Tool‑utilisation rate* and can surface unused yet expensive subgraphs.

---

## 3  Concrete example: “Can an LLM + GraphRAG develop LangGraph agents better?”

### 3.1 Scope & repo snapshot

*Target repo*: `langgraph` examples directory at commit `abc123`.
*Tools exposed to LLM*:

1. **GraphRAG `search_tool`** (retrieves LangGraph doc pages & typed‑API stubs).
2. **Filesystem read‑only** (to open local code).
3. **Terminal runner** (executes `pytest`).

### 3.2 Sample task (Strategy mix: A + C + F)

| Item                        | Content                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task id**                 | `langgraph_loop_agent_001`                                                                                                                                                                     |
| **Prompt**                  | “The example `agent_loop.py` crashes with `GraphExecutionError: no conditional edge found for 'tool'`. Fix the implementation so that the agent loops correctly when `search_tool` is chosen.” |
| **Provided context**        | • Traceback log <br>• Failing test `tests/test_loop_agent.py` (red)                                                                                                                            |
| **Hidden oracle**           | Patch of \~15 LoC adding conditional edge + docstring update.                                                                                                                                  |
| **Guideline coverage**      | Ground‑truth ✓ – failing test; Multi‑source ✓ – needs docs page on **conditional edges**; Version‑drift ✓ – API changed two weeks ago.                                                         |
| **Expected metrics impact** | • Pass‑rate assesses raw success <br>• Retrieval recall should be high for doc section “Conditional Edges” <br>• Diff‑entropy small (surgical patch).                                          |

### 3.3 How strategies map here

| Strategy used             | Manifestation in task                                                         | Guideline served       | Metric affected       |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------- | --------------------- |
| Commit‑history mining (A) | Patch is real commit `fix-loop-edges`                                         | Ground‑truth           | Pass‑rate             |
| Spec‑v‑impl gap (C)       | Docstring says “agent *must* loop until it decides ‘answer’” but code doesn’t | Multi‑source reasoning | Retrieval recall      |
| API‑evolution (F)         | Conditional‑edge API changed in v0.0.38 → old code breaks                     | Version drift          | Tool‑utilisation rate |

### 3.4 Evaluation flow

1. **Harness** mounts repo snapshot, runs failing test – confirms red.
2. LLM+GraphRAG gets prompt, decides whether to call `search_tool`.
3. Trace logs `tool_calls=[docs/conditional_edges.md]`.
4. LLM patches `agent_loop.py`, runner re‑executes `pytest`.
5. Metrics recorded:

   * Passed? ✔️
   * **Tool‑utilisation** = 1 (used search\_tool)
   * **Retrieval recall** = 0.67 (2 of 3 oracle lines retrieved)
   * **Time‑to‑green** = 74 s
   * **Diff‑entropy** = 28 chars.

> Observation: if a *baseline GPT‑4 w/o tools* also passes but retrieval recall = 0, you learn the doc lookup wasn’t essential—good feedback for dataset refinement.

---

## 4  Checklist to keep dataset aligned as it grows

| Stage                          | First‑principles check                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **New task ingestion**         | Does it add a *new reasoning hop* or cover an API area <80 % covered?                      |
| **Metric review each release** | Are any metrics saturated (>95 % for strongest baseline)? Add harder tasks or new metrics. |
| **Tool trace sampling**        | Do traces show *dead sub‑graphs* (nodes never visited)? Prune or rewrite prompts.          |
| **Safety audit**               | Run sec‑linter on patches; include “trap” tasks where correct patch ≠ quick insecure fix.  |

---

### Take‑away

By **explicitly mapping** each task‑generation *strategy* to the *guideline* it enforces and the *metric* it informs, you:

1. **Guarantee coverage** – every principle is backed by concrete data.
2. **Make metrics actionable** – when *Context‑retrieval relevance* drops you know which strategy (B, C, F) to revisit.
3. **Keep the benchmark honest** – avoiding bloated test sets that measure the wrong thing.

Apply the grid, iterate with telemetry, and you’ll end up with a lean, high‑signal benchmark that truly tells you whether LLM + RAG/GraphRAG is *better software at building LangGraph (or any) applications*, not just “passing tests by luck.”
