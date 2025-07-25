# Guide: Project Management & Documentation

This document outlines the standard, hierarchical approach for managing epics, stories, and tasks within the `langgraph-dev-navigator` project. Its purpose is to ensure consistency, prevent documentation drift, and provide a clear, scalable framework for tracking work.

This guide should be considered the standard for all new initiatives.

---

### The Problem: Documentation Drift

In any project, it's easy for plans, specifications, and task lists to become disconnected. When a requirement changes in one document, it's often not updated in another, leading to confusion and errors. This guide establishes a system to prevent this by defining a single source of truth for each level of detail.

### The Hierarchical Model: Epic -> Story -> Task

We organize work into a clear hierarchy. This allows us to zoom in and out, understanding the big picture (the Epic) without losing the details of implementation (the Tasks).

*   **Epic:** A large-scale initiative or major feature area (e.g., "Improve User Experience," "Implement Caching Layer").
    *   **Representation:** A folder within `/memory/tasks/`, named `epic_[name]`. For example: `/memory/tasks/epic_user_experience/`.

*   **Story:** A valuable, self-contained feature that is part of an Epic (e.g., "Overhaul the README," "Create an Automation Script").
    *   **Representation:** A numbered `_spec.md` file within its Epic folder. For example: `01_readme_overhaul_spec.md`.

*   **Task:** A specific engineering step required to complete a Story (e.g., "Add a 'How It Works' section to the README").
    *   **Representation:** A checklist item (`- [ ]`) inside a Story's spec file.

### Document Roles & Responsibilities

This system relies on each document having a clear and distinct purpose.

1.  **The Epic Dashboard (`tasks_plan.md`)**
    *   **Location:** At the root of an Epic's folder (e.g., `/epic_user_experience/tasks_plan.md`).
    *   **Purpose:** To be the high-level **project dashboard** for the entire Epic. It tracks the status and priority of all Stories within that Epic.
    *   **Audience:** Project leads and stakeholders.
    *   **Key Feature:** It **links** to the detailed Story specs; it does not duplicate their content.

2.  **The Story Blueprint (`[story_name]_spec.md`)**
    *   **Location:** Inside the Epic folder.
    *   **Purpose:** To be the **single source of truth** for implementing one specific Story. It is an all-in-one "work packet" for a developer.
    *   **Audience:** The developer(s) implementing the Story.
    *   **Contents:**
        *   **User Story:** The "Why" - who needs this and for what reason.
        *   **Acceptance Criteria:** The "What" - a clear, testable definition of "done."
        *   **Implementation Plan:** The "How" - a detailed checklist of all engineering tasks required.

### The Workflow in Practice

1.  A **Project Lead** reviews the Epic Dashboard (`tasks_plan.md`) to see the overall status.
2.  A **Developer** is assigned a Story. They navigate to the dashboard and click the link to the relevant `_spec.md` file.
3.  The developer works directly from the spec file, using the embedded task checklist to guide their implementation.
4.  If a requirement changes, the developer updates both the Acceptance Criteria and the task list *within that same spec file*, ensuring they never go out of sync.
5.  Once all tasks are complete and the acceptance criteria are met, the developer updates the Story's status on the Epic Dashboard to "Done."

### Handling Common Scenarios

*   **How do I handle a task that affects multiple stories (e.g., End-to-End Testing)?**
    *   **Solution:** Promote it to its own Story. A cross-cutting concern is a feature in itself. Add a new line item to the Epic Dashboard for "End-to-End Validation" and create a corresponding spec file for it. This keeps other specs clean.

*   **What if a Story becomes too large and its spec file has hundreds of tasks?**
    *   **Solution:** This is a sign that the Story is actually an Epic. Refactor it. Create a new `epic_[new_name]` folder, give it its own `tasks_plan.md`, and break the single, massive spec file into multiple, smaller, more manageable Story specs within the new epic folder.
