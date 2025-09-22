# Backend Design: Waitlist & Survey API

This document outlines the data model, API endpoints, and interaction logic required to support the two-stage landing page defined in `landing_page_plan_v4.md`.

### 1. Core Architecture

The backend has two primary responsibilities:
1.  **Capture Waitlist Signups:** Securely receive and store an email address.
2.  **Capture Survey Responses:** Receive a user's feature preferences and associate them with their email.

This will be accomplished via two REST API endpoints and a simple relational database schema.

### 2. Technology Stack

The logic is simple and I/O-bound, making it suitable for a variety of modern web frameworks. The design is presented in a technology-agnostic way.

*   **Backend Framework:** FastAPI (Python) or Express (Node.js) are excellent choices due to their speed and ease of use for building simple APIs.
*   **Database:** PostgreSQL is recommended for its reliability and robust feature set.

### 3. Database Design

Two tables are required: one for users and one for their survey answers.

#### **Table 1: `waitlist_users`**
This table stores the core information for each user who joins the waitlist.

```sql
CREATE TABLE waitlist_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Use UUID to prevent ID enumeration.
    email VARCHAR(255) NOT NULL UNIQUE, -- Ensure each email can only sign up once.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Track when the user signed up.
);
```

*   **`id (UUID)`**: A universally unique identifier is used as the primary key. This is more secure than a sequential integer, as it prevents malicious users from guessing user IDs from a URL.
*   **`email (VARCHAR)`**: The user's email address, with a `UNIQUE` constraint to prevent duplicate entries.
*   **`created_at (TIMESTAMP)`**: A timestamp to record when the user joined the waitlist, which can be useful for cohort analysis.

#### **Table 2: `survey_responses`**
This table stores each individual feature preference selected by a user.

```sql
CREATE TABLE survey_responses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE, -- Foreign key to link to the user.
    feature_key VARCHAR(100) NOT NULL, -- A unique key for the selected feature.
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A composite unique index to prevent a user from submitting the same feature choice multiple times.
CREATE UNIQUE INDEX idx_user_feature ON survey_responses (user_id, feature_key);
```

*   **`user_id (UUID)`**: A foreign key that references `waitlist_users.id`. This creates the crucial link between a survey response and a user. `ON DELETE CASCADE` ensures data integrity by deleting a user's survey responses if the user record is ever deleted.
*   **`feature_key (VARCHAR)`**: A short, unique string identifier for the feature the user selected (e.g., `'cloud_hosted_server'`, `'cicd_integration'`). Using a key instead of the full text description is more efficient and robust.

### 4. API Endpoint Design

Two endpoints are needed to power the two stages of the funnel.

#### **Endpoint 1: Join Waitlist**

*   **Route:** `POST /api/join-waitlist`
*   **Purpose:** To add a new user to the waitlist.

**Request Body (JSON):**
```json
{
  "email": "developer@example.com"
}
```

**Backend Logic:**
1.  Validate that the `email` field is a properly formatted email address. If not, return a `400 Bad Request`.
2.  Check if the email already exists in the `waitlist_users` table.
    *   If it exists, do not create a new record. Respond with `200 OK` and the `userId` of the existing entry. This prevents duplicate entries and avoids signaling to a potential attacker which emails are already registered.
    *   If it does not exist, insert the new email into the `waitlist_users` table.
3.  Return a `201 Created` response containing the newly created (or existing) user's `id`.

**Success Response (JSON):**
```json
{
  "message": "Successfully joined the waitlist.",
  "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

#### **Endpoint 2: Submit Survey**

*   **Route:** `POST /api/submit-survey`
*   **Purpose:** To record the feature preferences for a given user.

**Request Body (JSON):**
```json
{
  "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "selectedFeatures": [
    "cloud_hosted_knowledge_server",
    "advanced_iam_security"
  ]
}
```

**Backend Logic:**
1.  Validate that the `userId` exists in the `waitlist_users` table. If not, return a `404 Not Found`.
2.  Iterate through the `selectedFeatures` array.
3.  For each `feature_key` in the array, attempt to insert a new row into the `survey_responses` table containing the `userId` and the `feature_key`.
4.  Wrap the insertion logic in a block that can gracefully handle potential unique constraint violations (e.g., `INSERT ... ON CONFLICT DO NOTHING`). This makes the endpoint idempotent.
5.  Return a `200 OK` response upon completion.

**Success Response (JSON):**
```json
{
  "message": "Survey preferences submitted successfully."
}
```

### 5. Frontend-Backend Interaction Workflow

1.  **On the Landing Page:** A user enters their email and clicks "Join the Waitlist."
2.  The frontend sends a `POST` request to `/api/join-waitlist` with the email.
3.  The backend processes the request and returns a `JSON` response containing the `userId`.
4.  **Crucial Step:** Upon receiving a successful response, the frontend extracts the `userId` and immediately redirects the user to the "Thank You" page, passing the `userId` as a URL query parameter (e.g., `/thank-you?userId=...`).
5.  **On the "Thank You" Page:** The page's JavaScript reads the `userId` from the URL query parameters.
6.  The user selects their preferred features using checkboxes.
7.  When the user clicks "Submit My Preferences," the frontend gathers the `feature_key` values from all selected checkboxes.
8.  The frontend sends a `POST` request to `/api/submit-survey`, with a body containing the `userId` (from the URL) and the array of `selectedFeatures`.
9.  The backend stores the preferences, and the frontend can then display a final confirmation message.
