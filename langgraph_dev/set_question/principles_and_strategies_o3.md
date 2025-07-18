Below is a **first‑principles playbook** you can adapt to turn *any* Python package (or full framework) into a SWE‑bench‑style benchmark that measures how well an LLM—augmented with RAG, GraphRAG, or other tooling—can **understand, modify, and use that codebase**.

---

## 1  Why “first principles” matter

| Foundational question                        | First‑principles answer                                                                                                                         | Implication for benchmark design                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What capability am I really testing?**     | The agent’s ability to *close the loop* from understanding docs + code → locating the right fix or usage pattern → writing runnable code/tests. | Each test should require **multi‑hop reasoning** across *at least two* of these knowledge sources (e.g., implementation & docs, or error log & type stubs). |
| **How do I know the agent succeeded?**       | Executable truth: *code compiles, tests pass, behaviour matches spec*.                                                                          | Oracles should be **automated tests** (unit, integration, property) that fail before the patch/solution and pass afterwards.                                |
| **What makes a dataset valuable over time?** | Signal‑to‑noise > size. New tests should surface *previously invisible* failure modes.                                                          | Curate fewer but **widely‑covering** tasks; track API‑surface and CFG coverage.                                                                             |

---

## 2  Core principles for your test‑case inventory

1. **Ground‑truth ≙ green tests**
   *Every* task must ship with a failing test that goes green only if the agent’s patch or snippet is correct.

2. **Minimal context leakage**
   Freeze the repo at commit `X`. Prompt with *diff* or *test failure log*—never the ground‑truth patch.

3. **Multi‑source reasoning pressure**
   Design tasks that *force* the agent to pull from code, changelogs, examples, and docs (perfect for RAG/GraphRAG).

4. **Deterministic replay**
   ● Pin all deps & random seeds · ● Ban network calls in CI · ● Store fixtures in‑repo or alongside.

5. **Difficulty ladder**
   Include:
   *Level 1* one‑line patch • *Level 2* type mismatch across modules • *Level 3* algorithmic bug needing >1 file edit.

6. **Observability hooks**
   Record: tool‑invocation trace, interim thoughts, retrieved passages. Expose these in evaluation logs to debug model/tool interplay.

7. **Version drift tests**
   Freeze a “baseline” version; then add tasks that require updating to a **newer API**. Measures doc‑lookup + refactor skills.

8. **Bias & safety**
   Ensure no tasks leak secrets or incentivise insecure fixes; include a few “trap” tests that reject unsafe patches (e.g., disabling SSL verification).

---

## 3  Strategies to *generate* high‑quality tasks

| Strategy                            | What you mine / craft                                                                                       | Why it’s useful                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Commit‑history mining**           | `<bug‑introducing‑commit, fixing‑commit>` pairs → auto‑extract failing test or CI signal                    | Real‑world bugs, naturally diverse       |
| **Issue‑tracker → patch synthesis** | Closed issues whose title/body ⇢ failing scenario; generate or recover reproducer test                      | Captures “user pain” cases               |
| **Spec‑to‑implementation gaps**     | Compare docstrings / docs to runtime behaviour; create assertion that current code violates stated contract | Stresses doc‑alignment + RAG             |
| **Mutation‑testing smokes**         | Introduce controlled mutations (e.g., off‑by‑one) and auto‑generate failing test                            | Infinite supply; tunable difficulty      |
| **Property‑based fuzz**             | Use Hypothesis to discover edge cases; freeze failing seed as test                                          | Often finds deep logic errors            |
| **API‑evolution tasks**             | Checkout *old* version, write usage that works only on *new* version; agent must port                       | Tests understanding of deprecation notes |

---

## 4  Dataset format & tooling pipeline

```text
task_id/
│
├── prompt.md            # Natural‑language instructions + failure log
├── repo_patch_target/   # Snapshot of repo *before* fix
├── tests/               # One or more failing tests
└── oracle/              # ground_truth.patch and logs (hidden at eval time)
```

* Harness runner = pytest + coverage + timing hooks.
* Expose a simple **JSONL interface**:

```json
{ "task_id": "pandas_1234_read_csv_bug",
  "instructions": "...",
  "entry_point": "fix.py",        # agent writes here
  "score_method": "pytest" }
```

---

## 5  Metric suite (aligning to principles)

| Metric                          | How to compute                                                    | Insight                           |
| ------------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| **Task Pass‑rate**              | % tests → green                                                   | Overall correctness               |
| **Tool‑utilisation rate**       | fraction of successful runs that call your `search_tool`/RAG path | Are tools *needed* & *used*       |
| **Time‑to‑first‑green**         | runtime seconds until tests pass                                  | Efficiency & latency              |
| **Code‑diff entropy**           | Levenshtein between agent patch & oracle                          | Measures over‑ or under‑patching  |
| **Context‑retrieval relevance** | Recall\@k of oracle lines in retrieved docs                       | Quality of RAG retrieval          |
| **Token‑efficiency**            | tokens / green test                                               | Economic metric for prod workload |
| **Coverage uplift**             | Δ branch / line coverage after agent patch                        | Ensures patch isn’t dead code     |

> **Tip:** Log **decision traces** (e.g., GraphRAG node → next) and correlate them with success/failure to refine your agent’s routing logic.

---

## 6  Putting it together – a quick build roadmap

1. **Scaffold repo snapshot** at commit `X`, freeze in Dockerfile (`FROM python:3.11‑slim`, install deps).
2. **Auto‑mine candidates**: run a diff‑scanner script over git history; filter for commits touching target package path.
3. **Generate failing tests** with `pytest-regressions` or by replaying failing CI logs.
4. **Hand‑curate** 20–50 tasks for pilot; tag with metadata (API area, difficulty, bug type).
5. **Write harness**: takes model response patch or code snippet → applies → `pytest -q`. Emit JSON result.
6. **Run baselines**: • GPT‑4 (w/o tools) • GPT‑4 + RAG • GPT‑4 + GraphRAG loop → establish ceiling & headroom.
7. **Iterate**: Analyse failure clusters, add new tasks focusing on uncovered APIs or reasoning gaps.

---

### Recap

Designing an **SWE‑bench‑style benchmark for a single Python package** boils down to:

* Anchoring every task in **executable ground truth**.
* Ensuring each requires **multi‑modal reasoning** that exercises the very tools (RAG, GraphRAG, context windows) you’re trying to evaluate.
* Recording rich telemetry so you can improve both dataset and agent over time.

Follow the principles and strategies above and you’ll build a *compact, high‑signal*, future‑proof evaluation suite that tells you **exactly** when your LLM‑plus‑tools stack is truly getting better at working with that package.
