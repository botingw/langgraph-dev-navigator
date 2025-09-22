# Implementation Plan: Landing Page & Waitlist System

**Guiding Principle:** This document provides a detailed, content-aware implementation plan for the "Create Landing Page & Waitlist System" epic. It breaks the work into three sequential stories, with a granular task list for the frontend implementation that directly corresponds to the content and structure defined in `landing_page_plan_v4.md`.

---

### **Story 1: Implement Frontend for Two-Stage Funnel**

*   **User Story:** As a potential user, I want to visit a landing page to understand the project's value and sign up for a waitlist, after which I can provide feedback on desired features.
*   **Acceptance Criteria:**
    *   `index.html` and `thank-you.html` are created in the `web/gemini/` directory, and their content and structure match the V4 plan.
    *   The pages are responsive and styled with a clean, dark theme.
    *   The frontend flow (from waitlist submission to survey completion) is functional using simulated API calls.
*   **Implementation Tasks:**

    *   `[ ]` **Task 1: Setup and Hero Section**
        *   Create the file `web/gemini/index.html`.
        *   Implement the **Hero Section** HTML, including the `<h1>Stop Fighting AI Hallucinations.</h1>` headline, the sub-headline, and the email submission form as specified in the V4 plan.
        *   Create a `web/gemini/style.css` file and add the basic styling (dark theme, typography, layout).

    *   `[ ]` **Task 2: "Pain & Gain" Section**
        *   Implement the **"Tired of Plausible-but-Wrong AI Code?"** section.
        *   Create the two-panel layout using HTML and CSS.
        *   Style two `<div>` elements to look like terminal windows for the "Before" (error message) and "After" (success message) visuals.

    *   `[ ]` **Task 3: Workflow & Philosophy Sections**
        *   Implement the **"Methodical Workflow"** section, including the placeholder for the workflow diagram image.
        *   Implement the **"An Open-Source Experiment in AI Reliability"** section, creating the three-column layout for the metrics.

    *   `[ ]` **Task 4: FAQ and Footer**
        *   Implement the **FAQ section** using `<details>` and `<summary>` tags for the three questions defined in the V4 plan.
        *   Add a simple footer with links to the GitHub repository.

    *   `[ ]` **Task 5: Waitlist Submission Logic (`index.html`)**
        *   Add a `<script>` tag to `index.html`.
        *   Implement the JavaScript to handle the waitlist form submission.
        *   This script will **simulate** a backend call, wait for 1 second, and then redirect to `thank-you.html?userId=<dummy-user-id>`.

    *   `[ ]` **Task 6: Survey Page (`thank-you.html`)**
        *   Create the file `web/gemini/thank-you.html`.
        *   Implement the HTML for the "Thank You & Survey" page, including the categorized checkboxes for all future features from the V4 plan.
        *   Link the same `style.css` and add any additional styles needed.

    *   `[ ]` **Task 7: Survey Submission Logic (`thank-you.html`)**
        *   Add a `<script>` tag to `thank-you.html`.
        *   Implement the JavaScript to read the `userId` from the URL.
        *   On form submission, the script will collect the selected feature keys and **simulate** a successful API call, then replace the form with a final "Thank you for your feedback!" message.

    *   `[ ]` **Task 8: Final Review**
        *   Perform a final review of both pages in a browser to ensure all content from the V4 plan is present, the styling is correct, and the simulated frontend flow works as expected.

---

### **Story 2: Implement Backend API and Database**

*   **User Story:** As the project owner, I need a backend service to securely store emails from the waitlist and associate them with user-selected feature preferences, as defined in the API design.
*   **Acceptance Criteria:**
    *   The database schema (`waitlist_users`, `survey_responses`) is created.
    *   The `POST /api/join-waitlist` endpoint is functional and correctly handles new and duplicate emails.
    *   The `POST /api/submit-survey` endpoint is functional and correctly associates survey responses with a user.
    *   The API is containerized using a `Dockerfile`.
*   **Implementation Tasks:**
    *   `[ ]` Choose a backend framework (e.g., FastAPI with Python).
    *   `[ ]` Create a new directory for the API (e.g., `/api`).
    *   `[ ]` Write a SQL script or use an ORM to define and create the database tables.
    *   `[ ]` Implement the `/api/join-waitlist` endpoint logic, including email validation.
    *   `[ ]` Implement the `/api/submit-survey` endpoint logic, including `userId` validation.
    *   `[ ]` Add unit tests for both API endpoints.
    *   `[ ]` Create a `Dockerfile` to containerize the backend service.

---

### **Story 3: Deploy and Integrate**

*   **User Story:** As a user, I want to be able to access the landing page via a public URL. As the project owner, I want the backend API to be running and accessible by the frontend.
*   **Acceptance Criteria:**
    *   The static frontend (`web/gemini/`) is deployed and publicly accessible.
    *   The backend API is deployed to a cloud host and is publicly accessible.
    *   The frontend is configured to communicate with the deployed backend API.
    *   The end-to-end flow is confirmed to be working in the production environment.
*   **Implementation Tasks:**
    *   `[ ]` Choose and configure a hosting service for the static frontend (e.g., GitHub Pages).
    *   `[ ]` Choose and configure a hosting service for the backend container and database (e.g., Fly.io, Heroku, AWS).
    *   `[ ]` Deploy the backend API container.
    *   `[ ]` Update the JavaScript in `index.html` to remove the simulation logic and replace it with a `fetch` call to the live backend URL.
    *   `[ ]` Update the JavaScript in `thank-you.html` similarly.
    *   `[ ]` Deploy the final version of the frontend.
    *   `[ ]` Conduct a final end-to-end test on the live production URL.
