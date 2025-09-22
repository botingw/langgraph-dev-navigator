# Landing Page Plan (V4): The Two-Stage Funnel

**Guiding Principle:** This plan implements a two-stage funnel based on the strategy developed in `landing_page_discuss_with_gemini.md`. The first stage (Landing Page) is a lean marketing page designed to maximize email conversions for a waitlist. The second stage (Thank You Page) is a dedicated market research tool to gather detailed insights on future product direction.

--- 

### **Stage 1: The Landing Page (The Hook)**

**Goal:** Convince visitors of the core value proposition and convert them into waitlist members with minimal friction.

#### **1. Hero: The Decision Block**
*   **Headline (H1):**
    > **Stop Fighting AI Hallucinations.**
*   **Sub-headline:**
    > `langgraph-dev-navigator` is a framework that grounds your AI assistant in executable truth. Get reliable, production-ready code for your specific version of LangGraph.
*   **Call-to-Action (CTA):**
    *   **Primary Element:** An email input field with a single button: `Join the Waitlist`.

**Why this way?**
The headline is sharp and problem-focused. The primary CTA is the conversion action itself (email capture), removing intermediate clicks and maximizing conversion efficiency as per the `Landing_Page_Guide.md`.

---

#### **2. The Pain & The Gain (Visual)**
*   **Headline (H2):**
    > **Tired of Plausible-but-Wrong AI Code?**
*   **Content:** A simple, visual two-panel layout showing a terminal "Before" (error) and "After" (success).

**Why this way?**
This is a fast, visceral "show, don't tell" demonstration of the product's benefit. It communicates the core value proposition more effectively than text alone.

---

#### **3. The Methodical Workflow**
*   **Headline (H2):**
    > **How We Ensure Correctness: The `Retrieve -> Generate -> Validate` Workflow**
*   **Content:** The diagram from `images/query_workflow_v2.md` and a three-step explanation.

**Why this way?**
This is the core "reason to believe." It provides the technical substance that builds credibility and justifies the user's decision to sign up for the waitlist.

---

#### **4. The Philosophy: Metric-Driven Improvement**
*   **Headline (H2):**
    > **An Open-Source Experiment in AI Reliability**
*   **Content:** An explanation of the project's metric-driven approach.

**Why this way?**
This unique philosophy is a powerful trust signal that differentiates the project and attracts a high-quality audience interested in the project's long-term vision.

---

#### **5. FAQ**
*   **Content:** The questions are updated to reflect the new "waitlist" context.
    *   **Q: What happens when I join the waitlist?** (A: You'll be first in line to get access and will receive occasional updates on our progress.)
    *   **Q: Is this a free tool?** (A: The framework is open-source. You are responsible for your own API costs for services like OpenAI.)
    *   **Q: What is the current status?** (A: The core validation engine is built. We are working towards a public release.)

**Why this way?**
The FAQ is now aligned with the goal of email capture. It answers the most pressing questions a user would have before providing their email address, reducing anxiety and friction.

---

### **Stage 2: The "Thank You & Survey" Page (The Insight Engine)**

**Goal:** After the user's email is captured, redirect them here to gather deep, actionable data on what features they value most.

*   **Headline:**
    > **Thanks for joining! Now, help us build your perfect AI assistant.**
*   **Sub-headline:**
    > You're on the list! To ensure we prioritize what matters most, please select all the features you'd be most excited to use.
*   **The Multi-Select Feature Survey:**
    A form with the following options, categorized as discussed in `landing_page_discuss_with_gemini.md`:

    **Core Development Experience**
    *   [ ] Automated Debugging & Fixes
    *   [ ] AI-Powered Test Generation

    **Platform & Deployment**
    *   [ ] **Cloud-Hosted Knowledge Server** (No self-hosting of Neo4j/Supabase)
    *   [ ] One-Click Agent Publishing

    **Advanced Agent Capabilities**
    *   [ ] Agents built to be easily observable and evaluatable
    *   [ ] Agents with frameworks for self-improvement
    *   [ ] AI-powered advice on multi-agent system architecture

    **Enterprise & Team Features**
    *   [ ] On-Premise / VPC Deployment
    *   [ ] Advanced IAM & Security Controls
    *   [ ] CI/CD Integration for validating AI-generated code

*   **Final CTA:** `Submit My Preferences`

**Why this way?**
This page executes the research goal perfectly. It strikes while the user's interest is highest to gather valuable data for validating the future roadmap before committing development resources.
