# Story Spec: AI Assistant Instruction Setup

**User Story:** As a developer, I want to run a single script to automatically install the project-specific instructions for my chosen AI coding assistant, so I can ensure it follows the correct development methodology without excessive configuration.

---

### Feature 7.1: Create Pragmatic, Interactive Python Setup Script

**Description:** Develop a user-friendly Python script that automates the installation of LangGraph development instructions. The script will use a simplified, pragmatic approach suitable for a Proof of Concept, differentiating its behavior for assistants with shared vs. project-specific rule files.

*   **Acceptance Criteria:**
    *   A script named `src/setup_dev_assistant.py` exists in the project root.
    *   The script categorizes assistants into two types:
        *   **Shared File Assistants:** (Claude, Codex, Gemini, GitHub Copilot) where the rule file might be shared with other user instructions.
        *   **Project-Specific File Assistants:** (CLine, Cursor, Roo, Windsurf) where the rule file is specific to this project.
    *   For **Shared File Assistants**, if the destination file exists, the script **appends** the rules to the end of the file without prompting.
    *   For **Project-Specific File Assistants**, if the destination file exists, the script **prompts the user for confirmation (y/n)** before overwriting.
    *   The script correctly copies or appends the source instruction file (`langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction/langgraph-ai-rules_v2.md`).
    *   The script prints a clear success message for the action taken (appended, created, or overwritten).

*   **Implementation Plan:**
    - [ ] Create the `src/setup_dev_assistant.py` file.
    - [ ] Use a dictionary to map assistant names to their destination paths and a "type" (shared/specific).
    - [ ] Implement an interactive menu to prompt the user for their assistant choice.
    - [ ] Implement conditional logic based on the assistant's type and whether the destination file exists (`os.path.exists()`).
    - [ ] For the "append" case, open the file in append mode (`'a'`) and write the new rules.
    - [ ] For the "overwrite" case, use `shutil.copy()`.
    - [ ] Add `print()` statements for user feedback.
    - [ ] Update the root `README.md` to instruct users to run `uv run python src/setup_dev_assistant.py`.
    - [ ] Create a pull request for review.
