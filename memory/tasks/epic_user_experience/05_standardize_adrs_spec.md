# Story Spec: Standardize ADRs

**User Story:** As a project maintainer, I want all Architectural Decision Records (ADRs) to be consistently named and located, so they are easily discoverable and maintainable.

---

### Feature 5.1: Locate and Standardize Existing ADRs

**Description:** Find the existing ADRs (ADR-001 and ADR-002) and rename them to follow the standard `ADR-XXX-Description.md` format, ensuring they are all located in the `/docs/adr/` directory.

*   **Acceptance Criteria:**
    *   The original source files for ADR-001 and ADR-002 are identified.
    *   ADR-001 is renamed to `ADR-001-Use-Git-Submodules-for-Knowledge-Source.md` (or similar descriptive name).
    *   ADR-002 is renamed to `ADR-002-Decouple-Ingestion-Logic-into-a-Standalone-Engine.md` (or similar descriptive name).
    *   Both `ADR-001-*.md` and `ADR-002-*.md` files are located in the `/docs/adr/` directory.
    *   The `META_DOC.md` file is updated to reflect the new filenames and paths if necessary.

*   **Implementation Plan:**
    - [ ] Search the project for files containing the text "ADR-001" and "ADR-002" to locate their original source.
    - [ ] Read the content of the identified files to confirm they are the correct ADRs.
    - [ ] Rename the identified files to the standard `ADR-XXX-Description.md` format.
    - [ ] Move the renamed files to the `/docs/adr/` directory if they are not already there.
    - [ ] Update the `META_DOC.md` file to reference the new, standardized ADR filenames.
    - [ ] Create a pull request for review.
