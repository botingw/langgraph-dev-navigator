# Landing Page Plan (V3): LangGraph Dev Navigator

**Guiding Principle:** The landing page must build trust with a technical audience by showcasing the project's rigorous methodology, while strategically presenting information to encourage, rather than discourage, initial engagement. It should apply effective communication principles to achieve the goal of converting interest into action.

**Primary Goal:** Convert user interest into a first action (cloning the repo).
**Primary Action (Conversion):** User clicks "Get Started" and follows the first step.

---

### Page Structure & Content

#### **1. Hero: The Decision Block**
*   **Headline (H1):**
    > **Go from Prompt to Production-Ready LangGraph Code.**
*   **Sub-headline:**
    > `langgraph-dev-navigator` is a framework that grounds your AI assistant in your project's executable truth. Eliminate hallucinations and build with confidence using our RAG and Knowledge Graph-powered workflow.
*   **Call-to-Action (CTA):**
    *   **Primary Button:** `Get Started` (Scrolls to the Quickstart section).
    *   **Secondary Button/Link:** `Star on GitHub`

**Why this way?**
The headline is outcome-oriented ("Production-Ready Code") to sell the benefit, not the feature. The CTA is a direct and encouraging "Get Started," which is a lower-friction, more action-oriented invitation than "View the Method."

---

#### **2. The Pain & The Gain (Visual)**
*   **Headline (H2):**
    > **Tired of Plausible-but-Wrong AI Code?**
*   **Content:** A simple, highly visual two-panel layout.
    *   **Panel 1 ("Before"):** A screenshot of a terminal showing a Python script failing with a `NameError` or `AttributeError`.
    *   **Panel 2 ("After"):** A screenshot of the same script running successfully, perhaps with a "Validation Successful" message from the tool.

**Why this way?**
This "show, don't tell" approach is faster and more impactful than a long story. Developers instantly recognize the pain of a terminal error and the satisfaction of a successful run. The relatable tone ("Tired of...") connects with the user without being confrontational.

---

#### **3. The Methodical Workflow**
*   **Headline (H2):**
    > **How We Ensure Correctness: The `Retrieve -> Generate -> Validate` Workflow**
*   **Content:**
    *   Feature the `images/query_workflow_v2.md` diagram.
    *   Briefly explain the three steps: Retrieve, Generate, and Validate, emphasizing the `check_ai_script_hallucinations` step.

**Why this way?**
This section is the "reason to believe" and the core technical differentiator. It builds credibility by revealing the sound engineering methodology. It is kept because it appeals to the target audience's appreciation for rigor and process, building trust effectively.

---

#### **4. The Philosophy: Metric-Driven Improvement**
*   **Headline (H2):**
    > **An Open-Source Experiment in AI Reliability**
*   **Content:**
    *   Explain that the project treats AI improvement as a science and lists the key metrics (Hallucination Reduction, etc.).

**Why this way?**
This remains a powerful and unique trust signal. It positions the project as a serious, forward-thinking endeavor, which is highly attractive to a sophisticated developer audience and potential contributors. It shows we are committed to measurable results.

---

#### **5. Quickstart: Your First Step**
*   **Headline (H2):**
    > **Get Started in Minutes**
*   **Content:** This section is strategically simplified using the principle of **progressive disclosure** to reduce perceived friction.
    1.  **Step 1: Clone the Repository**
        > `git clone --recursive https://github.com/botingw/langgraph-dev-navigator.git`
        > `cd langgraph-dev-navigator`
    2.  **Step 2: Prepare Configuration**
        > `cd mcp-crawl4ai-rag`
        > `cp .env.example .env`
        > `# Now, add your API keys to the .env file.`
    3.  **Step 3: Build the Knowledge Server**
        > `docker build -t mcp-crawl4ai-rag -f Dockerfile .`
*   **Call-to-Action (CTA):**
    *   **Primary Button:** `View Full Installation Guide` (links to `README.md`).

**Why this way?**
This is a key strategic change. Instead of detailing the entire complex setup, we lower the barrier to entry by showing only the first few, familiar steps. This encourages the user to make a small initial commitment (cloning the repo), making them more likely to follow through with the more complex parts detailed in the full guide.

---

#### **6. FAQ**
*   **Content:** The questions remain, but the answers are re-toned to be more reassuring.
    *   **Q: Is it hard to set up?**
    *   **A:** "We provide a step-by-step guide and a validation script to ensure a smooth setup. The process is similar to configuring any project with database and API dependencies."

**Why this way?**
The answer is still honest but frames the complexity in familiar, manageable terms. This reduces anxiety more effectively than leading with a specific time commitment.
